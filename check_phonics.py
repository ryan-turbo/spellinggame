import pathlib, re

f = pathlib.Path('web/src/data/phonics_vocab.js').read_text(encoding='utf-8')

# Show each Level 1 unit's first few words
for uk in ['phL1u1', 'phL1u2', 'phL1u3']:
    idx = f.find(uk)
    if idx >= 0:
        chunk = f[idx:idx+800]
        words = re.findall(r'word:\s*"([^"]+)"', chunk)
        print(f'{uk}: {words}')
