#!/bin/bash
checkIfSudo ()
{
	#This makes sure the install script was run with sudo.  It requires root for some actions.
        if [ "$(whoami)" != 'root' ]
        then
                printf "You forgot sudo..."
                exit 1
        else
                return 0
        fi
}

installCurl ()
{
	apt-get install curl -y
}

installNode6 ()
{
	#This installs node 6 using apt https://nodejs.org/en/download/package-manager/
	curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
	apt-get install -y nodejs
	apt-get install -y build-essential
}

installMYSQL ()
{
  #This installs mysql and runs a script to set some basic security options
	apt-get install -y mysql-server
	mysql_secure_installation
	systemctl enable mysql
}

promptNode6Install()
{
  #This warns users in case they already have a version of node installed
	clear
	read -p "Node version 6 is not installed but is required.  Would you like this script to install it for you? Warning this could replace your current version of nodejs with version 6.\n" yn
                case $yn in
                        [Yy]* ) installNode6;;
                        [Nn]* ) exit;;
                * ) printf "Please answer yes to attempt to install node or no to quit.\n";;
        esac
}

checkPrerequisites ()
{
	#Make sure curl is installed
	if curl -V | grep --quiet "Release"
	then
		printf "curl already installed.\n"
	else
		installCurl
	fi
	
	#Make sure node version 6 and npm are installed.  If not this should ask if you want to install.
	[[ $(node -v) =~ "v6." ]] || promptNode6Install

	#Check for npm just in case
	command -v npm >/dev/null 2>&1 || { echo >&2 "Npm is not installed.  Please install the npm package and run setup again.  https://nodejs.org/en/download/package-manager/  Aborting."; exit 1; }

	#Check for mysql
	if mysql -V | grep --quiet "Ver"
	then
		printf "My SQL is already installed.\n"
	else
		installMYSQL
	fi

  #Install required node packages
	npm install
}

collectInformation ()
{
	#This asks the user a series of questions used to setup the config file.
	clear
	printf "Enter a password for the asset tracking database service account user:\n"
	read databaseServicePassword
	clear
	printf "Enter a password for the database sa account:\n"
	read mySqlPassword
	clear
	printf "Enter a secret used to sign session cookies:\n"
	read cookieSecret
	printf "Enter the port you would like the web server to listen on for HTTPS (usually 443)"
	read serverPort
}

createDatabase ()
{
	#This should create the MYSQL database
	mysql -uroot -p${mySqlPassword} -e "CREATE DATABASE AssetTracking;"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE TABLE AssetTracking.roles (id INT NOT NULL AUTO_INCREMENT, roleName varchar(32) NOT NULL UNIQUE, PRIMARY KEY (id));"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE TABLE AssetTracking.users (id INT NOT NULL AUTO_INCREMENT, userEmail varchar(1000) NOT NULL UNIQUE, userPass varchar(1000) NOT NULL, userRole INT NOT NULL, FOREIGN KEY (userRole) REFERENCES roles(id),PRIMARY KEY (id));"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO roles (roleName) VALUES ('admin');"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO roles (roleName) VALUES ('user');"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE TABLE AssetTracking.AssetTypes (ID INT NOT NULL AUTO_INCREMENT, Name varchar(100) DEFAULT NULL, PRIMARY KEY (ID));"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE TABLE AssetTracking.Assets (MAC varchar(50) NOT NULL, Name varchar(50) DEFAULT NULL, Description varchar(1000) DEFAULT NULL, Notes varchar(1000) DEFAULT NULL, IP varchar(1000) DEFAULT NULL, Whitelisted BIT(1) NOT NULL DEFAULT b'0', Guest BIT(1) NOT NULL DEFAULT b'0', AssetType INT NOT NULL DEFAULT 1, FOREIGN KEY (AssetType) REFERENCES AssetTypes(ID), LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (MAC));"
	
	#Default credentials are admin@localhost / password
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO users (userEmail, userPass, userRole) VALUES ('admin@localhost', '\$2a\$10\$tkFug74.OQ8MLiOdbEQeG.nQ2kCyPH65LdCduM6Y3IeQdNWv9gBt2', 1);"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE VIEW usersWithRoles AS SELECT users.id, users.userEmail, users.userPass, users.userRole, roles.roleName FROM users INNER JOIN roles ON users.userRole=roles.id;"

	mysql -uroot -p${mySqlPassword} -e "CREATE USER 'AssetTracking_User'@'localhost' IDENTIFIED BY '${databaseServicePassword}';"

	mysql -uroot -p${mySqlPassword} -e "GRANT ALL ON AssetTracking.* TO 'AssetTracking_User'@'localhost'"

	#Default AssetType
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO AssetTypes (Name) VALUES ('Unclassified');"

	#Example inserting data into Assets table
	#mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO Assets (MAC, IP) VALUES ('00-01-00-01-21-84-4B-25-B4-AE-2B-CE-A8-1E', '192.168.1.240');"


}

generateSelfSignedCerts ()
{
  #User openssl to genererate a self signed cert for HTTPS connections
	[[ -d ./private/certificates ]] || mkdir ./private/certificates
	openssl req \
	-new \
	-newkey rsa:4096 \
	-days 1000 \
	-nodes \
	-x509 \
	-subj "/C=US/ST=MA/L=Boston/O=Nope/CN=AssetTracking" \
	-keyout ./private/certificates/server.key \
	-out ./private/certificates/server.crt
}

createConfig ()
{
	echo "module.exports = {" > ./private/config.js
	echo "	\"dbAddress\": \"127.0.0.1\"," >> ./private/config.js
	echo "	\"dbPort\": 1433," >> ./private/config.js
	echo "	\"dbUser\": \"AssetTracking_User\"," >> ./private/config.js
	echo "	\"dbPassword\": \"${databaseServicePassword}\"," >> ./private/config.js
	echo "	\"dbName\": \"AssetTracking\"," >> ./private/config.js
	echo "	\"serverPort\": ${serverPort}," >> ./private/config.js
	echo "	\"cookieSecret\": \"${cookieSecret}\"," >> ./private/config.js
	echo "	\"hashStrength\": 10" >> ./private/config.js
	echo "}" >> ./private/config.js
}

allowPort443 ()
{
	#Allows node to listen on port 443 without requiring sudo
	sudo setcap 'cap_net_bind_service=+ep' $(readlink -f $(which node))
}

checkIfSudo
collectInformation
checkPrerequisites
createDatabase
generateSelfSignedCerts
createConfig
allowPort443