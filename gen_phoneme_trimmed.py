#!/usr/bin/env python3
"""
用 ffmpeg 从真实单词音频截取音素 onset（前 N ms）。
生成 ph_{key}.mp3 文件到 web/public/audio/phonics/
"""
import os, subprocess, time

FFMPEG = r'D:\Program Files\Krita (x64)\bin\ffmpeg.exe'

def trim(src, dst, ms):
    """截取前 ms 毫秒"""
    cmd = [
        FFMPEG, '-y',
        '-ss', '0',
        '-t', str(ms / 1000),
        '-i', src,
        '-acodec', 'libmp3lame',
        '-q:a', '2',
        '-ar', '44100',
        '-ac', '1',
        dst
    ]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode == 0:
        sz = os.path.getsize(dst)
        print(f'  OK {os.path.basename(dst)} ({sz}B, {ms}ms)')
        return True
    else:
        print(f'  FAIL {dst}: {r.stderr[-100:].decode("utf8","ignore")}')
        return False

def main():
    base = r'F:\pu-spelling-game\web\public\audio'
    phonics = os.path.join(base, 'phonics')
    out = os.path.join(phonics)

    # (key, source_word, trim_ms)
    # 辅音 onset: ~120-150ms（干净截取）
    # 短元音: ~200ms
    # 元音字母组合: ~300ms
    # r-controlled: ~350ms
    items = [
        # 单辅音 onset（截取 ~120-150ms）
        ('b',   'bat.mp3',   150),
        ('c',   'cat.mp3',   150),
        ('d',   'dog.mp3',   150),
        ('f',   'fish.mp3',  150),
        ('g',   'go.mp3',    120),
        ('h',   'hat.mp3',   120),
        ('j',   'jam.mp3',   150),
        ('k',   'cat.mp3',   150),
        ('l',   'lion.mp3',  150),
        ('m',   'me.mp3',    150),
        ('n',   'net.mp3',   150),
        ('p',   'pig.mp3',   150),
        ('r',   'red.mp3',   150),
        ('s',   'sun.mp3',   150),
        ('t',   'top.mp3',   150),
        ('v',   'van.mp3',   150),
        ('w',   'wet.mp3',   150),
        ('y',   'yes.mp3',   150),
        ('z',   'zip.mp3',   150),
        ('x',   'box.mp3',   150),
        # 短元音（~200ms 覆盖元音核心）
        ('a',   'hat.mp3',   200),
        ('e',   'bed.mp3',   200),
        ('i',   'sit.mp3',   200),
        ('o',   'pot.mp3',   200),
        ('u',   'bus.mp3',   200),
        # 元音字母组合（~300ms）
        ('ai',  'rain.mp3',  300),
        ('ay',  'day.mp3',   300),
        ('ee',  'see.mp3',   300),
        ('ea',  'tea.mp3',   300),
        ('oa',  'boat.mp3',  300),
        ('oo',  'moon.mp3',  300),
        ('ow',  'cow.mp3',   300),
        ('oi',  'coin.mp3',  300),
        ('oy',  'boy.mp3',   300),
        ('ou',  'out.mp3',   300),
        # r-controlled（~350ms，含元音+r 音）
        ('ar',  'car.mp3',   350),
        ('or',  'door.mp3',  350),
        ('ir',  'bird.mp3',  350),
        ('ur',  'turn.mp3',  350),
        ('er',  'bird.mp3',  350),
        ('are', 'care.mp3',  350),
        # 辅音二合字母（~200-250ms）
        ('ch',  'chip.mp3',  200),
        ('sh',  'ship.mp3',  200),
        ('ph',  'fish.mp3',  200),
        ('th',  'think.mp3', 250),
        ('TH',  'this.mp3',  250),
        ('wh',  'what.mp3',  200),
        ('ng',  'sing.mp3',  200),
        ('nk',  'bank.mp3',  250),
        # 辅音组合（~200-250ms）
        ('bl',  'blue.mp3',  200),
        ('cl',  'clap.mp3',  200),
        ('fl',  'fly.mp3',   200),
        ('fr',  'frog.mp3',  200),
        ('dr',  'drum.mp3',  200),
        ('tr',  'tree.mp3',  200),
        ('cr',  'crab.mp3',  200),
        ('br',  'bread.mp3', 200),
        ('sp',  'spoon.mp3', 200),
        ('st',  'star.mp3',  200),
        ('sl',  'slow.mp3',  200),
        ('sn',  'snail.mp3', 200),
        ('sw',  'swim.mp3',  200),
        ('tw',  'twin.mp3',  200),
        ('kn',  'knee.mp3',  200),
        ('wr',  'write.mp3', 200),
        ('sch', 'school.mp3',250),
        ('spr', 'spray.mp3', 250),
        ('str', 'street.mp3',250),
        # 辅音结尾
        ('ck',  'back.mp3',  200),
        # 特殊音节
        ('ble', 'table.mp3', 250),
        ('bit', 'rabbit.mp3',250),
        ('cil', 'pencil.mp3',250),
        ('tic', 'ticket.mp3',250),
        ('ty',  'city.mp3',  250),
        ('est', 'west.mp3',  250),
        ('ve',  'give.mp3',  200),
        ('te',  'late.mp3',  200),
        ('me',  'me.mp3',    200),
        ('ne',  'knee.mp3',  200),
        ('pen', 'pen.mp3',   200),
        ('ke',  'bike.mp3',  200),
        ('ta',  'table.mp3', 200),
        ('tal', 'tall.mp3',  250),
        ('mb',  'comb.mp3',  200),
        ('rab', 'crab.mp3',  200),
        ('tas', 'fantastic.mp3',250),
        ('hos', 'hospital.mp3',250),
        ('la',  'apple.mp3', 200),
        ('pi',  'pig.mp3',   200),
        ('bt',  'debt.mp3',  200),
        ('brel','umbrella.mp3',300),
        # 词末音节
        ('am',  'jam.mp3',   200),
        ('en',  'ten.mp3',   200),
        ('um',  'drum.mp3',  200),
        ('im',  'him.mp3',   200),
        ('in',  'bin.mp3',   200),
        ('on',  'on.mp3',    200),
    ]

    # 优先从 phonics/ 找源文件，没有再从 audio/
    def find_src(word_file):
        p1 = os.path.join(phonics, word_file)
        if os.path.exists(p1):
            return p1, 'phonics'
        p2 = os.path.join(base, word_file)
        if os.path.exists(p2):
            return p2, 'audio'
        return None, 'missing'

    done = 0
    skipped = 0
    failed = []
    for key, word_file, ms in items:
        src, loc = find_src(word_file)
        dst = os.path.join(out, f'ph_{key}.mp3')
        if src is None:
            print(f'  SKIP {key} ({word_file} missing)')
            skipped += 1
            continue
        ok = trim(src, dst, ms)
        if ok:
            done += 1
        else:
            failed.append(key)
        time.sleep(0.05)

    print(f'\nDone: {done}  Skipped: {skipped}  Failed: {failed}')
    if failed:
        print(f'Failed keys: {failed}')

    # 验证关键文件
    print('\nKey clips:')
    for k in ['b','ch','ph','ir','th','ee','oo','ai','ar']:
        p = os.path.join(out, f'ph_{k}.mp3')
        sz = os.path.getsize(p) if os.path.exists(p) else 0
        print(f'  ph_{k}.mp3: {sz}B')


if __name__ == '__main__':
    main()
