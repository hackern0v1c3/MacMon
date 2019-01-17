# MacMon

MacMon is an application written primarily in NodeJs that actively scans your network for devices and provides a web interface for keeping track of them.  Other features include the ability to send an email alert when a new devices is detected, run a port scan against detected devices, or block a devices from the network using arp spoofing techniques, all with the click of a button.  Most features are implemented and working but any version less than 1.0 should be considered beta and still under very active development.

---

## Information

- This application is intended to be installed on home or small business networks.  It does not support scanning across network boundaries.

- This is a passion project that was spawned by Brian Johnson at [7 minute security](https://7ms.us/) when he was looking for solutions for small business to keep track of what's on their network that were easy to use and innexpensive.  You can't secure your network if you don't know what's on it!  [See step 1 of the Basic CIS Controls](https://www.cisecurity.org/controls/)

- This project originally used a shell script to install to Ubuntu or Raspbian.  For easier deployment and maintainability I've moved the project to only be supported under Docker.  Once the project is further along I may develop another install script for running natively.

- This container requires the --net=host option because it relies on layer 2 traffic.

## Quickstart
sudo docker run -d -e DB_ROOT_PASSWORD={make up a password} -e DB_PASSWORD={make up another password} --net=host -v macmon_sql:/var/lib/mysql -v macmon_conf:/usr/src/app/private macmondev/macmon:latest

## Usage Instructions
- Browse to the web interface.  By default it will listen on port 8443 with a self signed certificate.  Example: https://192.168.1.50:8443

- Login using the username "admin" and password "admin"

- By default every 300 seconds (5 minutes) the network will be scanned for devices.  This timing can be changed on the settings tab of the web interface.

- To enable email notifcation for newly detected devices go to the settings page, check the box for **Enable Email Notifications**, enter your email settings, and click save.

- After a scan is complete you will have a list of devices on the "New Detected Devices" tab.

- Ideally you would track down each device on the New Devices list and identify them.  You should then add a name and notes to the device and click save.  Once a device is identified and labeled click the "Approve" button to move the device to the "Approved Devices" tab.  That list will act as your approved network device inventory.

- Devices can be deleted from either list by clicking the "Delete" button.  However during the next scan if the deviec is detected again the device will appear again on the New Devices tab.  This is intentional.  Devices should only be deleted if you think they are gone for good.  Otherwise they should be approved.

- If arp scan is not able to detect the manufacturer of a device MacMon then uses the [MacVendors.com](https://macvendors.com/) API to lookup a device.  Their usage is throttled so you can only do 1000 lookups per day from a given IP.  If a lookup fails you can delete the device from MacMon and it should be detected again during the next scan.

- The "Last Updated" column should show the last time any device was detected on your network.  This can be handy for identifying old or powered off devices.

## Advanced usage
- The MacMon docker image uses two volumes. /var/lib/mysql is where the built in Mariadb database is stored.  /usr/src/app/private is where the MacMon configuration files, https certificates, and database backups are stored.

- The HTTPS port that the container listens on can be changed by using the environmental variable "-e HTTPS_PORT={port number}"

- You can install your own SSL certificate by replacing the server.crt and server.key files in the certificates folder on the macmon_conf volume.  If you followed the quickstart instructions they should be in `/var/lib/docker/volumes/macmon_conf/_data/certificates/`