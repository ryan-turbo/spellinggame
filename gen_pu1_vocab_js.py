
# Generate pu1_vocab.js from pu1_vocab_data.py

from pu1_vocab_data import PU1_VOCAB

js_lines = [
    "// PU1 Vocabulary - 183 words, 10 units (Hello + Units 1-9)",
    "// Auto-generated from power up 1 级别.pdf",
    "",
    "export const PU1_VOCAB = {",
]

for unit_key, unit_data in PU1_VOCAB.items():
    js_lines.append(f'  "{unit_key}": {{')
    js_lines.append(f'    title: "{unit_data["title"]}",')
    js_lines.append('    words: [')
    for word in unit_data["words"]:
        js_lines.append(f'      {{ word: "{word["word"]}", phonetic: "{word["phonetic"]}", definition: "{word["definition"]}" }},')
    js_lines.append('    ]')
    js_lines.append('  },')

js_lines.append("};")
js_lines.append("")
js_lines.append("export default PU1_VOCAB;")

with open("web/src/data/pu1_vocab.js", "w", encoding="utf-8") as f:
    f.write("\n".join(js_lines))

print("Generated web/src/data/pu1_vocab.js")
