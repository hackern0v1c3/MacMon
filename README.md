# MacMon
<h1>THIS IS A SUPER EARLY PRE-ALPHA PROOF OF CONCEPT.  IT IS FULL OF BUGS, HALF COMPLETED FEATURES, AND SECURITY HOLES.  PLEASE DO NOT USE IN A PRODUCTION ENVIRONMENT AND ESPECIALLY DONT OPEN THE WEB INTERFACE DIRECTLY TO THE INTERNET!!!  Hopefully this project will be fully featured and secure some day but right now it is not.</h1>
<hr>

<h1>Information:</h1>
<ul>
  <li>This application is intended to be installed on home or small business networks to help identify all of the devices on the network and help keep them organized.  It can also be used for detecting new unauthorized devices on a network.</li>
  <li>This application stores its information in a mysql database, uses the ubuntu package arp-scan to detect network devices, and lets you interact with the information by using a nodejs web server.</li>
  <li>This app has only been tested on Ubuntu server 16.04 and Ubuntu workstation 17.10.  I want to test it working on Raspbian as well when it's closer to being complete</li>
  <li>See below for installation and usage instructions</li>
  <li>The install.sh script sets up a service user account named MacMon which is used to run the node application.  It is given sudo rights ONLY to arp-scan since it is require.</li>
</ul>
<hr>

<h1>Install Instructions:</h1>
<ol>
  <li>git clone https://github.com/hackern0v1c3/MacMon.git</li>
  <li>cd MacMon</li>
  <li>sudo ./install.sh</li>
  <li>The installer script will install some packages and ask a series of questions.  If at any point you want to cancel the installation because you mistyped something, or just want to back out use Ctrl+c.  Most of the answers will be saved in /var/www/MacMon/private/config.js and can be manually edited at any time.</li>
  <li>The install.sh script also runs mysql_secure_installation after mysql is installed.  Most of the defaults can be selected during this wizard.</li>
  <li>Once the install is complete all of the required files will be in /var/www/MacMon.  You can delete the folder that was created during the git clone.</li>
</ol>
<hr>

<h1>Usage Instructions:</h1>
<ul>
  <li>Browse to the web interface by browsing to your Ubuntu machine using https.  Example: https://192.168.1.50</li>
  <li>Login using the username "admin" and password "admin".  I haven't added the change password form yet so this can't easily be changed in this version.</li>
  <li>By default every 300 seconds (5 minutes) the network will be scanned for devices.  If new devices are detected you should receive an email.</li>
  <li>Currently the application does not do a scan when it first starts so nothing will appear for 5 minutes.  I'll change that soon.</li>
  <li>After a scan is complete you will have a list of devices on the "New Detected Devices" tab.</li>
  <li>Ideally you would track down each device on the New Devices list and identify them.  You should then add a name and notes to the device and click save.  Once a device is identified and labeled click the "Approve" button to move the device to the "Approved Devices" tab.  That list will act as your approved network device inventory.</li>
  <li>Devices can be deleted from either list by clicking the "Delete" button.  However during the next scan if the deviec is detected again you will be notified and the device will appear again on the New Devices tab.  This is intentional.  Devices should only be deleted if you think they are gone for good.  Otherwise they should be approved.  If you don't approve of a device on your network you should remove it from your network!</li>
  <li>The "Last Updated" column should show the last time any device was detected on your network.  This can be handy for identifying old or powered off devices.</li>
  <li>The application will be installed to /var/www/MacMon.  Most of the applications configuration is stored in /var/www/MacMon/private/config.js and can be manually edited.</li>
  <li>The application runs as a systemd service.  To view the application logs use this command "journalctl -u macmon".  The loggin level can be set to "production" or "development" in the config.js file using the environment property.</li>
  <li>The application generates a self signed certificate for HTTPS during installation.  If you want to use your own certificate you can replace the files in /var/www/MacMon/private/certificates</li>
</ul>
<hr>

<h1>Development Path:</h1>
<p> The current version is a very basic proof of concept.  Currently it just scans the network and saves the results in the database.  Then the results can be viewed and slightly modified in the web interface.</p>
<p>The following list are features that I will be working on in the rough order that I plan on adding them</p>
<ol>
  <li>Ability to reset admin password.</li>
  <li>Fix access denied logic.  Right now the redirects and access denied messages are a mess...</li>
  <li>Get the Asset Type column working.  Right now it doesn't do anything.  You will eventually be able to select asset types like laptop, computer, etc and add your own asset types.</li>
  <li>Ability to sort and filter tables so it's easier to find what you are looking for.</li>
  <li>Add another tab for guest devices.  This way you can approve things like gues cell phones without cluttering up your own asset inventory.</li>
  <li>Impliment the settings menu so application settings can be set from the web interface.</li>
  <li>Add a manual way to check a devices vendor using macvendors.com API.  The arp-scan vendor list is pretty spotty but I don't want to rely 100% on macvendors.com</li>
  <li>Add a button to do nmap scanning against any device to collect more information</li>
  <li>Add a button to block devices on the network.  This could be useful if a rogue device is detected and you want to block it from the network while you identify and remove it.</li>
  <li>Better CSS look and feel</li>
  <li>Impliment better security</li>
</ol>
<br>
<p>The are other things to do as well but this is a list of items that are on my mind.</p>
<hr>

<h1>Credit:</h1>
<ul>
  <li>Brian at 7ms.us for coming up with the project idea.</li>
  <li>All of the cool people that wrote the npm modules that I use in this app.</li>
