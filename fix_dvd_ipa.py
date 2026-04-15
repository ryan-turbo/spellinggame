with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'r', encoding='gbk') as f:
    content = f.read()

# 修复 watch a DVD 的 IPA
content = content.replace('/wɒtʃ ə ˌdiːviːˈdiː/', '/wɒtʃ ə ˌdiː viː ˈdiː/')

# 也修复 listen to a CD
content = content.replace('/ˈlɪsən tə ə ˌsiːˈdiː/', '/ˈlɪsən tə ə ˌsiː ˈdiː/')

with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'w', encoding='gbk') as f:
    f.write(content)

print('Done')
