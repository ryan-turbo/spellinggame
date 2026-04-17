
# Quick audio generator using edge-tts directly
import subprocess
import os
from pu1_vocab_data import PU1_VOCAB

AUDIO_DIR = r"web\public\audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

# Get all PU1 words
all_words = []
for unit_data in PU1_VOCAB.values():
    for word_data in unit_data["words"]:
        all_words.append(word_data["word"])

# Check existing
existing = set()
for f in os.listdir(AUDIO_DIR):
    if f.endswith(".mp3"):
        existing.add(f.replace(".mp3", ""))

# Generate missing
to_generate = []
for w in all_words:
    fn = w.lower().replace(" ", "_").replace("-", "_")
    if fn not in existing:
        to_generate.append((w, fn))

print(f"Total PU1 words: {len(all_words)}")
print(f"Missing audio: {len(to_generate)}")

voice = "en-GB-RyanNeural"
for i, (word, fn) in enumerate(to_generate):
    filepath = os.path.join(AUDIO_DIR, f"{fn}.mp3")
    print(f"[{i+1}/{len(to_generate)}] {word} -> {fn}.mp3")
    
    try:
        cmd = ["edge-tts", "--voice", voice, "--text", word, "--write-media", filepath]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            print(f"  ERROR: {result.stderr[:100]}")
    except Exception as e:
        print(f"  ERROR: {e}")

print("Done!")
