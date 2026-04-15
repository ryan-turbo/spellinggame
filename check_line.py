with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'rb') as f:
    content = f.read()

idx = content.find(b'watch a DVD')
if idx >= 0:
    # 找这一行的结尾
    end = content.find(b'\r\n', idx)
    line = content[idx:end]
    print('Full line:')
    print(line)
    print('\nLength:', len(line))
