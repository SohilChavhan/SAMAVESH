import os
import sys
import base64
import glob
from io import BytesIO
from PIL import Image

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

gemini_client = OpenAI(
    api_key=gemini_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

groq_client = OpenAI(
    api_key=groq_key,
    base_url="https://api.groq.com/openai/v1"
)

c2h_client = LLMClient(
    client=groq_client,
    model="llama-3.3-70b-versatile"
)

data_dir = os.path.join(root_dir, "GSL Consonants Data")
folder_path = os.path.join(data_dir, "0")
images = glob.glob(os.path.join(folder_path, "*.jpg")) + glob.glob(os.path.join(folder_path, "*.png"))

img = Image.open(images[0])
img.thumbnail((384, 384), Image.Resampling.LANCZOS)
buf = BytesIO()
img.convert("RGB").save(buf, format="JPEG", quality=85)
b64_img = base64.b64encode(buf.getvalue()).decode('utf-8')

print("1. Gemini 3.1 Flash-Lite Vision...")
resp = gemini_client.chat.completions.create(
    model="gemini-3.1-flash-lite",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this hand sign precisely in terms of hand shape, finger extensions, thumb position, and palm orientation. Keep it concise, clear, and plain English."},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}}
        ]
    }],
    max_tokens=300
)
prose = resp.choices[0].message.content.strip()
print("Description:", prose)

print("\n2. Groq LLaMA 3.3 70B Parsing...")
parse_res = parse_description(prose, client=c2h_client)
print("Parsed params:", parse_res.parameters)

print("\n3. HamNoSys & SiGML Generation...")
gen_res = generate(parse_res.parameters)
print("HamNoSys:", gen_res.hamnosys)

if gen_res.hamnosys:
    sigml = to_sigml(gen_res.hamnosys)
    print("\nSUCCESS! Generated SiGML snippet:\n", sigml[:250])
