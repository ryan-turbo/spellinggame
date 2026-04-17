#!/usr/bin/env python3
"""
用 mutagen + pydub 方式截取MP3前N ms。
实际上mutagen支持读取MP3并重采样，我们用它来控制时长。
"""
import sys, os, time

try:
    from mutagen.mp3 import MP3
    from mutagen.mp3 import MP3 as MP3File
    print("mutagen available")
except ImportError:
    print("mutagen not available")
    sys.exit(1)

try:
    import audioop
    print("audioop available")
except ImportError:
    print("audioop not available")
    # built into Python 3

try:
    import struct as _struct
except ImportError:
    pass

# ---- MP3 frame-level trimmer ----
# MP3格式：每个frame是固定采样数(MPEG1 Layer3=1152 samples)
# 我们直接截取前N个frames

SAMPLE_RATE = 44100
SAMPLES_PER_FRAME_LAYER3 = 1152  # MPEG1 Layer 3
SAMPLES_PER_FRAME_LAYER1 = 384   # MPEG1 Layer 1
MS_PER_FRAME_L3 = SAMPLES_PER_FRAME_LAYER3 / SAMPLE_RATE * 1000  # ~26.12ms

def get_frame_duration_ms(layer):
    """返回每帧毫秒数"""
    if layer == 1:
        return SAMPLES_PER_FRAME_LAYER1 / SAMPLE_RATE * 1000
    else:
        return SAMPLES_PER_FRAME_LAYER3 / SAMPLE_RATE * 1000

def parse_mp3_frames(src_path, max_ms):
    """
    解析MP3，返回(frames, target_samples, actual_ms)
    frames: 前N ms的原始frame bytes
    """
    with open(src_path, 'rb') as f:
        data = f.read()

    frames = []
    pos = 0
    total_samples = 0
    target_samples = int(max_ms / 1000 * SAMPLE_RATE)
    target_frames = int(max_ms / 1000 * SAMPLE_RATE / SAMPLES_PER_FRAME_LAYER3) + 2

    # Skip ID3v2
    if data[:3] == b'ID3':
        ver = data[3]
        size = ((data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9]) + 10
        pos = size

    frame_count = 0
    while pos < len(data) - 4 and frame_count < target_frames + 50:
        if data[pos] != 0xFF:
            pos += 1
            continue

        b1 = data[pos]
        b2 = data[pos+1]

        # MPEG Audio frame sync = 0xFF, 0xE0-0xFF
        if (b2 & 0xE0) != 0xE0:
            pos += 1
            continue

        version = (b1 >> 3) & 0x03
        layer = (b1 >> 1) & 0x03
        bitrate_idx = (b2 >> 4) & 0x0F
        sr_idx = (b2 >> 2) & 0x03
        padding = (b2 >> 1) & 1

        # Bitrate table (kbps) for MPEG1
        bitrate_map = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
        sr_map = [44100, 48000, 32000, 0]

        bitrate = bitrate_map[bitrate_idx]
        sr = sr_map[sr_idx]

        if bitrate == 0 or sr == 0 or layer == 0:
            pos += 1
            continue

        # Frame size in bytes
        if layer == 3:   # Layer I
            frame_size = (12 * bitrate * 4) // sr + padding
        elif layer == 2: # Layer II
            frame_size = (12 * bitrate * 4) // sr + padding
        else:            # Layer III (MP3)
            frame_size = (144 * bitrate) // sr + padding

        if frame_size < 4 or frame_size > 5000:
            pos += 1
            continue

        frame = data[pos:pos+frame_size]
        if len(frame) < frame_size:
            break

        frames.append(frame)

        if layer == 1:
            total_samples += SAMPLES_PER_FRAME_LAYER1
        else:
            total_samples += SAMPLES_PER_FRAME_LAYER3

        frame_count += 1
        pos += frame_size

        if total_samples >= target_samples:
            break

    return frames, total_samples, total_samples / SAMPLE_RATE * 1000


def trim_mp3_frames(src_path, dst_path, max_ms):
    """截取前max_ms毫秒的MP3帧，写入dst。返回(ss, ds, actual_ms)"""
    frames, samples, actual_ms = parse_mp3_frames(src_path, max_ms)
    if not frames:
        return None

    with open(dst_path, 'wb') as f:
        for frame in frames:
            f.write(frame)

    src_sz = os.path.getsize(src_path)
    dst_sz = os.path.getsize(dst_path)
    return src_sz, dst_sz, actual_ms


def main():
    base = r'F:\pu-spelling-game\web\public\audio\phonics'

    # (phoneme_key, source_word, trim_ms)
    phonemes = [
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
        ('a',   'hat.mp3',   250),
        ('e',   'bed.mp3',   250),
        ('i',   'sit.mp3',   250),
        ('o',   'pot.mp3',   250),
        ('u',   'bus.mp3',   250),
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
    skipped = 0
    failed = []

    for key, src_file, ms in phonemes:
        src = os.path.join(base, src_file)
        dst = os.path.join(base, f'ph_{key}.mp3')

        if not os.path.exists(src):
            skipped += 1
            continue

        src_sz = os.path.getsize(src)
        if src_sz < 5000:
            skipped += 1
            continue

        result = trim_mp3_frames(src, dst, ms)
        if result:
            ss, ds, actual = result
            done += 1
        else:
            failed.append(key)
            print(f'  FAIL ph_{key}')

    print(f'\nTotal: {done} OK, {skipped} skipped, {len(failed)} failed')
    if failed:
        print(f'Failed: {failed}')


if __name__ == '__main__':
    main()
