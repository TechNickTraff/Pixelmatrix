#! /usr/bin/env python3

import json
import os


data_dir = "sd/gallery"

files = os.listdir(data_dir)

for fn in files:
  print(f"Checking {fn}")
  with open(f"{data_dir}/{fn}", 'r') as f:
    content = json.load(f)

    for frame in content['data']:
      print(len(frame))