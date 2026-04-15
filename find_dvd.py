with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'rb') as f:
    content = f.read()

# 找 watch a DVD 的位置
idx = content.find(b'watch a DVD')
if idx >= 0:
    # 显示周围 200 字节
    start = max(0, idx - 50)
    end = min(len(content), idx + 200)
    snippet = content[start:end]
    print('Found "watch a DVD" at position:', idx)
    print('\nHex bytes around it:')
    for i in range(0, len(snippet), 16):
        hex_line = ' '.join(f'{b:02x}' for b in snippet[i:i+16])
        print(hex_line)
    print('\nTrying to decode:')
    # 尝试解码
    try:
        decoded = snippet.decode('utf-8', errors='replace')
        print(decoded)
    except:
        print('Decode failed')
else:
    print('watch a DVD not found in file')
