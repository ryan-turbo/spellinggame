with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'rb') as f:
    content = f.read()

# IPA: /wɒtʃ ə ˌdiːviːˈdiː/
# 字节: /w c9 92 t ca 83 20 c9 99 20 cb 8c 64 69 cb 90 76 69 cb 90 cb 88 64 69 cb 90/
# 需要在 vi 前加空格: /wɒtʃ ə ˌdiː viː ˈdiː/

old = b'/w\xc9\x92t\xca\x83 \xc9\x99 \xcb\x8c\x64\x69\xcb\x90\x76\x69\xcb\x90\xcb\x88\x64\x69\xcb\x90/'
new = b'/w\xc9\x92t\xca\x83 \xc9\x99 \xcb\x8c\x64\x69\xcb\x90 \x76\x69\xcb\x90 \xcb\x88\x64\x69\xcb\x90/'

print('Old pattern found:', old in content)
content = content.replace(old, new)

with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'wb') as f:
    f.write(content)

print('Done - DVD IPA fixed')

# 验证
with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'rb') as f:
    new_content = f.read()
    
idx = new_content.find(b'watch a DVD')
if idx >= 0:
    snippet = new_content[idx:idx+150]
    print('\nNew bytes:')
    print(' '.join(f'{b:02x}' for b in snippet[:100]))
