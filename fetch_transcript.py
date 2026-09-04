import json
import sys
from youtube_transcript_api import YouTubeTranscriptApi

video_id = 'oTsvPRL2Zt8'
try:
    ytt_api = YouTubeTranscriptApi()
    transcript_list = ytt_api.list(video_id)
    transcript = transcript_list.find_transcript(['hi']).fetch()

    output_file = f'public/data/yt_{video_id}.json'
    
    data = []
    for entry in transcript:
        # Check if entry is dict or object
        if isinstance(entry, dict):
            text = entry.get('text', '')
            time = entry.get('start', 0)
        else:
            text = getattr(entry, 'text', '')
            time = getattr(entry, 'start', 0)
            
        data.append({
            'time': time,
            'text': text
        })
        
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print(f'Successfully wrote {len(data)} lines to {output_file}')
except Exception as e:
    print(f'Error fetching transcript: {e}')
