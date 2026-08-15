import os
import sys
import base64
import glob
import time
from io import BytesIO
from PIL import Image

# Add server and backend paths to sys.path
root_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(root_dir, 'server'))
sys.path.insert(0, os.path.join(root_dir, 'backend', 'chat2hamnosys'))

from dotenv import load_dotenv
from openai import OpenAI
from llm.client import LLMClient
from parser.description_parser import parse_description
from generator.params_to_hamnosys import generate
from rendering.hamnosys_to_sigml import to_sigml

load_dotenv(os.path.join(root_dir, 'server', '.env'))
gemini_key = os.environ.get('GEMINI_API_KEY')
groq_key = os.environ.get('GROQ_API_KEY')

if not groq_key:
    raise ValueError("GROQ_API_KEY not found in server/.env")

# Vision client: Gemini 3.1 Flash-Lite
gemini_client = OpenAI(
    api_key=gemini_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    timeout=25.0
)

# Text / Parser client: Groq LLaMA 3.3 70B
groq_client = OpenAI(
    api_key=groq_key,
    base_url="https://api.groq.com/openai/v1",
    timeout=25.0
)

c2h_client = LLMClient(
    client=groq_client,
    model="llama-3.1-8b-instant"
)


mapping = {
    0: "ક", 1: "ખ", 2: "ગ", 3: "ઘ", 4: "ઙ", 5: "ચ", 6: "છ",
    7: "જ", 8: "ઝ", 9: "ઞ", 10: "ટ", 11: "ઠ", 12: "ડ", 13: "ઢ",
    14: "ણ", 15: "ત", 16: "થ", 17: "દ", 18: "ધ", 19: "ન", 20: "પ",
    21: "ફ", 22: "બ", 23: "ભ", 24: "મ", 25: "ય", 26: "ર", 27: "લ",
    28: "ળ", 29: "વ", 30: "શ", 31: "ષ", 32: "સ", 33: "હ"
}

def encode_and_resize_image(image_path, max_size=(384, 384)):
    img = Image.open(image_path)
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    buffered = BytesIO()
    img.convert("RGB").save(buffered, format="JPEG", quality=85)
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def call_with_retry(fn, max_retries=5, delay=10):
    for attempt in range(max_retries):
        try:
            return fn()
        except Exception as e:
            print(f"    [Retryable Error: {e}] Waiting {delay}s (Attempt {attempt+1}/{max_retries})...", flush=True)
            time.sleep(delay)
            delay += 5
    raise RuntimeError("Max retries exceeded")

def write_sigml(entries):
    out_path = os.path.join(root_dir, "data", "Gujarati_SL_GJSL.sigml")
    content = '<?xml version="1.0" encoding="utf-8"?>\n<sigml>\n' + "\n".join(entries) + '\n</sigml>'
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    data_dir = os.path.join(root_dir, "GSL Consonants Data")
    entries = []
    
    print(f"Processing all 34 Gujarati Consonants using Groq LLaMA 3.3 70B & Gemini 3.1 Flash-Lite...", flush=True)
    
    for i in range(34):
        gloss = mapping[i]
        folder_path = os.path.join(data_dir, str(i))
        
        images = glob.glob(os.path.join(folder_path, "*.jpg")) + glob.glob(os.path.join(folder_path, "*.png"))
        if not images:
            print(f"No image found for folder {i} ({gloss})", flush=True)
            continue
            
        img_path = images[0]
        base64_image = encode_and_resize_image(img_path)
        
        print(f"\n[{i+1}/34] Processing folder {i} ({gloss})...", flush=True)
        
        try:
            # 1. Gemini Vision description
            def describe_img():
                return gemini_client.chat.completions.create(
                    model="gemini-3.1-flash-lite",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Describe this hand sign precisely in terms of hand shape, finger extensions, thumb position, and palm orientation. Keep it concise, clear, and plain English."},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}"
                                    },
                                },
                            ],
                        }
                    ],
                    max_tokens=300,
                )
                
            response = call_with_retry(describe_img)
            prose = response.choices[0].message.content.strip()
            print(f"  Desc: {prose[:60]}...", flush=True)
            
            # 2. Parse using Groq LLaMA 3.3 70B
            def parse_pr():
                return parse_description(prose, client=c2h_client)
                
            parse_result = call_with_retry(parse_pr)
            
            if not parse_result.parameters:
                print("  Parse failed.", flush=True)
                hamnosys = ""
            else:
                # 3. Generate HamNoSys
                gen_result = generate(parse_result.parameters)
                hamnosys = gen_result.hamnosys or ""
                
            print(f"  HamNoSys: {hamnosys}", flush=True)
            
            # 4. Create SIGML representation
            if hamnosys:
                try:
                    sigml_inner = to_sigml(hamnosys)
                    if "<hamnosys_manual>" in sigml_inner:
                        sigml_inner = sigml_inner[sigml_inner.find("<hamnosys_manual>"):sigml_inner.find("</hamnosys_manual>") + len("</hamnosys_manual>")]
                    else:
                        sigml_inner = sigml_inner.replace("<?xml version=\"1.0\" encoding=\"utf-8\"?>", "").replace("<?xml version='1.0' encoding='UTF-8'?>", "").replace("<sigml>", "").replace("</sigml>", "").strip()
                except Exception as e:
                    print(f"  SiGML error: {e}", flush=True)
                    sigml_inner = f"<!-- Error generating sigml for {hamnosys} -->"
            else:
                sigml_inner = "<!-- Failed to generate HamNoSys -->"
                
            entry = f"""  <hns_sign gloss="{gloss}">
    {sigml_inner}
  </hns_sign>"""
            entries.append(entry)
            write_sigml(entries)
            
        except Exception as err:
            print(f"  Error processing {gloss}: {err}", flush=True)
            entries.append(f'  <hns_sign gloss="{gloss}">\n    <!-- Error: {err} -->\n  </hns_sign>')
            write_sigml(entries)

        # Sleep 1 second between items
        time.sleep(1)

        
    print(f"\nSUCCESS: Wrote complete SIGML to data/Gujarati_SL_GJSL.sigml", flush=True)

if __name__ == "__main__":
    main()
