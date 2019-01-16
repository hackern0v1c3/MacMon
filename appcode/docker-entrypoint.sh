#!/bin/bash
set -eo pipefail
shopt -s nullglob

#Prepmysql
_check_config() {
	toRun=( mysqld --verbose --help --log-bin-index="$(mktemp -u)" )
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
	mysqld --verbose --help --log-bin-index="$(mktemp -u)" 2>/dev/null \
		| awk '$1 == "'"$conf"'" && /^[^ \t]/ { sub(/^[^ \t]+[ \t]+/, ""); print; exit }'
	# match "datadir      /some/path with/spaces in/it here" but not "--xyz=abc\n     datadir (xyz)"
}

# Initializes MySql environment and builds keys
_init_mysql() {
	_check_config
	DATADIR="$(_get_config 'datadir' )"

	if [ ! -d "$DATADIR/mysql" ]; then
		mkdir -p "$DATADIR"

    echo 'Initializing database'
    # "Other options are passed to mysqld." (so we pass all "mysqld" arguments directly here)
    mysql_install_db --datadir="$DATADIR" --rpm
    echo 'Database initialized'

		SOCKET="$(_get_config 'socket')"

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

		echo "Creating root account"

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
			DELETE FROM mysql.user WHERE user NOT IN ('mysql.sys', 'mysqlxsys', 'root') OR host NOT IN ('localhost') ;
			SET PASSWORD FOR 'root'@'localhost'=PASSWORD('${DB_ROOT_PASSWORD}') ;
			GRANT ALL ON *.* TO 'root'@'localhost' WITH GRANT OPTION ;
			${rootCreate}
			DROP DATABASE IF EXISTS test ;
			FLUSH PRIVILEGES ;
		EOSQL

		if ! kill -s TERM "$pid" || ! wait "$pid"; then
			echo >&2 'MySQL init process failed.'
			exit 1
		fi
	fi

  gosu mysql mysqld --socket="${SOCKET}" & pid="$!"

  echo "Local mysql init complete"
}

# tries to connect to database with root account
_test_connect_db() {
	echo "Creating mysql database if it does not already exist"

	#try logging into mysql as root 
	mysql=( mysql -uroot -p"${DB_ROOT_PASSWORD}" -h"${DB_ADDRESS}" -P"${DB_PORT}" )

	for i in {30..0}; do
		if echo 'SELECT 1' | "${mysql[@]}" &> /dev/null; then
			break
		fi
		echo 'Attempting to log into mysql...'
		sleep 1
	done

	if [ "$i" = 0 ]; then
				echo >&2 'MySQL login process failed.'
				exit 1
	fi	
	
	#create mysql user if it doesn't already exist
	echo "CREATE USER IF NOT EXISTS '${DB_USER}'@'${MYSQL_ROOT_HOST}' IDENTIFIED BY '$DB_PASSWORD' ;" | "${mysql[@]}"

	### Build database if it doesn't already exist
	echo "CREATE DATABASE IF NOT EXISTS AssetTracking;" | "${mysql[@]}"

	#if no error
	if [ $? -eq 0 ]; then
		echo "connected to mysql"
		CONNECTED_TO_MYSQL='true'
	else
		echo "could not connect to mysql"
		CONNECTED_TO_MYSQL='false'
	fi
}

# sets up tables, default user, and other default values
_populate_database() {
	#get count of tables in database
	
	TABLE_COUNT=`mysql -uroot -p"${DB_ROOT_PASSWORD}" -h"${DB_ADDRESS}" -P"${DB_PORT}" -s -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'AssetTracking';"`
	echo "Table count: ${TABLE_COUNT}"

	if [ $TABLE_COUNT != "8" ]; then

		echo "Creating database user account"
		mysql=( mysql -uroot -p"${DB_ROOT_PASSWORD}" -h"${DB_ADDRESS}" -P"${DB_PORT}" )

		mysql -uroot -p${DB_ROOT_PASSWORD} -D AssetTracking < ./private/backups/newdb.sql

		echo "GRANT ALL ON AssetTracking.* TO '${DB_USER}'@'${MYSQL_ROOT_HOST}' ;" | "${mysql[@]}"
		echo 'FLUSH PRIVILEGES ;' | "${mysql[@]}"

		echo "Inserting default database values"
		mysql=( mysql -uroot -p"${DB_ROOT_PASSWORD}" -h"${DB_ADDRESS}" -P"${DB_PORT}" -D AssetTracking)
		#defalut roles
		echo "INSERT INTO roles (roleName) VALUES ('admin');" | "${mysql[@]}"
		echo "INSERT INTO roles (roleName) VALUES ('user');" | "${mysql[@]}"

		#default account admin/admin
		echo "INSERT INTO users (userName, userPass, userRole) VALUES ('admin', '\$2a\$10\$/tUV6VYUUnblcZK2RFEc9udR8IIz05F4JpIgC75NpMZHR3Gq8gq0i', 1);" | "${mysql[@]}"
		node ./bin/reset_admin_password.js

		#default asset types
		echo "INSERT INTO AssetTypes (Name) VALUES ('Unclassified');" | "${mysql[@]}"
		echo "INSERT INTO AssetTypes (Name) VALUES ('Desktop');" | "${mysql[@]}"
		echo "INSERT INTO AssetTypes (Name) VALUES ('Laptop');" | "${mysql[@]}"
		echo "INSERT INTO AssetTypes (Name) VALUES ('Printer');" | "${mysql[@]}"
		echo "INSERT INTO AssetTypes (Name) VALUES ('Phone');" | "${mysql[@]}"
		echo "INSERT INTO AssetTypes (Name) VALUES ('Server');" | "${mysql[@]}"
		echo "INSERT INTO AssetTypes (Name) VALUES ('Firewall');" | "${mysql[@]}"
		echo "INSERT INTO AssetTypes (Name) VALUES ('Switch');" | "${mysql[@]}"

		echo "Finished populating database"

	fi
}

#Begin script entrypoint
echo "MYSQL ADDRESS: $DB_ADDRESS"
echo "MYSQL PORT: $DB_PORT"
echo "DB_USER: $DB_USER"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "MYSQL ROOT PASSWORD: $DB_ROOT_PASSWORD"

if [ "$NO_LOCAL_DB" != "true" ]; then
	echo "Going to initialize local database"
	_init_mysql
fi

_test_connect_db

if [ "$CONNECTED_TO_MYSQL" == "false" ]; then
	echo >&2 'unable to connect to mysql'
	exit 1
fi

_populate_database

if [ "$NO_LOCAL_DB" != "true" ]; then
	if ! kill -s TERM "$pid" || ! wait "$pid"; then
		echo >&2 'MySQL init process failed.'
		exit 1
	fi

	echo
	echo 'MySQL init process done. Ready for start up.'
	echo

	exec gosu mysql mysqld &
fi

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

exec gosu $RUN_AS "$@"