import os, struct

audio_dir = r'F:\pu-spelling-game\web\public\audio\phonics'

def parse_mp3_frames(data):
    """解析 MP3 帧，返回 [(offset, size, header_bytes)]"""
    frames = []
    pos = 0
    while pos < len(data) - 4:
        b0, b1 = data[pos], data[pos+1]
        if b0 != 0xFF or (b1 & 0xE0) != 0xE0:
            pos += 1
            continue
        version = (b1 >> 3) & 0x03
        layer   = (b1 >> 1) & 0x03
        br_idx  = (data[pos+2] >> 4) & 0x0F
        sr_idx  = (data[pos+3] >> 2) & 0x03
        pad      = (data[pos+2] >> 1) & 0x01

        br_tbl  = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
        sr_tbl  = [44100, 48000, 32000, 0]
        bitrate = br_tbl[br_idx] * 1000
        sr      = sr_tbl[sr_idx] if sr_idx < 3 else 48000

        if bitrate == 0 or sr == 0:
            pos += 1; continue

        if layer == 3:  # Layer 3 (MP3)
            frame_size = int(144000 * bitrate / sr) + pad
        elif layer == 2:
            frame_size = int(144000 * bitrate / sr) + pad
        else:
            frame_size = int(12000 * bitrate / sr) + pad

        if frame_size < 21 or pos + frame_size > len(data):
            pos += 1; continue

        frames.append((pos, frame_size, data[pos:pos+4].hex()))
        pos += frame_size

    return frames

for fname in ['ph_a.mp3', 'ph_b.mp3', 'ph_bl.mp3', 'ph_d.mp3', 'ph_s.mp3', 'ph_w.mp3']:
    path = os.path.join(audio_dir, fname)
    sz = os.path.getsize(path)
    with open(path, 'rb') as f:
        raw = f.read()

    frames = parse_mp3_frames(raw)
    has_id3 = raw[:3] == b'ID3'
    print(f"{fname}: {sz}B, ID3={has_id3}, frames={len(frames)}")
    if frames:
        print(f"  first frame header: {frames[0][2]}")
        # 计算总帧数据
        frame_data = sum(f[1] for f in frames)
        print(f"  total frame data: {frame_data}B")
    if sz < 1000:
        print(f"  -> TRUNCATED / INVALID (no playable audio)")
