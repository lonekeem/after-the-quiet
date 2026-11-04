#!/bin/bash
# Renders narration with Piper (MIT, en_US-ryan-high voice CC BY 4.0-compatible dataset), pitched down/slowed + lowpass + light reverb.
set -e
cd "$(dirname "$0")/.."
V=/workspace/piper-voices/en_US-ryan-high.onnx
python3 -c "import json;[print(k+'\t'+v) for k,v in json.load(open('tools/narration.json')).items()]" | while IFS=$'\t' read id text; do
  echo "$text" | /workspace/piperenv/bin/piper -m $V --length_scale 1.18 --sentence_silence 0.45 -f /tmp/$id.wav 2>/dev/null
  ffmpeg -y -loglevel error -i /tmp/$id.wav -af "asetrate=22050*0.88,aresample=44100,atempo=1.04,bass=g=4:f=120,lowpass=f=5200,aecho=0.8:0.6:45|90:0.18|0.10,volume=1.4" -ac 1 -c:a libmp3lame -b:a 80k public/audio/narration/$id.mp3
  echo $id
done
