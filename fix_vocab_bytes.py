with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'rb') as f:
    content = f.read()

# 直接在字节层面查找和替换
# watch a DVD 的 IPA: /wɒtʃ ə ˌdiːviːˈdiː/
# 目标: /wɒtʃ ə ˌdiː viː ˈdiː/

old_dvd = b'/w\xc9\x92t\xca\x83 \xc9\x99 \xcc\x8cdi\xcb\x90vi\xcb\x90\xcb\x88di\xcb\x90/'
new_dvd = b'/w\xc9\x92t\xca\x83 \xc9\x99 \xcc\x8cdi\xcb\x90 vi\xcb\x90 \xcb\x88di\xcb\x90/'

print('Old pattern found:', old_dvd in content)

content = content.replace(old_dvd, new_dvd)

# listen to a CD 的 IPA: /ˈlɪsən tə ə ˌsiːˈdiː/
# 目标: /ˈlɪsən tə ə ˌsiː ˈdiː/
old_cd = b'/\xcb\x88l\xc9\xaas\xc9\x99n t\xc9\x99 \xc9\x99 \xcc\x8csi\xcb\x90\xcb\x88di\xcb\x90/'
new_cd = b'/\xcb\x88l\xc9\xaas\xc9\x99n t\xc9\x99 \xc9\x99 \xcc\x8csi\xcb\x90 \xcb\x88di\xcb\x90/'

print('Old CD pattern found:', old_cd in content)
content = content.replace(old_cd, new_cd)

with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'wb') as f:
    f.write(content)

print('Done')
