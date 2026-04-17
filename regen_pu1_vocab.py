
# Regenerate PU1 vocab with complete fields matching PU2/PU3 structure

from pu1_vocab_data import PU1_VOCAB
import os
import json

# Load existing image mapping
image_mapping = {}
mapping_file = "pu1_image_mapping.json"
if os.path.exists(mapping_file):
    with open(mapping_file, "r", encoding="utf-8") as f:
        image_mapping = json.load(f)

# Unit subtitles (Chinese translations)
UNIT_SUBTITLES = {
    "pu1u0": "颜色",
    "pu1u1": "我们的新学校",
    "pu1u2": "关于我们",
    "pu1u3": "农场乐趣",
    "pu1u4": "和朋友一起吃饭",
    "pu1u5": "生日快乐",
    "pu1u6": "一日游",
    "pu1u7": "一起玩",
    "pu1u8": "在家",
    "pu1u9": "快乐假期",
}

js_lines = [
    "// PU1 Vocabulary - 183 words, 10 units (Hello + Units 1-9)",
    "// Auto-generated from power up 1 级别.pdf",
    "",
    "export const PU1_VOCAB = {",
]

for unit_key, unit_data in PU1_VOCAB.items():
    js_lines.append(f'  "{unit_key}": {{')
    js_lines.append(f'    title: "{unit_data["title"]}",')
    js_lines.append(f'    subtitle: "{UNIT_SUBTITLES.get(unit_key, "")}",')
    js_lines.append('    words: [')
    
    for word in unit_data["words"]:
        w = word["word"]
        # Generate audio filename
        audio_fn = w.lower().replace(" ", "_").replace("-", "_") + ".mp3"
        # Generate image filename
        img_fn = image_mapping.get(w, f"{w.lower().replace(' ', '_').replace('-', '_')}.png")
        has_image = w in image_mapping
        
        # Escape definition quotes
        definition = word["definition"].replace('"', '\\"')
        phonetic = word["phonetic"].replace('"', '\\"')
        
        js_lines.append(f'      {{ word: "{w}", phonetic: "{phonetic}", chinese: "", definition: "{definition}", audio: "{audio_fn}", image: "images/{img_fn}", has_image: {str(has_image).lower()} }},')
    
    js_lines.append('    ],')
    js_lines.append('  },')

js_lines.append("};")
js_lines.append("")
js_lines.append("export default PU1_VOCAB;")

with open("web/src/data/pu1_vocab.js", "w", encoding="utf-8") as f:
    f.write("\n".join(js_lines))

print("Regenerated web/src/data/pu1_vocab.js with complete fields")
