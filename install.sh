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

installNode8 ()
{
	#This installs node 8 using apt https://nodejs.org/en/download/package-manager/
	curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
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

promptNode8Install()
{
  #This warns users in case they already have a version of node installed
	clear
	read -p "Node version 8 is not installed but is required.  Would you like this script to install it for you? Warning this could replace your current version of nodejs with version 8.\n" yn
                case $yn in
                        [Yy]* ) installNode8;;
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
	
	#Make sure node version 8 and npm are installed.  If not this should ask if you want to install.
	[[ $(node -v) =~ "v8." ]] || promptNode8Install

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
	printf "Enter a password for the asset tracking database service account user that this script will create:\n"
	read databaseServicePassword
	clear
	printf "Enter a password for the database sa account that this script will create:\n"
	read mySqlPassword
	clear
	printf "Enter a secret that will be used to sign session cookies:\n"
	read cookieSecret
	clear
	printf "Enter the port you would like the web server to listen on for HTTPS (usually 443):\n"
	read serverPort
	clear
	printf "Enter the address of the email server that you would like to use for notifications.  Example: smtp.office365.com:\n"
	read emailServer
	clear
	printf "Enter the SMTP port of the email server.  Usually 25 or 587:\n"
	read smtpPort
	clear
	printf "Enter the email address that will be used to send notifications:\n"
	read emailSender
	clear
	printf "Enter the username for the email address that will be used to send notifications.  This is often the same as the email address:\n"
	read emailSenderUsername
	clear
	printf "Enter the password for the email address that will be used to send notifications:\n"
	read emailSenderPassword
	clear
	printf "Enter the email address that will receive notifications:\n"
	read emailRecipient
	clear
	printf "Will the email server require tls?:\n"
	select yn in "Yes" "No"; do
    case $yn in
        Yes ) emailTls=True; break;;
        No ) emailTls=False; break;;
    esac
	done
	clear
	printf "Type each network range that you would like to scan followed by Enter (example: 192.168.2.0/24).  When you are done press Enter on an empty line.:\n"
	networkRanges=()

	while true; do
  	read networkRange
    if [[ $networkRange =~ ^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$ ]]; then
    	printf "Added\n"
      networkRanges+=(\""$networkRange"\")
    elif [[ -z $networkRange ]]; then
			configNetworkRanges='['$(IFS=, ; echo "${networkRanges[*]}")']'
    	break;
    else
    	printf "Invalid\n"
    fi
  done
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

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE TABLE AssetTracking.Assets (MAC varchar(50) NOT NULL, Name varchar(50) DEFAULT NULL, Description varchar(1000) DEFAULT NULL, Notes varchar(1000) DEFAULT NULL, Vendor varchar(1000) DEFAULT NULL, IP varchar(1000) DEFAULT NULL, Whitelisted BIT(1) NOT NULL DEFAULT b'0', Guest BIT(1) NOT NULL DEFAULT b'0', AssetType INT NOT NULL DEFAULT 1, FOREIGN KEY (AssetType) REFERENCES AssetTypes(ID), LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (MAC));"
	
	#Default credentials are admin@localhost / password
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO users (userEmail, userPass, userRole) VALUES ('admin@localhost', '\$2a\$10\$tkFug74.OQ8MLiOdbEQeG.nQ2kCyPH65LdCduM6Y3IeQdNWv9gBt2', 1);"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE VIEW usersWithRoles AS SELECT users.id, users.userEmail, users.userPass, users.userRole, roles.roleName FROM users INNER JOIN roles ON users.userRole=roles.id;"

	mysql -uroot -p${mySqlPassword} -e "CREATE USER 'AssetTracking_User'@'localhost' IDENTIFIED BY '${databaseServicePassword}';"

	mysql -uroot -p${mySqlPassword} -e "GRANT ALL ON AssetTracking.* TO 'AssetTracking_User'@'localhost'"

	#Default AssetType
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO AssetTypes (Name) VALUES ('Unclassified');"

	#Example inserting data into Assets table
	#mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO Assets (MAC, IP) VALUES ('00-01-00-01-21-84-4B-25-B4-AE-2B-CE-A8-1E', '192.168.1.240');"

	#Example upsert
	#INSERT INTO Assets (MAC, IP) VALUES('00-01-00-01-21-84-4B-25-B4-AE-2B-CE-A8-1F','192.168.1.251') ON DUPLICATE KEY UPDATE  IP = VALUES(IP), LastUpdated = CURRENT_TIMESTAMP;
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
	echo "	\"CidrRanges\": ${configNetworkRanges}," >> ./private/config.js
	echo "	\"emailServer\": \"${emailServer}\"," >> ./private/config.js
	echo "	\"smtpPort\": ${smtpPort}," >> ./private/config.js
	echo "	\"emailSender\": \"${emailSender}\"," >> ./private/config.js
	echo "	\"emailSenderUsername\": \"${emailSenderUsername}\"," >> ./private/config.js
	echo "	\"emailSenderPassword\": \"${emailSenderPassword}\"," >> ./private/config.js
	echo "	\"emailRecipient\": \"${emailRecipient}\"," >> ./private/config.js
	echo "	\"emailTls\": \"${emailTls}\"," >> ./private/config.js
	echo "	\"environment\": \"production\"," >> ./private/config.js
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