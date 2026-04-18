import os, subprocess

PHONICS = r"F:\pu-spelling-game\web\public\audio\phonics"
tmp = os.path.join(PHONICS, "_test_edge.mp3")

r = subprocess.run([
    "edge-tts", "--voice", "en-GB-RyanNeural",
    "--text", "bat", "--write-media", tmp
], capture_output=True, encoding='utf-8', errors='replace')

print(f"returncode: {r.returncode}")
print(f"stderr: {r.stderr[:200]}")

if os.path.exists(tmp):
    sz = os.path.getsize(tmp)
    print(f"file size: {sz}B")
    with open(tmp, 'rb') as f:
        raw = f.read(64)
    print(f"first 64 bytes hex: {raw.hex()}")
    print(f"ID3: {raw[:3] == b'ID3'}")
    print(f"OGG: {raw[:4] == b'OggS'}")
    print(f"FLaC: {raw[:4] == b'fLaC'}")

    # 找第一个 0xFF
    with open(tmp, 'rb') as f:
        data = f.read()
    for i in range(min(100, len(data)-1)):
        if data[i] == 0xFF:
            print(f"First 0xFF at byte {i}: {data[i:i+4].hex()}")
            break

    # Check if there's an Ogg container
    if raw[:4] == b'OggS':
        print("Container: OGG/Vorbis")
    elif raw[:4] == b'fLaC':
        print("Container: FLAC")
    elif raw[:3] == b'ID3':
        print("Container: MP3 with ID3")
    else:
        print(f"Container: unknown, header={raw[:8].hex()}")
