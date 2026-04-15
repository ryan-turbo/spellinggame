with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'rb') as f:
    content = f.read()

# 找 listen to a CD 的位置
idx = content.find(b'listen to a CD')
if idx >= 0:
    snippet = content[idx:idx+150]
    print('Found "listen to a CD"')
    print('Hex bytes:')
    print(' '.join(f'{b:02x}' for b in snippet[:120]))
