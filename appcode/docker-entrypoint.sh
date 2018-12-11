#!/bin/bash
set -eo pipefail
shopt -s nullglob

#Prepmysql
_check_config() {
	toRun=( mysqld --verbose --help )
	if ! errors="$("${toRun[@]}" 2>&1 >/dev/null)"; then
		cat >&2 <<-EOM
			ERROR: mysqld failed while attempting to check config
			command was: "${toRun[*]}"
			$errors
		EOM
		exit 1
	fi
}

# Fetch value from server config
# We use mysqld --verbose --help instead of my_print_defaults because the
# latter only show values present in config files, and not server defaults
_get_config() {
	local conf="$1"; shift
	"$@" --verbose --help --log-bin-index="$(mktemp -u)" 2>/dev/null \
		| awk '$1 == "'"$conf"'" && /^[^ \t]/ { sub(/^[^ \t]+[ \t]+/, ""); print; exit }'
	# match "datadir      /some/path with/spaces in/it here" but not "--xyz=abc\n     datadir (xyz)"
}

_check_config mysqld
DATADIR="$(_get_config 'datadir' mysqld)"
mkdir -p "$DATADIR"

echo "MYSQL ROOT PASSWORD: $DB_ROOT_PASSWORD"

if [ ! -f "$DATADIR/server-key.pem" ]; then
  echo 'Initializing database'
  mysqld --initialize-insecure
  echo 'Database initialized'

	if command -v mysql_ssl_rsa_setup > /dev/null && [ ! -e "$DATADIR/server-key.pem" ]; then
				# https://github.com/mysql/mysql-server/blob/23032807537d8dd8ee4ec1c4d40f0633cd4e12f9/packaging/deb-in/extra/mysql-systemd-start#L81-L84
				echo 'Initializing certificates'
				mysql_ssl_rsa_setup --datadir="$DATADIR"
				echo 'Certificates initialized'
	fi

	SOCKET="$(_get_config 'socket' mysqld)"

	chown -R mysql:mysql "$DATADIR"

	gosu mysql mysqld --skip-networking --socket="${SOCKET}" & pid="$!"
	mysql=( mysql --protocol=socket -uroot -hlocalhost --socket="${SOCKET}" )

	for i in {30..0}; do
		if echo 'SELECT 1' | "${mysql[@]}" &> /dev/null; then
			break
		fi
		echo 'MySQL init process in progress...'
		sleep 1
	done

	if [ "$i" = 0 ]; then
				echo >&2 'MySQL init process failed.'
				exit 1
	fi

	if [ -z "$MYSQL_INITDB_SKIP_TZINFO" ]; then
				# sed is for https://bugs.mysql.com/bug.php?id=20545
				mysql_tzinfo_to_sql /usr/share/zoneinfo | sed 's/Local time zone must be set--see zic manual page/FCTY/' | "${mysql[@]}" mysql
	fi

	rootCreate=
	# default root to listen for connections from anywhere
	export 'MYSQL_ROOT_HOST'='%'
	if [ ! -z "$MYSQL_ROOT_HOST" -a "$MYSQL_ROOT_HOST" != 'localhost' ]; then
		# no, we don't care if read finds a terminating character in this heredoc
		# https://unix.stackexchange.com/questions/265149/why-is-set-o-errexit-breaking-this-read-heredoc-expression/265151#265151
		read -r -d '' rootCreate <<-EOSQL || true
			CREATE USER 'root'@'${MYSQL_ROOT_HOST}' IDENTIFIED BY '${DB_ROOT_PASSWORD}' ;
			GRANT ALL ON *.* TO 'root'@'${MYSQL_ROOT_HOST}' WITH GRANT OPTION ;
		EOSQL
	fi

	"${mysql[@]}" <<-EOSQL
		-- What's done in this file shouldn't be replicated
		--  or products like mysql-fabric won't work
		SET @@SESSION.SQL_LOG_BIN=0;
		ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_ROOT_PASSWORD}' ;
		GRANT ALL ON *.* TO 'root'@'localhost' WITH GRANT OPTION ;
		${rootCreate}
		DROP DATABASE IF EXISTS test ;
		FLUSH PRIVILEGES ;
	EOSQL

	mysql+=( -p"${DB_ROOT_PASSWORD}" )

	echo "DB_USER: $DB_USER"
	echo "DB_PASSWORD: $DB_PASSWORD"

	echo "CREATE USER IF NOT EXISTS '${DB_USER}'@'${MYSQL_ROOT_HOST}' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD' ;" | "${mysql[@]}"


	### Build AssetTracking Database
	echo "CREATE DATABASE IF NOT EXISTS AssetTracking;" | "${mysql[@]}"

	mysql+=( --database=AssetTracking )

	mysql -uroot -p${DB_ROOT_PASSWORD} -D AssetTracking < ./private/schema.sql

	echo "GRANT ALL ON AssetTracking.* TO '${DB_USER}'@'${MYSQL_ROOT_HOST}' ;" | "${mysql[@]}"
	echo 'FLUSH PRIVILEGES ;' | "${mysql[@]}"

	#defalut roles
	echo "INSERT INTO roles (roleName) VALUES ('admin');" | "${mysql[@]}"
	echo "INSERT INTO roles (roleName) VALUES ('user');" | "${mysql[@]}"

	#default account admin/admin
	echo "INSERT INTO users (userName, userPass, userRole) VALUES ('admin', '\$2a\$10\$/tUV6VYUUnblcZK2RFEc9udR8IIz05F4JpIgC75NpMZHR3Gq8gq0i', 1);" | "${mysql[@]}"

	#default asset types
	echo "INSERT INTO AssetTypes (Name) VALUES ('Unclassified');" | "${mysql[@]}"
	echo "INSERT INTO AssetTypes (Name) VALUES ('Desktop');" | "${mysql[@]}"
	echo "INSERT INTO AssetTypes (Name) VALUES ('Laptop');" | "${mysql[@]}"
	echo "INSERT INTO AssetTypes (Name) VALUES ('Printer');" | "${mysql[@]}"
	echo "INSERT INTO AssetTypes (Name) VALUES ('Phone');" | "${mysql[@]}"
	echo "INSERT INTO AssetTypes (Name) VALUES ('Server');" | "${mysql[@]}"
	echo "INSERT INTO AssetTypes (Name) VALUES ('Firewall');" | "${mysql[@]}"
	echo "INSERT INTO AssetTypes (Name) VALUES ('Switch');" | "${mysql[@]}"

	if ! kill -s TERM "$pid" || ! wait "$pid"; then
		echo >&2 'MySQL init process failed.'
		exit 1
	fi
fi

echo
echo 'MySQL init process done. Ready for start up.'
echo

exec gosu mysql mysqld &

#Setup node app
generateSelfSignedCerts ()
{
  #User openssl to genererate a self signed cert for HTTPS connections
	[[ -d /usr/src/app/private/certificates ]] || mkdir /usr/src/app/private/certificates
  if [ ! -f /usr/src/app/private/certificates/server.crt ]; then
    openssl req \
    -new \
    -newkey rsa:4096 \
    -days 1000 \
    -nodes \
    -x509 \
    -subj "/C=US/ST=MA/L=Boston/O=Nope/CN=AssetTracking" \
    -keyout /usr/src/app/private/certificates/server.key \
    -out /usr/src/app/private/certificates/server.crt
  fi
	chown -R node:node /usr/src/app/private/certificates
}

generateSelfSignedCerts
export 'COOKIE_SECRET'="$(pwgen -1 32)"

exec gosu node "$@"