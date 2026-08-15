import json
import re

input_file = r"c:\Users\Sohil\Downloads\xA1XEVWzAYg.txt"
output_file = r"c:\Users\Sohil\OneDrive\Desktop\GSL\public\data\yt_xA1XEVWzAYg.json"

data = []
with open(input_file, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line: continue
        # match (MM:SS) or (HH:MM:SS) at the beginning
        match = re.match(r'^\((\d+):(\d+)(?::(\d+))?\)\s+(.*)$', line)
        if match:
            groups = match.groups()
            if groups[2] is not None:
                # HH:MM:SS
                h = int(groups[0])
                m = int(groups[1])
                s = int(groups[2])
            else:
                h = 0
                m = int(groups[0])
                s = int(groups[1])
            total_seconds = h * 3600 + m * 60 + s
            text = groups[3].strip()
            data.append({"time": total_seconds, "text": text})

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Generated JSON with {len(data)} lines.")
