import json, os, re

p = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'export default (\[.*\])', content, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    print(f'Total: {len(data)}')
    # Show entries with syllables
    syl_words = [w for w in data if len(w.get('syllables', [])) > 1]
    print(f'Words with syllables: {len(syl_words)}')
    for w in syl_words[:12]:
        print(f'  syllables={w.get("syllables")} word={w.get("word")} def={w.get("definition","")[:50]}')
