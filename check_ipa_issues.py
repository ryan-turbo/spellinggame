# -*- coding: utf-8 -*-
"""Diagnose IPA syllable/letter mismatch in PU2/PU3 vocab"""
import re, sys

# Set stdout to utf-8
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Current App.jsx vowel list
VOWEL_PHONEMES = [
    'iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə',
    'ɑː','ɔː','ɜː','ɪ','ʊ','uː','e','æ','ʌ','ə','ɒ','ɔ','ɑ',
]

def get_ipa_vowels(phonetic):
    stripped = phonetic.replace('/', '')
    vowels = []
    pos = 0
    while pos < len(stripped):
        ch = stripped[pos]
        if ch in '\u02c8\u02d0':  # ˈˌ
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

    # Letter allocation by IPA length ratio
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
    with open(filepath, encoding='utf-8') as f:
        content = f.read()

    # Match { ... "word": "...", ... "phonetic": "..." ... }
    # This handles both single and double quotes, and multiline
    word_pattern = re.compile(
        r'\{\s*(?:["\'])word(?:["\'])\s*:\s*(?:["\'])([^"\']+)(?:["\'])',
        re.DOTALL
    )
    phon_pattern = re.compile(
        r'\{\s*(?:["\'])phonetic(?:["\'])\s*:\s*(?:["\'])([^"\']+)(?:["\'])',
        re.DOTALL
    )
    # Match each word block
    blocks = re.findall(r'\{\s*(?:["\'])word(?:["\'])\s*:\s*(?:["\'])([^"\']+)(?:["\'])[^}]*?\{\s*(?:["\'])phonetic(?:["\'])\s*:\s*(?:["\'])([^"\']+)(?:["\'])', content, re.DOTALL)
    return [{'word': b[0].strip(), 'phonetic': b[1].strip()} for b in blocks]

results = []

for name, filepath in [('PU2', 'web/src/data/pu2_vocab.js'), ('PU3', 'web/src/data/pu3_vocab.js')]:
    words = extract_words(filepath)
    print(f"\n{'='*60}")
    print(f"{name}: {len(words)} words checked")
    print(f"{'='*60}\n")

    for w in words:
        word = w['word']
        phonetic = w['phonetic']
        if not phonetic or phonetic == '':
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
            issues.append(f"IPA vowels({num_ipa_vowels}) != syllables({num_syllables})")

        # Rule 2: Letter/IPA ratio should be reasonable (0.8-1.3)
        if total_ipa > 0:
            ratio = total_letters / total_ipa
            if ratio < 0.8 or ratio > 1.3:
                issues.append(f"Letter/IPA ratio={total_letters}/{total_ipa}={ratio:.2f} OUT OF RANGE")

        # Rule 3: Each syllable should have a reasonable letter count vs IPA
        for i, syl in enumerate(syllables):
            syl_ipa = syl['ipa'].replace('/','').replace('\u02c8','').replace('\u02d0','')
            syl_len_ipa = len(syl_ipa)
            syl_len_letters = len(syl['letters'])
            if syl_len_ipa > 0 and syl_len_letters > 0:
                r = syl_len_letters / syl_len_ipa
                if r < 0.5 or r > 2.5:
                    issues.append(f"Syllable{i+1} [{syl['letters']}]/{syl_ipa}={r:.1f} SUSPECT")

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
    print(f"  {r['word']:20} {r['phonetic']}")
