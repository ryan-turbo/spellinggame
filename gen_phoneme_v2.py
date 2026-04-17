#!/usr/bin/env python3
"""
用 ffmpeg 从真实单词音频截取音素 onset（v2：调整时长）
- 单辅音 onset: ~80ms（干净截取 /b/ /d/ /p/ 等）
- 元音（含短元音、长元音、元音组合）: 180~350ms
- r-controlled: 350ms
- 辅音二合字母: 120ms
"""
import os, subprocess, time

FFMPEG = r'D:\Program Files\Krita (x64)\bin\ffmpeg.exe'
BASE = r'F:\pu-spelling-game\web\public\audio'
PHONICS = os.path.join(BASE, 'phonics')

def trim(src, dst, ms):
    cmd = [FFMPEG, '-y', '-ss', '0', '-t', str(ms/1000),
           '-i', src, '-acodec', 'libmp3lame', '-q:a', '2',
           '-ar', '44100', '-ac', '1', dst]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode == 0:
        sz = os.path.getsize(dst)
        print(f'  OK {os.path.basename(dst)} ({sz}B, {ms}ms)')
        return True
    print(f'  FAIL {dst}: {r.stderr[-80:].decode("utf8","ignore")}')
    return False

# (key, source_word, trim_ms, source_dir)
# ms 含义：
#   辅音字母（单）：80ms（干净截取 onset）
#   短元音字母：180ms
#   元音字母组合：250-300ms
#   r-controlled: 350ms
#   辅音二合/组合：100-120ms
# source_dir: 'phonics' | 'audio'
ITEMS = [
    # ── 单辅音（80ms）─────────────────────────────────────────────
    ('b',   'bat.mp3',    80, 'audio'),
    ('c',   'cat.mp3',    80, 'audio'),
    ('d',   'dog.mp3',    80, 'audio'),
    ('f',   'fish.mp3',   80, 'audio'),
    ('g',   'go.mp3',     80, 'audio'),
    ('h',   'hat.mp3',    80, 'audio'),
    ('j',   'jam.mp3',    80, 'audio'),
    ('k',   'cat.mp3',    80, 'audio'),
    ('l',   'lion.mp3',   80, 'audio'),
    ('m',   'me.mp3',     80, 'audio'),
    ('n',   'net.mp3',    80, 'audio'),
    ('p',   'pig.mp3',    80, 'audio'),
    ('r',   'red.mp3',    80, 'audio'),
    ('s',   'sun.mp3',    80, 'audio'),
    ('t',   'top.mp3',    80, 'audio'),
    ('v',   'van.mp3',    80, 'audio'),
    ('w',   'wet.mp3',    80, 'audio'),
    ('y',   'yes.mp3',    80, 'audio'),
    ('z',   'zip.mp3',    80, 'audio'),
    ('x',   'box.mp3',    80, 'audio'),
    # ── 短元音（180ms）────────────────────────────────────────────
    ('a',   'hat.mp3',   180, 'audio'),
    ('e',   'bed.mp3',   180, 'audio'),
    ('i',   'sit.mp3',   180, 'audio'),
    ('o',   'pot.mp3',   180, 'audio'),
    ('u',   'bus.mp3',   180, 'audio'),
    # ── 元音字母组合（250~300ms）───────────────────────────────────
    ('ai',  'rain.mp3',  250, 'audio'),
    ('ay',  'day.mp3',   250, 'audio'),
    ('ee',  'see.mp3',   250, 'phonics'),
    ('ea',  'tea.mp3',   250, 'audio'),
    ('oa',  'boat.mp3',  250, 'audio'),
    ('oo',  'moon.mp3',  250, 'audio'),
    ('ow',  'cow.mp3',   250, 'audio'),
    ('oi',  'coin.mp3',  250, 'audio'),
    ('oy',  'boy.mp3',   250, 'phonics'),
    ('ou',  'out.mp3',   250, 'audio'),
    # ── r-controlled（350ms）───────────────────────────────────────
    ('ar',  'car.mp3',   350, 'audio'),
    ('or',  'door.mp3',  350, 'audio'),
    ('ir',  'bird.mp3',  350, 'phonics'),
    ('ur',  'turn.mp3',  350, 'phonics'),
    ('er',  'bird.mp3',  350, 'phonics'),
    ('are', 'care.mp3',  350, 'phonics'),
    # ── 辅音二合字母（100~120ms）───────────────────────────────────
    ('ch',  'chip.mp3',  120, 'audio'),
    ('sh',  'ship.mp3', 120, 'audio'),
    ('ph',  'fish.mp3', 120, 'audio'),
    ('th',  'think.mp3',150, 'audio'),
    ('TH',  'this.mp3', 150, 'audio'),
    ('wh',  'what.mp3', 120, 'audio'),
    ('ng',  'sing.mp3', 120, 'audio'),
    ('nk',  'bank.mp3', 150, 'audio'),
    ('ck',  'back.mp3', 120, 'audio'),
    # ── 辅音组合（100~120ms）───────────────────────────────────────
    ('bl',  'blue.mp3', 100, 'audio'),
    ('cl',  'clap.mp3', 100, 'audio'),
    ('fl',  'fly.mp3',  100, 'audio'),
    ('fr',  'frog.mp3', 100, 'audio'),
    ('dr',  'drum.mp3', 100, 'audio'),
    ('tr',  'tree.mp3', 100, 'audio'),
    ('cr',  'crab.mp3', 100, 'audio'),
    ('br',  'bread.mp3',100, 'audio'),
    ('sp',  'spoon.mp3',100, 'phonics'),
    ('st',  'star.mp3', 100, 'audio'),
    ('sl',  'slow.mp3', 100, 'audio'),
    ('sn',  'snail.mp3',100, 'phonics'),
    ('sw',  'swim.mp3', 100, 'audio'),
    ('tw',  'twin.mp3', 100, 'phonics'),
    ('kn',  'knee.mp3', 100, 'audio'),
    ('wr',  'write.mp3',100, 'audio'),
    ('sch', 'school.mp3',120, 'audio'),
    ('spr', 'spray.mp3',120, 'audio'),
    ('str', 'street.mp3',120,'audio'),
    # ── 特殊音节（180~250ms）────────────────────────────────────────
    ('ble', 'table.mp3', 250, 'phonics'),
    ('bit', 'rabbit.mp3',250,'phonics'),
    ('cil', 'pencil.mp3',250,'phonics'),
    ('tic', 'ticket.mp3',250,'phonics'),
    ('ty',  'city.mp3',  250, 'phonics'),
    ('est', 'west.mp3',  250, 'phonics'),
    ('ve',  'give.mp3',  180, 'audio'),
    ('te',  'late.mp3',  180, 'phonics'),
    ('me',  'me.mp3',    180, 'audio'),
    ('ne',  'knee.mp3',  180, 'audio'),
    ('pen', 'pen.mp3',   180, 'audio'),
    ('ke',  'bike.mp3',  180, 'phonics'),
    ('ta',  'table.mp3', 180, 'phonics'),
    ('tal', 'tall.mp3',  250, 'phonics'),
    ('mb',  'comb.mp3',  120, 'phonics'),
    ('rab', 'crab.mp3',  100, 'audio'),
    ('tas', 'fantastic.mp3',250,'phonics'),
    ('hos', 'hospital.mp3',250,'phonics'),
    ('la',  'apple.mp3', 180, 'phonics'),
    ('pi',  'pig.mp3',   180, 'audio'),
    ('bt',  'debt.mp3',  120, 'phonics'),
    ('brel','umbrella.mp3',300,'phonics'),
    # ── 词末音节（180~200ms）───────────────────────────────────────
    ('am',  'jam.mp3',   180, 'audio'),
    ('en',  'ten.mp3',   180, 'audio'),
    ('um',  'drum.mp3',  180, 'audio'),
    ('im',  'him.mp3',   180, 'audio'),
    ('in',  'bin.mp3',   180, 'audio'),
    ('on',  'on.mp3',   180, 'phonics'),
    # ── 补充：常见特殊发音（80ms）───────────────────────────────────
    ('fan', 'fan.mp3',   80, 'audio'),
    ('had', 'had.mp3',   80, 'audio'),
]

def find_src(word_file, src_dir):
    # 优先从 audio/ 找（音质更好），找不到再从 phonics/ 找
    p_audio = os.path.join(BASE, word_file)
    p_ph = os.path.join(PHONICS, word_file)
    if os.path.exists(p_audio): return p_audio
    if os.path.exists(p_ph): return p_ph
    return None

done = skipped = failed = 0
for key, word_file, ms, src_dir in ITEMS:
    src = find_src(word_file, src_dir)
    dst = os.path.join(PHONICS, f'ph_{key}.mp3')
    if src is None:
        print(f'  SKIP {key} ({word_file} missing)')
        skipped += 1
        continue
    ok = trim(src, dst, ms)
    if ok: done += 1
    else: failed += 1
    time.sleep(0.04)

print(f'\nDone: {done}  Skipped: {skipped}  Failed: {failed}')
# 验证关键文件
print('\nKey clips:')
for k in ['b','ch','ph','ir','th','ee','oo','ai','ar']:
    p = os.path.join(PHONICS, f'ph_{k}.mp3')
    sz = os.path.getsize(p) if os.path.exists(p) else 0
    print(f'  ph_{k}.mp3: {sz}B')
