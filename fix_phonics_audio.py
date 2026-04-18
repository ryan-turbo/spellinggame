"""重新生成 phonics 音频 + 修复 0 字节词音频"""
import os, subprocess

PHONICS = r"F:\pu-spelling-game\web\public\audio\phonics"
AUDIO   = r"F:\pu-spelling-game\web\public\audio"
VOICE   = "en-GB-RyanNeural"

os.makedirs(PHONICS, exist_ok=True)

def synthesize(text, out_path):
    r = subprocess.run([
        "edge-tts", "--voice", VOICE,
        "--text", text, "--write-media", out_path
    ], capture_output=True, encoding='utf-8', errors='replace')
    if r.returncode != 0:
        raise RuntimeError(r.stderr.decode('utf-8', errors='replace') if r.stderr else 'unknown')
    return os.path.getsize(out_path)

def has_mp3_frames(path):
    """检查 MP3 文件是否有可播放的音频帧（不含仅 ID3 头的情况）"""
    try:
        with open(path, 'rb') as f:
            data = f.read()
        if len(data) < 1000:
            return False
        # edge-tts 输出 MPEG-2.5，帧同步 0xFF 0xFB/FA/F9/F8
        found = False
        for i in range(len(data) - 4):
            if data[i] == 0xFF and (data[i+1] & 0xE0) == 0xE0:
                found = True
                break
        return found
    except:
        return False

def file_ok(path):
    sz = os.path.getsize(path) if os.path.exists(path) else 0
    # 严格阈值：edge-tts 生成的 MP3 最少 ~2000 bytes
    # 损坏文件只有 ID3 头（~747-1267 bytes）
    return sz >= 2000

# ── 音素配置：key → source_word ───────────────────────────────
# 用整词音频，浏览器 playbackRate=2 加速到 ~2x
PHONES = {
    "a":  "cat",    "b":  "bat",    "c":  "cat",    "d":  "dog",
    "e":  "egg",    "f":  "fish",   "g":  "dog",    "h":  "hat",
    "i":  "bit",    "j":  "jam",    "k":  "key",    "l":  "leg",
    "m":  "map",    "n":  "net",    "o":  "dog",    "p":  "pig",
    "r":  "red",    "s":  "sun",    "t":  "top",    "u":  "cup",
    "v":  "van",    "w":  "web",    "x":  "box",    "y":  "yes",
    "z":  "zip",
    # 辅音组合
    "ch": "chip",   "sh": "ship",   "th": "think",  "TH": "this",
    "wh": "when",   "ng": "sing",   "nk": "bank",   "ck": "sock",
    "bl": "black",  "cl": "clock",  "fl": "flag",   "fr": "frog",
    "dr": "drum",   "tr": "tree",   "cr": "crab",   "br": "brick",
    "sp": "spoon",  "st": "star",   "sl": "sleep",  "sn": "snake",
    "sw": "swan",   "tw": "twins",  "kn": "knee",   "pl": "plate",
    "qu": "queen",  "sch":"school", "spr":"spray",  "str":"street",
    "wr": "wrist",
    # 元音
    "ai": "rain",   "ay": "day",    "ee": "sheep",  "ea": "leaf",
    "oa": "boat",   "oo": "moon",   "ow": "rain",   "oi": "coin",
    "oy": "boy",    "ou": "mouth",  "ar": "car",    "or": "fork",
    "ir": "bird",   "ur": "nurse",  "er": "her",
    "are":"care",   "aw": "saw",    "air":"chair",  "eer":"deer",
    "a_e":"cake",
    # 音节
    "am": "lamp",   "en": "pen",    "um": "cup",    "im": "jump",
    "in": "pin",    "on": "pond",   "me": "me",     "ne": "me",
    "fan":"fan",    "had":"hat",    "ke": "cake",   "ta": "plate",
    "tal":"metal",  "tas":"cats",   "hos":"box",    "la": "lamp",
    "pi": "pig",    "bt": "rabbit", "brel":"table", "rab":"rabbit",
    "bit":"bit",    "ve": "have",   "te": "plate",  "cil":"pencil",
    "tic":"magic",  "ty": "city",   "est":"best",   "mb": "lamb",
    "pen":"pen",    "ph": "phone",
}

# 所有目标文件名
ALL_PH_FILES = [f"ph_{k}.mp3" for k in PHONES]

def main():
    # ── 修复 phonics 音频 ────────────────────────────────────
    print("=== Regenerating broken phonics audio ===")
    fixed = 0
    for fname in sorted(ALL_PH_FILES):
        key = fname[3:-4]
        if key not in PHONES:
            print(f"  SKIP {fname} (no config)")
            continue
        word = PHONES[key]
        out  = os.path.join(PHONICS, fname)
        if file_ok(out):
            sz = os.path.getsize(out)
            print(f"  . {fname} ({sz}B OK)")
            fixed += 1
            continue
        print(f"  [+] {fname} <- '{word}'...", end=" ", flush=True)
        try:
            sz = synthesize(word, out)
            print(f"OK {sz}B")
            fixed += 1
        except Exception as e:
            print(f"ERROR: {e}")

    # 统计当前状态
    all_ph = [f for f in os.listdir(PHONICS) if f.startswith('ph_') and f.endswith('.mp3')]
    ok_count = sum(1 for f in all_ph if file_ok(os.path.join(PHONICS, f)))
    print(f"\n  Total: {ok_count}/{len(all_ph)} files valid")
    print(f"  Fixed: {fixed}")

    # ── 修复 0 字节词音频 ────────────────────────────────────
    print("\n=== Fixing 0-byte word audio ===")
    for w in ["mango", "milkshake"]:
        path = os.path.join(AUDIO, f"{w}.mp3")
        sz = os.path.getsize(path) if os.path.exists(path) else 0
        status = "OK" if sz > 100 else "BROKEN"
        print(f"  {w}.mp3: {sz}B [{status}]", end="")
        if sz < 100:
            print(f" -> synthesizing...", end=" ", flush=True)
            try:
                synthesize(w, path)
                print(f"OK {os.path.getsize(path)}B")
            except Exception as e:
                print(f"ERROR: {e}")
        else:
            print()

    print("\nDone!")

if __name__ == "__main__":
    main()
