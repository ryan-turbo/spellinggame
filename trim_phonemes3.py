#!/usr/bin/env python3
"""
简单MP3裁剪：不解析frame头，直接取前N个字节。
ID3v2 tag 跳过，保留frame sync之后的全部数据。
"""
import os, struct

def find_id3v2_size(data):
    """从ID3v2.4 header读取tag大小"""
    if data[:3] != b'ID3':
        return 0
    # bytes 6-9 are syncsafe integers (size - tag header = 10)
    size = ((data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9]) + 10
    return size

def trim_mp3_simple(src, dst, max_bytes):
    """
    跳ID3v2，直接取后面的max_bytes字节。
    这会保留完整的frame结构（decoder自动处理）。
    """
    with open(src, 'rb') as f:
        raw = f.read()

    # Skip ID3v2
    start = find_id3v2_size(raw)
    if start < 10:
        start = 0

    # Take max_bytes from audio data
    audio = raw[start:]
    trimmed = audio[:max_bytes]

    with open(dst, 'wb') as f:
        f.write(trimmed)

    return len(trimmed)

# ms → bytes 估算（假设128kbps = 16KB/s）
KBPS = 16  # KB/s (128kbps = 16KB/s at 44.1kHz)
# 但Free Dictionary音频是22.05kHz，比率不同
# bat.mp3 (8337B, 520ms) → ~16KB/s → 约2880B per 180ms

def ms_to_bytes(ms, kbps=128):
    """估算指定ms需要的字节数"""
    return int(ms * kbps * 1000 / 8 / 1000)

def main():
    base = r'F:\pu-spelling-game\web\public\audio\phonics'

    # Calibrate against bat.mp3: 8337B for ~520ms → ~16KB/s
    # 180ms → ~2880B
    base_kbps = 128  # kbps estimate
    ms_to_b = lambda ms: int(ms * base_kbps * 1000 / 8 / 1000)

    # (phoneme_key, source_word, trim_ms)
    phonemes = [
        # 辅音 onset (~150-200ms)
        ('b',   'bat.mp3',   180),
        ('c',   'cat.mp3',   180),
        ('d',   'dog.mp3',   180),
        ('f',   'fish.mp3',  200),
        ('g',   'go.mp3',    150),
        ('h',   'hat.mp3',   150),
        ('j',   'jam.mp3',   200),
        ('k',   'cat.mp3',   180),
        ('l',   'lion.mp3',  200),
        ('m',   'me.mp3',    200),
        ('n',   'net.mp3',   180),
        ('p',   'pig.mp3',   180),
        ('r',   'red.mp3',   200),
        ('s',   'sun.mp3',   180),
        ('t',   'top.mp3',   180),
        ('v',   'van.mp3',   200),
        ('w',   'wet.mp3',   180),
        ('y',   'yes.mp3',   150),
        ('z',   'zip.mp3',   180),
        ('x',   'box.mp3',   150),
        # 短元音 (~250ms)
        ('a',   'hat.mp3',   250),
        ('e',   'bed.mp3',   250),
        ('i',   'sit.mp3',   250),
        ('o',   'pot.mp3',   250),
        ('u',   'bus.mp3',   250),
        # 元音字母组合 (~350ms)
        ('ai',  'rain.mp3',  350),
        ('ay',  'day.mp3',   350),
        ('ee',  'bee.mp3',   350),
        ('ea',  'tea.mp3',   350),
        ('oa',  'boat.mp3',  350),
        ('oo',  'moon.mp3',  350),
        ('ow',  'cow.mp3',   350),
        ('oi',  'coin.mp3',  350),
        ('oy',  'boy.mp3',   350),
        ('ou',  'out.mp3',   350),
        ('ar',  'car.mp3',   400),
        ('or',  'door.mp3',  400),
        ('ir',  'bird.mp3',  400),
        ('ur',  'turn.mp3',  400),
        ('er',  'bird.mp3',  400),
        ('are', 'care.mp3',  400),
        ('ch',  'chip.mp3',  280),
        ('sh',  'ship.mp3',  280),
        ('ph',  'phone.mp3', 350),
        ('th',  'think.mp3', 350),
        ('TH',  'this.mp3',  350),
        ('wh',  'what.mp3',  350),
        ('ng',  'sing.mp3',  280),
        ('nk',  'bank.mp3',  350),
        ('bl',  'blue.mp3',  350),
        ('cl',  'clap.mp3',  350),
        ('fl',  'fly.mp3',   350),
        ('fr',  'frog.mp3',  350),
        ('dr',  'drum.mp3',  350),
        ('tr',  'tree.mp3',  350),
        ('cr',  'crab.mp3',  350),
        ('br',  'bread.mp3', 350),
        ('sp',  'spoon.mp3', 350),
        ('st',  'star.mp3',  350),
        ('sl',  'slow.mp3',  350),
        ('sn',  'snail.mp3', 350),
        ('sw',  'swim.mp3',  350),
        ('tw',  'twin.mp3',  350),
        ('kn',  'knee.mp3',  350),
        ('wr',  'write.mp3', 350),
        ('sch', 'school.mp3', 400),
        ('spr', 'spray.mp3', 400),
        ('str', 'street.mp3', 400),
        ('ck',  'back.mp3',  350),
        ('ble', 'table.mp3', 400),
        ('bit', 'rabbit.mp3', 350),
        ('cil', 'pencil.mp3', 400),
        ('tic', 'ticket.mp3', 350),
        ('ty',  'city.mp3',  350),
        ('est', 'west.mp3',  400),
        ('ve',  'gave.mp3',  350),
        ('te',  'tea.mp3',   350),
        ('me',  'me.mp3',    350),
        ('ne',  'knee.mp3',  350),
        ('pen', 'pig.mp3',   350),
        ('ke',  'bike.mp3',  350),
        ('ta',  'table.mp3', 350),
        ('tal', 'tall.mp3',  400),
        ('r',   'red.mp3',   250),
        ('mb',  'comb.mp3',  350),
        ('rab', 'rabbit.mp3', 350),
        ('tas', 'fantastic.mp3', 400),
        ('hos', 'school.mp3', 400),
        ('la',  'umbrella.mp3', 350),
        ('pi',  'pig.mp3',   350),
        ('bt',  'debt.mp3',  350),
        ('brel', 'umbrella.mp3', 500),
        ('am',  'jam.mp3',   350),
        ('en',  'bus.mp3',   350),
        ('um',  'bus.mp3',   350),
        ('im',  'pig.mp3',   350),
        ('in',  'net.mp3',   350),
        ('on',  'top.mp3',   350),
    ]

    done = 0
    failed = []
    skipped = []

    for key, src_file, ms in phonemes:
        src = os.path.join(base, src_file)
        dst = os.path.join(base, f'ph_{key}.mp3')

        if not os.path.exists(src):
            skipped.append(f'{key}(missing {src_file})')
            continue

        src_sz = os.path.getsize(src)
        if src_sz < 1000:
            skipped.append(f'{key}({src_file} only {src_sz}B)')
            continue

        # Estimate bytes: use actual source file size to calibrate
        # bat.mp3: 8337B / 520ms ≈ 16B/ms
        # But files vary, so use per-ms rate
        # We use 16B/ms as approximation for 128kbps
        est_bytes = ms * 16  # 16B/ms for 128kbps

        # Also consider file might be 64kbps (8B/ms) or 192kbps (24B/ms)
        # Use conservative estimate: cap at 90% of source file
        est_bytes = min(est_bytes, int(src_sz * 0.9))

        result = trim_mp3_simple(src, dst, est_bytes)
        done += 1

    print(f'Done: {done} clips')
    if skipped:
        print(f'Skipped: {skipped}')
    if failed:
        print(f'Failed: {failed}')

    # Verify a few outputs
    print('\nVerification:')
    for f in ['ph_b.mp3', 'ph_ch.mp3', 'ph_ee.mp3', 'ph_w.mp3', 'ph_ir.mp3']:
        p = os.path.join(base, f)
        if os.path.exists(p):
            sz = os.path.getsize(p)
            print(f'  {f}: {sz}B')


if __name__ == '__main__':
    main()
