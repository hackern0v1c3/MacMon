#!/usr/bin/python3

#Import required libraries
import sys
import os
import argparse
import ipaddress
import getpass
import configparser

#Setup configuration file structure
config = configparser.ConfigParser()

#Define arguments
parser = argparse.ArgumentParser()
group = parser.add_mutually_exclusive_group()
group.add_argument("-s", "--setup", action="store_true", help="Run setup wizard to create a configuration file")
group.add_argument("-l", "--learn", action="store_true", help="Scan the network to learn MAC addresses with no notifications")
group.add_argument("-c", "--check", action="store_true", help="Scan the network and alert on any new MAC addresses")
parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output on the command prompt for troubleshooting")
args = parser.parse_args()

#This function takes in an array, removes it's duplicates, and returns a unique array.  Found here https://www.peterbe.com/plog/uniqifiers-benchmark
def unique_array(seq):
   # Not order preserving
   keys = {}
   for e in seq:
       keys[e] = 1
   return keys.keys()

#This function takes in a string which should be a comma seperated list of subnets.
#It splits the list and verifies that each subnet is valid.
def verifySubnets(subnets):
  split_subnets = subnets.split(',')
  for network in split_subnets:
    if '/' not in network:
      print("Invalid subnet %s.  Must include mask bits.  For example %s/24" % (network, network))
      return False
    try:
      ipaddress.ip_network(network)
    except:
      print("Invalid Subnet %s" % (network) + "\n")
      return False
  return True

#The main function to call if the --setup option is selected.
#This function should ask the user a series of questions, verify the answers, and create a configuration file.
if args.setup:
  config['NETWORKING'] = {}
  config['EMAIL'] = {}

  os.system('clear')
  input("This setup wizard will ask you a series of questions which will be used to build a configuration file.  Press enter to continue.\n")
  os.system('clear')

  while True:
    subnets = input("Please enter a comma seperated list of subnets that you would like to scan.  Exmaple: 192.168.1.0/24,10.10.0.0/16 \n")
    
    if verifySubnets(subnets):
      config['NETWORKING']['Subnets'] = subnets
      break
    else:
      input("Press enter to try again.")
      os.system('clear')

  os.system('clear')
  input("Subnets verified succesfully!  Press Enter to continue\n")
  os.system('clear')

  config['EMAIL']['ServerAddress'] = input("Please enter an email server address.  Example: smtp.office365.com\n") #should use regex to limit chracters to avoid command injection
  os.system('clear')

  config['EMAIL']['ServerPort'] = input("Please enter an email server port.  Example: 587\n") #should check for int in valid range
  os.system('clear')

  config['EMAIL']['Tls'] = input("Does the email server require TLS?  Please enter y or n\n") #should check for y or n
  os.system('clear')

  config['EMAIL']['SenderEmail'] = input("Please enter the senders email address.  Example: notifications@example.com\n") #should use regex to validate
  os.system('clear')

  config['EMAIL']['SenderUsername'] = input("Please enter the senders email username.  This may be the same as their email address.  Example: notifications@example.com\n")
  os.system('clear')

  print("Please enter the senders email password.  Example: Password123\n")
  print("IMPORTANT: This password will be saved in clear text in the macmon.cfg configuration file.  This script will attempt to change the permissions of that file so only the current user can read it.  This does not gurantee security.  If you are not comfortable with having your email credentials in a text file please donn\'t use this script!")
  config['EMAIL']['SenderPassword'] = getpass.getpass()
  os.system('clear')

  config['EMAIL']['RecipientEmail'] = input("Please enter the recipient email address.  Example: admin@example.com\n") #should use regex to validate
  os.system('clear')

  print("Please verify that the settings looks correct.  Enter y to continue or n to re-enter.\n")
  print("Subnets: %s" % (config['NETWORKING']['Subnets']))
  print("ServerAddress: %s" % (config['EMAIL']['ServerAddress']))
  print("ServerPort: %s" % (config['EMAIL']['ServerPort']))
  print("Tls: %s" % (config['EMAIL']['Tls']))
  print("SenderEmail: %s" % (config['EMAIL']['SenderEmail']))
  print("SenderUsername: %s" % (config['EMAIL']['SenderUsername']))
  print("SenderPassword: ***")
  print("RecipientEmail: %s" % (config['EMAIL']['RecipientEmail']))

  input()### This should start questions all over again if the user enters n

  try:
    with open('macmon.cfg', 'w') as configfile:
      if args.verbose:
        print("Saving config file to macmon.cfg\n")
      config.write(configfile)
  except:
    os.system('clear')
    print("error saving macmon.cfg\n")
    sys.exit(1)

  try:
    if args.verbose:
      print("chmod macmon.cfg 600\n")
    os.chmod("macmon.cfg", 0o600)
  except:
    os.system('clear')
    print("error setting permissions on macmon.cfg.  This file could contain your email password.  Please force delete it!")
    sys.exit(1)

  print("Setup Complete")
  sys.exit(0)

#The main function to call if the --learn option is selected.
#This function should check for a configuration file and verify the subnets
#Then this function should scan each subnet and record all identified MAC addresses
elif args.learn:
  try:
    config.read("macmon.cfg")
  except:
    print("Unable to read macmon.cfg.  Exiting")
    sys.exit(1)

  if not verifySubnets(config['NETWORKING']['Subnets']):
    print("Invalid information in macmon.cfg.  Ending script")
    sys.exit(1)

  subnets = config['NETWORKING']['Subnets'].split(',')
  for subnet in subnets:
    os.system('nmap -n -sn %(subnet)s' % locals())

  arptable = ""
  try:
    f = open("/proc/net/arp", "r")
    arptable = f.read()
    f.close()
  except:
    print("Error: Unable to read arp table /proc/net/arp")
    sys.exit(1)

  mac_address_array = []
  for line in arptable.splitlines():
    mac_address_array.append(line.split()[3])

  mac_address_array.pop(0)

  ######## HERE I SHOULD TRY AND READ MAC ADDRESS FILE
  ######## IF IT EXISTS SORT UNIQUE
  ######## THEN SEARCh NEW SCAN RESULTS FOR ADDITIONAL ADDRESSES
  ######## ADD ANY NEW ADDRESSES TO OLD LIST
  ######## WRITE BACK TO FILE

  ######## IF FILES DIDN'T EXIST JUST WRITE A NEW ONE WITH NEW SORTED UNIQUE ARRAY

  print("Learning Complete")
  print(sorted(unique_array(mac_address_array)))
  sys.exit(0)

#The main function to call if the --check option is selected.
#This function should check for a configuration file and verify the subnets
#Then this function should read all recoreded MAC addresses into memory
#Finally this function should scan all subnets and identify any new MAC addresses
#If new MAC address are found an email should be generated
else:
  print("Checking Complete")
  sys.exit(0)