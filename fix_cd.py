with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'rb') as f:
    content = f.read()

# IPA: /ˈlɪsən tə ə ˌsiːˈdiː/
# 字节: / cb 88 6c c9 aa 73 c9 99 6e 20 74 c9 99 20 c9 99 20 cb 8c 73 69 cb 90 cb 88 64 69 cb 90/
# 需要在 siː 后加空格: /ˈlɪsən tə ə ˌsiː ˈdiː/

old = b'/\xcb\x88\x6c\xc9\xaa\x73\xc9\x99\x6e\x20\x74\xc9\x99\x20\xc9\x99\x20\xcb\x8c\x73\x69\xcb\x90\xcb\x88\x64\x69\xcb\x90/'
new = b'/\xcb\x88\x6c\xc9\xaa\x73\xc9\x99\x6e\x20\x74\xc9\x99\x20\xc9\x99\x20\xcb\x8c\x73\x69\xcb\x90\x20\xcb\x88\x64\x69\xcb\x90/'

print('Old pattern found:', old in content)
content = content.replace(old, new)

with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'wb') as f:
    f.write(content)

print('Done - CD IPA fixed')
