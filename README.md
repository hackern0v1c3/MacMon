# MacMon
THIS IS A WORK IN PROGRESS. AKA IT DOESNT WORK AT ALL YET!
After some consideration I am revamping the project to go in an entirely different direction.  Here is the new concept.

Ditch python in exchange for node js.

The application will have a mysql backend for storing data and a browser interface for viewing/manipulating data.

The web interface will allow you to view whitelisted devices on your network as well as some basic information about them.  For instance
  Mac address, Name, Description, IP Address, notes, device type, nmap results
 
 There should be buttons that allow you to refresh information on a particular device.  Some info like name, device type, notes, etc will be definable by the user in the broswer interface.  This will help keep a clean inventory of whitelisted devices.
 
In the background on a regular basis the application should scan the network using arp-scan (this may change).  After a scan is completed a few things should happen.
  1.  If new devices are detected an alert email should be generated and the devices should be added to the "new devices" section of the webpage.  The information should include their IP address, MAC address, and nmap scan results.
  2.  Any whitelisted devices that are detected again should have their IP address updated in the database and browser interface.

A "New Device" is defined by a MAC address that is not already in the database.  Once a new device is detected it's up to the user to either whitelist the device, or delete the device.  If a device is deleted it will be detected again in future scans.  So either whitelist devices or delete them and make sure they are never on your network again!

The program will not have any methods for blocking devices from your network.  It will be simply for detecting and tracking.



This script will assumes that it is running on an Ubuntu Linux system.  It may work in othe Linux distributions but it will not be tested (unless other people test it).

This script won't do anything with IPv6 Sorry!

to start in debug mode
DEBUG=macmon:* npm start

Credit:
  Concept- Brian at 7ms.us for coming up with the project idea.
