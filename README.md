# MacMon
THIS IS A WORK IN PROGRESS. AKA IT DOESNT WORK AT ALL YET!
This branch uses arp-scan on Ubuntu instead of nmap and the ubuntu arp cache file

Monitors the network for new connected MAC addresses

This script assumes that it will run on an Ubuntu Linux system running Python3.  It may work in othe Linux distributions but it has not been tested.

This script does not do anything with IPv6 Sorry!

This script saves your emai username and password in clear text into a config file.  These credentials are required for the ability to send emails.  The config file should be restricted to ONLY the user who will run the script.  Use this script at your own risk!

Right now this script requires arp-scan. This may change again.

Instructions:
1.  Download the script with "git clone https://github.com/hackern0v1c3/MacMon.git"

2.  Make the script executable with "chmod +x macmon.py"

3.  Run config mode and answer the questions "macmon.py --setup"

4.  Run learn mode to scan the network and auto-whitelist everything that is found "macmon.py --learn".  By default the whitelisted MAC addresses are saved in "macmon_whitelist.txt"

5.  Run check mode with macmon.py with no options.  If everything works correctly you should receive an email with any newly detected MAC addresses.  The addresses are then automatically added to the whitelist so you don't keep getting notified about them.

6.  To run automatic checks setup a cron job.  In version 1 the script looks for the configuration file and whitelist file in the same folder as the script.  The config file should have permssions set so only the user that ran setup mode can succesfully run the script.  Keep this in mind when setting up the cron job.

Credit:
  Script idea- Brian at 7ms.us for coming up with the idea.
  https://www.peterbe.com/plog/uniqifiers-benchmark I stole the function for unique arrays from here
