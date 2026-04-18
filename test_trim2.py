"""测试 trim_mp3 函数"""
import os, subprocess

PHONICS = r"F:\pu-spelling-game\web\public\audio\phonics"
VOICE = "en-GB-RyanNeural"

def parse_mp3_frames(data):
    frames = []
    pos = 0
    while pos < len(data) - 4:
        b0, b1 = data[pos], data[pos+1]
        if b0 != 0xFF or (b1 & 0xE0) != 0xE0:
            pos += 1; continue
        br_idx = (data[pos+2] >> 4) & 0x0F
        sr_idx = (data[pos+3] >> 2) & 0x03
        pad    = (data[pos+2] >> 1) & 0x01
        br_tbl  = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
        sr_tbl  = [44100, 48000, 32000, 0]
        bitrate = br_tbl[br_idx] * 1000
        sr      = sr_tbl[sr_idx] if sr_idx < 3 else 48000
        if bitrate == 0 or sr == 0:
            pos += 1; continue
        frame_size = int(144000 * bitrate / sr) + pad
        if frame_size < 21 or pos + frame_size > len(data):
            pos += 1; continue
        frames.append((pos, frame_size))
        pos += frame_size
    return frames

def trim_mp3(word, start_ms, end_ms, dst_path):
    tmp = os.path.join(PHONICS, "_test_trim_tmp.mp3")

    # 合成
    r = subprocess.run([
        "edge-tts", "--voice", VOICE, "--text", word, "--write-media", tmp
    ], capture_output=True, encoding='utf-8', errors='replace')
    if r.returncode != 0:
        print(f"edge-tts failed: {r.stderr}"); return False

    with open(tmp, 'rb') as f:
        raw = f.read()

    frames = parse_mp3_frames(raw)
    if not frames:
        print("no frames parsed"); os.remove(tmp); return False

    from mutagen.mp3 import MP3
    mp3info = MP3(tmp)
    dur_s = mp3info.info.length
    sr    = int(mp3info.info.sample_rate)

    start_samp = int(start_ms * sr / 1000)
    end_samp   = min(int(end_ms * sr / 1000), int(dur_s * sr))

    spf = 1152  # samples per MPEG1 Layer3 frame
    sfi = max(0, start_samp // spf)
    efi = min(len(frames), (end_samp + spf - 1) // spf)

    if efi <= sfi:
        print(f"no frames in range"); os.remove(tmp); return False

    frame_start_byte = frames[sfi][0]
    frame_end_byte   = frames[efi-1][0] + frames[efi-1][1]

    audio_data = raw[frame_start_byte:frame_end_byte]

    def synchsafe(n):
        return bytes([(n>>21)&0x7F, (n>>14)&0x7F, (n>>7)&0x7F, n&0x7F])

    with open(dst_path, 'wb') as f:
        f.write(b'ID3\x04\x00\x00')
        f.write(synchsafe(len(audio_data)))
        f.write(audio_data)

    sz = os.path.getsize(dst_path)
    os.remove(tmp)
    return sz

# Test with ph_b: /b/ from "bat" [0-100ms]
out = os.path.join(PHONICS, "_test_ph_b.mp3")
result = trim_mp3("bat", 0, 100, out)
print(f"ph_b result: {result} bytes" if result else "FAILED")

# Test with ph_a: /æ/ from "cat" [0-200ms]
out2 = os.path.join(PHONICS, "_test_ph_a.mp3")
result2 = trim_mp3("cat", 0, 200, out2)
print(f"ph_a result: {result2} bytes" if result2 else "FAILED")

# Verify with mutagen
if result:
    from mutagen.mp3 import MP3
    t = MP3(out)
    print(f"  -> duration: {t.info.length:.3f}s, bitrate: {t.info.bitrate}")
