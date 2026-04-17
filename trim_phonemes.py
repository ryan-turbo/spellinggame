#!/usr/bin/env python3
"""
用 mutagen 解析 MP3，截取前 N ms 的音频帧，写出新 MP3。
不需要 ffmpeg。
"""
import sys, os, struct, math

# MP3 frame header parser
def read_mp3_frames(src_path, max_ms):
    """Read MP3 file, return list of raw frame bytes up to max_ms."""
    with open(src_path, 'rb') as f:
        data = f.read()

    frames = []
    pos = 0
    total_bytes = 0
    target_bytes = max_ms * 16000  # rough estimate

    # Skip ID3v2 tag if present
    if data[:3] == b'ID3':
        ver = data[3]
        flags = data[5]
        size = ((data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9]) + 10
        pos = size

    while pos < len(data) - 4:
        # Look for sync word 0xFF 0xFB (MPEG Audio frame sync)
        if data[pos] != 0xFF:
            pos += 1
            continue
        byte1 = data[pos]
        byte2 = data[pos + 1]

        # Check for valid MPEG audio frame
        if (byte2 & 0xE0) != 0xE0:
            pos += 1
            continue

        # MPEG version, layer, bitrate, samplerate from header
        version = (byte1 >> 3) & 0x03
        layer = (byte1 >> 1) & 0x03
        bitrate_index = (byte2 >> 4) & 0x0F
        samplerate_index = (byte2 >> 2) & 0x03
        padding = (byte2 >> 1) & 0x01

        # Bitrate table (MPEG1 Layer 3)
        bitrate_map = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
        samplerate_map = [44100, 48000, 32000, 0]
        samplerate = samplerate_map[samplerate_index]
        if samplerate == 0:
            pos += 1; continue
        bitrate = bitrate_map[bitrate_index]
        if bitrate == 0:
            pos += 1; continue

        # Frame size
        if layer == 3:  # Layer I
            frame_size = (12 * bitrate * 4) // samplerate + padding
        elif layer == 2:  # Layer II
            frame_size = (12 * bitrate * 4) // samplerate + padding
        else:  # Layer III (MP3)
            frame_size = (144 * bitrate) // samplerate + padding

        if frame_size <= 4 or frame_size > 4000:
            pos += 1; continue

        frame_data = data[pos:pos + frame_size]
        if len(frame_data) < frame_size:
            break

        frames.append(frame_data)
        total_bytes += frame_size
        pos += frame_size

        # Stop if we've collected enough
        if total_bytes >= target_bytes * 2:
            break

    return frames


def trim_mp3(src_path, dst_path, max_ms):
    """Extract first max_ms milliseconds from MP3, write to dst."""
    frames = read_mp3_frames(src_path, max_ms)
    if not frames:
        print(f'  WARN: no frames found in {src_path}')
        return False

    # Strip any Xing/INFO tag from first frame if present
    first_frame = frames[0]
    # Write MP3 without ID3, just raw frames
    with open(dst_path, 'wb') as f:
        for frame in frames:
            f.write(frame)

    src_size = os.path.getsize(src_path)
    dst_size = os.path.getsize(dst_path)
    print(f'  {os.path.basename(src_path)}: {src_size}B -> {dst_size}B ({len(frames)} frames)')
    return True


def main():
    base = r'F:\pu-spelling-game\web\public\audio\phonics'
    out_dir = base

    # Phoneme → source word audio
    # Key: (src_file, phoneme, trim_ms)
    # trim_ms: how many ms from the start to keep
    phonemes = [
        # Consonants: trim to ~150ms to get just the onset
        ('bat.mp3',    'b',    180),
        ('cat.mp3',    'c',    180),
        ('dog.mp3',    'd',    180),
        ('fish.mp3',   'f',    200),
        ('go.mp3',     'g',    150),
        ('hat.mp3',    'h',    150),
        ('jam.mp3',    'j',    200),
        ('cat.mp3',    'k',    180),
        ('lion.mp3',   'l',    200),
        ('me.mp3',     'm',    200),
        ('net.mp3',    'n',    180),
        ('pig.mp3',    'p',    180),
        ('red.mp3',    'r',    200),
        ('sun.mp3',    's',    180),
        ('top.mp3',    't',    180),
        ('van.mp3',    'v',    200),
        ('wet.mp3',    'w',    180),
        ('yes.mp3',    'y',    150),
        ('zip.mp3',    'z',    180),
        ('box.mp3',    'x',    150),
        # Short vowels (need more time ~250ms)
        ('bed.mp3',    'e',    250),
        ('hat.mp3',    'a',    250),
        ('sit.mp3',    'i',    250),
        ('pot.mp3',    'o',    250),
        ('bus.mp3',    'u',    250),
        # Vowel teams (long vowels / diphthongs)
        ('rain.mp3',   'ai',   300),
        ('bee.mp3',    'ee',   300),
        ('boat.mp3',   'oa',   300),
        ('moon.mp3',   'oo',   300),
        ('cow.mp3',    'ow',   300),
        ('coin.mp3',   'oi',   300),
        ('boy.mp3',    'oy',   300),
        ('out.mp3',    'ou',   300),
        ('car.mp3',    'ar',   350),
        ('bird.mp3',   'ir',   350),
        ('bird.mp3',   'ur',   350),
        ('bird.mp3',   'er',   350),
        ('turn.mp3',   'ur',   350),
        ('door.mp3',   'or',   350),
        # Digraphs
        ('chip.mp3',   'ch',   250),
        ('ship.mp3',   'sh',   250),
        ('phone.mp3',  'ph',   300),
        ('think.mp3',  'th',   300),
        ('this.mp3',   'TH',   300),
        ('king.mp3',   'ng',   250),
        ('bank.mp3',   'nk',   300),
        # Blends
        ('blue.mp3',   'bl',   300),
        ('clap.mp3',   'cl',   300),
        ('frog.mp3',   'fr',   300),
        ('fly.mp3',    'fl',   300),
        ('frog.mp3',   'dr',   300),
        ('tree.mp3',   'tr',   300),
        ('spoon.mp3',  'sp',   300),
        ('star.mp3',   'st',   300),
        ('slow.mp3',   'sl',   300),
        ('snail.mp3',  'sn',   300),
        ('street.mp3', 'str',  350),
        ('spray.mp3',  'spr',  350),
        ('school.mp3', 'sch',  350),
        ('drum.mp3',   'dr',   300),
        ('crab.mp3',   'cr',   300),
        ('bread.mp3',  'br',   300),
        ('knee.mp3',   'kn',   300),
        ('write.mp3',  'wr',   300),
        ('what.mp3',   'wh',   300),
        # r-controlled vowels
        ('care.mp3',   'are',  350),
        ('day.mp3',    'ay',   300),
        # Consonant endings / blends
        ('back.mp3',   'ck',   300),
        ('sing.mp3',   'ng',   300),
        ('table.mp3',  'ble',  350),
        ('rabbit.mp3', 'bit',  300),
        ('pencil.mp3', 'cil',  350),
        ('ticket.mp3', 'tic',  300),
        ('city.mp3',   'ty',   300),
        ('west.mp3',   'est',  350),
        ('gave.mp3',   've',   300),
        # Extra
        ('umbrella.mp3','um',  350),
        ('umbrella.mp3','hos', 400),
        ('umbrella.mp3','tal', 350),
        ('twin.mp3',   'tw',   300),
        ('bus.mp3',    'um',   350),
        ('car.mp3',    'la',   350),
        ('bus.mp3',    'en',   300),
        ('gave.mp3',   'te',   300),
        ('pig.mp3',    'pen',  300),
        ('knee.mp3',   'ne',   300),
        ('bike.mp3',   'ke',   300),
        ('bee.mp3',    'me',   300),
        ('bus.mp3',    'me',   300),
        ('comb.mp3',   'mb',   300),
        ('umbrella.mp3','rab', 350),
        ('fantastic.mp3','tas', 400),
        ('phone.mp3',  'pi',   300),
        ('pig.mp3',    'p',    200),
        ('jam.mp3',    'am',   300),
        ('tea.mp3',    'ea',   300),
        ('car.mp3',    'r',    250),
        ('table.mp3',  'ta',   300),
        ('tall.mp3',  'tal',   350),
        ('twin.mp3',  'tw',    300),
        ('school.mp3', 'hos',  400),
        ('umbrella.mp3', 'la', 350),
        ('umbrella.mp3', 'rab', 350),
        ('debt.mp3',   'bt',   300),
        ('umbrella.mp3', 'brel', 450),
    ]

    done = 0
    for src_file, phoneme, ms in phonemes:
        src_path = os.path.join(base, src_file)
        dst_file = f'ph_{phoneme}.mp3'
        dst_path = os.path.join(out_dir, dst_file)

        if not os.path.exists(src_path):
            print(f'  SKIP {src_file} (not found)')
            continue

        # Skip if source is too small (likely empty/corrupt)
        src_size = os.path.getsize(src_path)
        if src_size < 500:
            print(f'  SKIP {src_file} (too small: {src_size}B)')
            continue

        ok = trim_mp3(src_path, dst_path, ms)
        if ok:
            done += 1

    print(f'\nDone: {done} phoneme clips generated')


if __name__ == '__main__':
    main()
