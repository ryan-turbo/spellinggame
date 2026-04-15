# -*- coding: utf-8 -*-
"""Diagnose IPA syllable/letter mismatch in PU2/PU3 vocab"""
import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Current App.jsx vowel list
VOWEL_PHONEMES = [
    'i\xcb\x90','e\xca\x89','a\xca\xa0','\xc9\x94\xca\xb0','a\xca\x90',
    '\xc9\xaa\xc9\x99','e\xcb\x99','\xc9\x90\xc9\x99',  # iː eɪ aɪ ɔɪ aʊ ɪə eə ʊə
    '\xc9\x91\xcb\x90','\xc9\x94\xcb\x90','\xcb\x9c\xcb\x90',  # ɑː ɔː ɜː
    '\xc9\xaa','\xc9\x90','u\xcb\x90','e','\xc3\xa6','\xc8\xad','\xc9\x99','\xc7\x92','\xc9\x94','\xc9\x91',  # ɪ ʊ uː e æ ʌ ə ɒ ɔ ɑ
]

def get_ipa_vowels(phonetic):
    stripped = phonetic.replace('/', '')
    vowels = []
    pos = 0
    while pos < len(stripped):
        if stripped[pos] in '\u02c8\u02d0':  # stress marks
            pos += 1
            continue
        matched = False
        for vp in VOWEL_PHONEMES:
            if stripped[pos:pos+len(vp)] == vp:
                vowels.append({'ipa': vp, 'pos': pos})
                pos += len(vp)
                matched = True
                break
        if not matched:
            pos += 1
    return vowels, stripped

def split_syllables(word, phonetic):
    if not phonetic:
        return [{'letters': word, 'ipa': ''}]
    vowels, stripped = get_ipa_vowels(phonetic)
    if len(vowels) == 0:
        return [{'letters': word, 'ipa': ''}]
    if len(vowels) == 1:
        return [{'letters': word, 'ipa': phonetic}]

    syllable_ipas = []
    prev_pos = 0
    for i in range(1, len(vowels)):
        gap_start = vowels[i-1]['pos'] + len(vowels[i-1]['ipa'])
        gap_end = vowels[i]['pos']
        gap = stripped[gap_start:gap_end]
        gap_clean = gap.replace('\u02c8','').replace('\u02d0','')
        gap_len = len(gap_clean)

        if gap_len == 0:
            syllable_ipas.append(stripped[prev_pos:gap_start])
            prev_pos = gap_start
        elif gap_len == 1:
            syllable_ipas.append(stripped[prev_pos:gap_start])
            prev_pos = gap_start
        elif gap_len == 2:
            syllable_ipas.append(stripped[prev_pos:gap_start+1])
            prev_pos = gap_start + 1
        else:
            mid = gap_len // 2
            actual_split = gap_start + mid
            syllable_ipas.append(stripped[prev_pos:actual_split])
            prev_pos = actual_split
    syllable_ipas.append(stripped[prev_pos:])

    ipa_lengths = [len(ip.replace('\u02c8','').replace('\u02d0','')) for ip in syllable_ipas]
    total_ipa_len = sum(ipa_lengths)
    if total_ipa_len == 0:
        return [{'letters': word, 'ipa': phonetic}]

    word_clean = word.replace(' ', '')
    letter_counts = [round(l / total_ipa_len * len(word_clean)) for l in ipa_lengths]
    diff = len(word_clean) - sum(letter_counts)
    for j in range(abs(diff)):
        if diff > 0:
            letter_counts[j % len(letter_counts)] += 1
        else:
            for k in range(len(letter_counts)):
                if letter_counts[k] > 1:
                    letter_counts[k] -= 1
                    break

    result = []
    w_pos = 0
    for i, ipa in enumerate(syllable_ipas):
        letters = word_clean[w_pos:w_pos+letter_counts[i]]
        w_pos += letter_counts[i]
        result.append({'letters': letters, 'ipa': '/'+ipa+'/'})
    return result

def extract_words(filepath):
    with open(filepath, 'rb') as f:
        raw = f.read()
    content = raw.decode('utf-8', errors='replace')

    # Keys use double quotes: { word: "river", phonetic: "/.../" }
    pairs = re.findall(r'\{[^}]*?word:\s*"([^"]+)"[^}]*?phonetic:\s*"([^"]+)"[^}]*?\}', content, re.DOTALL)
    return [{'word': p[0].strip(), 'phonetic': p[1].strip()} for p in pairs]

results = []

for name, filepath in [('PU2', 'web/src/data/pu2_vocab.js'), ('PU3', 'web/src/data/pu3_vocab.js')]:
    words = extract_words(filepath)
    print(f"\n{'='*60}")
    print(f"{name}: {len(words)} words checked")
    print(f"{'='*60}\n")

    for w in words:
        word = w['word']
        phonetic = w['phonetic']
        if not phonetic.strip():
            continue

        syllables = split_syllables(word, phonetic)
        vowels, stripped = get_ipa_vowels(phonetic)
        num_ipa_vowels = len(vowels)
        num_syllables = len(syllables)
        word_clean = word.replace(' ', '')
        ipa_clean = stripped.replace('\u02c8','').replace('\u02d0','')
        total_ipa = len(ipa_clean)
        total_letters = len(word_clean)

        issues = []

        # Rule 1: IPA vowel count should equal syllable count
        if num_ipa_vowels != num_syllables:
            issues.append(f"VOWEL_COUNT: IPA={num_ipa_vowels}, Syll={num_syllables}")

        # Rule 2: Overall letter/IPA ratio
        if total_ipa > 0:
            ratio = total_letters / total_ipa
            if ratio < 0.8 or ratio > 1.3:
                issues.append(f"RATIO: {total_letters}L/{total_ipa}I={ratio:.2f}")

        # Rule 3: Per-syllable suspicious letter/IPA ratio
        for i, syl in enumerate(syllables):
            syl_ipa = syl['ipa'].replace('/','').replace('\u02c8','').replace('\u02d0','')
            syl_len_ipa = len(syl_ipa)
            syl_len_letters = len(syl['letters'])
            if syl_len_ipa > 0 and syl_len_letters > 0:
                r = syl_len_letters / syl_len_ipa
                if r < 0.4 or r > 3.0:
                    issues.append(f"SYL{i+1}: [{syl['letters']}]/{syl_ipa}={r:.1f}")

        # Rule 4: Empty syllable
        if any(len(s['letters']) == 0 for s in syllables):
            issues.append("EMPTY_SYLL")

        if issues:
            print(f"### {word}  {phonetic}")
            for iss in issues:
                print(f"  ISSUE: {iss}")
            for syl in syllables:
                print(f"  [{syl['letters']:>15}] -> {syl['ipa']}")
            print()
            results.append({'word': word, 'phonetic': phonetic, 'syllables': syllables, 'issues': issues})

print(f"\n{'='*60}")
print(f"Total problems: {len(results)}")
print()
for r in results:
    print(f"  {r['word']:25} {r['phonetic']}")
