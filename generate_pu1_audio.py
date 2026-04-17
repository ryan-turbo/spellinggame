
# Generate PU1 audio using edge-tts (same as PU2/PU3)
import asyncio
import subprocess
import os

# Get all PU1 words
from pu1_vocab_data import PU1_VOCAB

OUTPUT_DIR = r"F:\pu-spelling-game\web\public\audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def generate_audio():
    """Generate audio for PU1 words"""
    all_words = []
    for unit_data in PU1_VOCAB.values():
        for word_data in unit_data["words"]:
            all_words.append(word_data["word"])
    
    print(f"Total words: {len(all_words)}")
    
    # Check existing audio
    existing = set()
    for f in os.listdir(OUTPUT_DIR):
        if f.endswith(".mp3"):
            word = f.replace(".mp3", "").replace("_", " ")
            existing.add(word.lower())
    
    print(f"Existing audio: {len(existing)}")
    
    # Generate missing audio
    to_generate = [w for w in all_words if w.lower() not in existing]
    print(f"To generate: {len(to_generate)}")
    
    if not to_generate:
        print("All audio already exists!")
        return
    
    # Use edge-tts
    voice = "en-GB-RyanNeural"
    
    for i, word in enumerate(to_generate):
        filename = word.lower().replace(" ", "_").replace("-", "_") + ".mp3"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        if os.path.exists(filepath):
            print(f"[{i+1}/{len(to_generate)}] EXISTS: {word}")
            continue
        
        print(f"[{i+1}/{len(to_generate)}] Generating: {word}")
        
        try:
            cmd = [
                "edge-tts",
                "--voice", voice,
                "--text", word,
                "--write-media", filepath
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode != 0:
                print(f"  ERROR: {result.stderr}")
        except Exception as e:
            print(f"  ERROR: {e}")
        
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.1)

if __name__ == "__main__":
    asyncio.run(generate_audio())
