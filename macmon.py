#!/usr/bin/python3
import sys
import os
import argparse
import ipaddress
import getpass

parser = argparse.ArgumentParser()
group = parser.add_mutually_exclusive_group()
group.add_argument("-s", "--setup", action="store_true", help="Run setup wizard to create a configuration file")
group.add_argument("-l", "--learn", action="store_true", help="Scan the network to learn MAC addresses with no notifications")
group.add_argument("-c", "--check", action="store_true", help="Scan the network and alert on any new MAC addresses")
parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output on the command prompt for troubleshooting")
args = parser.parse_args()

def verifySubnets(subnets):
  return True

if args.setup:
  subnets = ""

  os.system('clear')
  input("This setup wizard will ask you a series of questions which will be used to build a configuration file.  Press enter to continue.\n")
  os.system('clear')

  while True:
    subnets = input("Please enter a comma seperated list of subnets that you would like to scan.  Exmaple: 192.168.1.0/24,10.10.0.0/16 \n")
    
    if verifySubnets(subnets):
      break
    else:
      input("Invalid subnet list.  Press enter to try again.")
      os.system('clear')

  os.system('clear')
  print("subnets: %s" % (subnets))


  print("Setup Complete")
  sys.exit(0)

elif args.learn:
  print("Learning Complete")
  sys.exit(0)

else:
  print("Checking Complete")
  sys.exit(0)