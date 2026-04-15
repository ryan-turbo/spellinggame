with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'rb') as f:
    content = f.read()

# 尝试解码，忽略错误
text = content.decode('utf-8', errors='ignore')

print('File content preview (first 500 chars):')
print(text[:500])
print('\n...')
print('\nLast 200 chars:')
print(text[-200:])
