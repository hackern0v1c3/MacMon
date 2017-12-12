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

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE TABLE AssetTracking.users (id INT NOT NULL AUTO_INCREMENT, userName varchar(1000) NOT NULL UNIQUE, userPass varchar(1000) NOT NULL, userRole INT NOT NULL, FOREIGN KEY (userRole) REFERENCES roles(id),PRIMARY KEY (id));"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO roles (roleName) VALUES ('admin');"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO roles (roleName) VALUES ('user');"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE TABLE AssetTracking.AssetTypes (ID INT NOT NULL AUTO_INCREMENT, Name varchar(100) DEFAULT NULL, PRIMARY KEY (ID));"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE TABLE AssetTracking.Assets (MAC varchar(50) NOT NULL, Name varchar(50) DEFAULT NULL, Description varchar(1000) DEFAULT NULL, Vendor varchar(1000) DEFAULT NULL, IP varchar(1000) DEFAULT NULL, Nmap varchar(1000) DEFAULT NULL, Whitelisted BIT(1) NOT NULL DEFAULT b'0', Guest BIT(1) NOT NULL DEFAULT b'0', AssetType INT NOT NULL DEFAULT 1, FOREIGN KEY (AssetType) REFERENCES AssetTypes(ID), LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (MAC));"
	
	#Default credentials are admin / admin
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO users (userName, userPass, userRole) VALUES ('admin', '\$2a\$10\$/tUV6VYUUnblcZK2RFEc9udR8IIz05F4JpIgC75NpMZHR3Gq8gq0i', 1);"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE VIEW usersWithRoles AS SELECT users.id, users.userName, users.userPass, users.userRole, roles.roleName FROM users INNER JOIN roles ON users.userRole=roles.id;"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE VIEW whitelistedAssetsWithTypes AS SELECT Assets.MAC, Assets.Name, Assets.Description, Assets.Vendor, Assets.IP, Assets.LastUpdated, Assets.Nmap, Assets.AssetType, AssetTypes.Name as 'AssetTypeName' FROM Assets INNER JOIN AssetTypes ON Assets.AssetType=AssetTypes.id WHERE Assets.Whitelisted AND !Assets.Guest;"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE VIEW whitelistedGuestAssetsWithTypes AS SELECT Assets.MAC, Assets.Name, Assets.Description, Assets.Vendor, Assets.IP, Assets.LastUpdated, Assets.Nmap, Assets.AssetType, AssetTypes.Name as 'AssetTypeName' FROM Assets INNER JOIN AssetTypes ON Assets.AssetType=AssetTypes.id WHERE Assets.Whitelisted AND Assets.Guest;"

	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "CREATE VIEW unapprovedAssetsWithTypes AS SELECT Assets.MAC, Assets.Name, Assets.Description, Assets.Vendor, Assets.IP, Assets.LastUpdated, Assets.Nmap, Assets.AssetType, AssetTypes.Name as 'AssetTypeName' FROM Assets INNER JOIN AssetTypes ON Assets.AssetType=AssetTypes.id WHERE !Assets.Whitelisted;"

	mysql -uroot -p${mySqlPassword} -e "CREATE USER 'AssetTracking_User'@'localhost' IDENTIFIED BY '${databaseServicePassword}';"

	mysql -uroot -p${mySqlPassword} -e "GRANT ALL ON AssetTracking.* TO 'AssetTracking_User'@'localhost'"

	#Default Asset Types
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO AssetTypes (Name) VALUES ('Unclassified');"
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO AssetTypes (Name) VALUES ('Desktop');"
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO AssetTypes (Name) VALUES ('Laptop');"
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO AssetTypes (Name) VALUES ('Printer');"
	mysql -uroot -p${mySqlPassword} -D AssetTracking -e "INSERT INTO AssetTypes (Name) VALUES ('Phone');"
}

createServiceAccount ()
{
	useradd -r -s /bin/false MacMon
}

extractApplication ()
{
	mkdir -p /var/www/MacMon
	cp -rf ./* /var/www/MacMon
}

installRequiredPackages ()
{
	#Install required node packages
	apt-get install -y arp-scan
	cd /var/www/MacMon/
	npm install
}

setApplicationPermissions ()
{
	chown -R MacMon:MacMon /var/www/MacMon/
	chmod 550 -R /var/www/MacMon/
	chmod 770 -R /var/www/MacMon/private
}

sudoForArpscan ()
{
	echo 'MacMon ALL=(ALL) NOPASSWD: /usr/bin/arp-scan' >> /etc/sudoers
}

generateSelfSignedCerts ()
{
  #User openssl to genererate a self signed cert for HTTPS connections
	[[ -d /var/www/MacMon/private/certificates ]] || mkdir /var/www/MacMon/private/certificates
	openssl req \
	-new \
	-newkey rsa:4096 \
	-days 1000 \
	-nodes \
	-x509 \
	-subj "/C=US/ST=MA/L=Boston/O=Nope/CN=AssetTracking" \
	-keyout /var/www/MacMon/private/certificates/server.key \
	-out /var/www/MacMon/private/certificates/server.crt
}

createConfig ()
{
	echo "{" > /var/www/MacMon/private/config.json
	echo "	\"dbAddress\": \"127.0.0.1\"," >> /var/www/MacMon/private/config.json
	echo "	\"dbPort\": 1433," >> /var/www/MacMon/private/config.json
	echo "	\"dbUser\": \"AssetTracking_User\"," >> /var/www/MacMon/private/config.json
	echo "	\"dbPassword\": \"${databaseServicePassword}\"," >> /var/www/MacMon/private/config.json
	echo "	\"dbName\": \"AssetTracking\"," >> /var/www/MacMon/private/config.json
	echo "	\"serverPort\": ${serverPort}," >> /var/www/MacMon/private/config.json
	echo "	\"cookieSecret\": \"${cookieSecret}\"," >> /var/www/MacMon/private/config.json
	echo "	\"CidrRanges\": ${configNetworkRanges}," >> /var/www/MacMon/private/config.json
	echo "	\"emailServer\": \"${emailServer}\"," >> /var/www/MacMon/private/config.json
	echo "	\"smtpPort\": ${smtpPort}," >> /var/www/MacMon/private/config.json
	echo "	\"emailSender\": \"${emailSender}\"," >> /var/www/MacMon/private/config.json
	echo "	\"emailSenderUsername\": \"${emailSenderUsername}\"," >> /var/www/MacMon/private/config.json
	echo "	\"emailSenderPassword\": \"${emailSenderPassword}\"," >> /var/www/MacMon/private/config.json
	echo "	\"emailRecipient\": \"${emailRecipient}\"," >> /var/www/MacMon/private/config.json
	echo "	\"emailTls\": \"${emailTls}\"," >> /var/www/MacMon/private/config.json
	echo "	\"scanInterval\": 300," >> /var/www/MacMon/private/config.json
	echo "	\"environment\": \"production\"," >> /var/www/MacMon/private/config.json
	echo "	\"hashStrength\": 10" >> /var/www/MacMon/private/config.json
	echo "}" >> /var/www/MacMon/private/config.json
}

allowPort443 ()
{
	#Allows node to listen on port 443 without requiring sudo
	sudo setcap 'cap_net_bind_service=+ep' $(readlink -f $(which node))
}

createSystemdService ()
{
	echo "[Unit]" > /etc/systemd/system/macmon.service
	echo "Description=MacMon Web Service" >> /etc/systemd/system/macmon.service
	echo "After=network.target" >> /etc/systemd/system/macmon.service
	echo "Wants=mysql.service" >> /etc/systemd/system/macmon.service
	echo "" >> /etc/systemd/system/macmon.service
	echo "[Service]" >> /etc/systemd/system/macmon.service
	echo "User=MacMon" >> /etc/systemd/system/macmon.service
	echo "Group=MacMon" >> /etc/systemd/system/macmon.service
	echo "WorkingDirectory=/var/www/MacMon" >> /etc/systemd/system/macmon.service
	echo "ExecStart=/var/www/MacMon/bin/www" >> /etc/systemd/system/macmon.service
	echo "Restart=always" >> /etc/systemd/system/macmon.service
	echo "  RestartSec=10" >> /etc/systemd/system/macmon.service
	echo "StandardOutput=journal" >> /etc/systemd/system/macmon.service
	echo "StandardError=journal" >> /etc/systemd/system/macmon.service
	echo "" >> /etc/systemd/system/macmon.service
	echo "[Install]" >> /etc/systemd/system/macmon.service
	echo "WantedBy=multi-user.target" >> /etc/systemd/system/macmon.service

	systemctl enable macmon.service
	systemctl start macmon.service
}

completedMessage ()
{
	clear
	echo "MacMon Installation Complete"
}

checkIfSudo
collectInformation
checkPrerequisites
createDatabase
createServiceAccount
extractApplication
installRequiredPackages
setApplicationPermissions
sudoForArpscan
generateSelfSignedCerts
createConfig
allowPort443
createSystemdService
completedMessage