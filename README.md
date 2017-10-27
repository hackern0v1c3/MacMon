# MacMon
THIS IS A WORK IN PROGRESS. AKA IT DOESNT WORK AT ALL YET!

Monitors the network for new connected MAC addresses

This script assumes that it will run on an Ubuntu Linux system running Python3.  It may work in othe Linux distributions but it has not been tested.

This script does not do anything with IPv6 Sorry!

This script saves your emai username and password in clear text into a config file.  These credentials are required for the ability to send emails.  The config file should be restricted to ONLY the user who will run the script.  Use this script at your own risk!

Right now this script requires nmap. I plan on changing that at some point but no promises.

Credit:
  Script idea- Brian at 7ms.us for coming up with the idea.
  https://www.peterbe.com/plog/uniqifiers-benchmark I stole the function for unique arrays from here