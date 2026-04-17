# -*- coding: utf-8 -*-
import pdfplumber, sys, os

out_path = os.path.join(os.path.dirname(__file__), '_ipa_text_out.txt')
with open(out_path, 'w', encoding='utf-8') as out:
    with pdfplumber.open(r'C:\Users\ryan0\Desktop\ipa_pics_TrainingACC.pdf') as pdf:
        out.write(f'Pages: {len(pdf.pages)}\n')
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                out.write(f'--- Page {i+1} ---\n')
                out.write(text + '\n')
            else:
                out.write(f'Page {i+1}: no text\n')
print('Done:', out_path)
