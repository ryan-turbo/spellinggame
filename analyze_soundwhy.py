#!/usr/bin/env python3
import requests, re, sys, json

sys.stdout.reconfigure(encoding='utf-8')

base = 'https://soundwhy.com'
r = requests.get(base, timeout=10)
html = r.text

# Look for embedded JSON data in __NEXT_DATA__ or similar
next_data = re.search(r'<script id="__NEXT_DATA__[^>]*>(.*?)</script>', html, re.DOTALL)
if next_data:
    try:
        data = json.loads(next_data.group(1))
        print('NEXT_DATA found! Keys:', list(data.keys()))
        props = data.get('props', {})
        print('Props keys:', list(props.keys()))
        page_props = props.get('pageProps', {})
        print('PageProps keys:', list(page_props.keys()))
        # Look for phoneme data
        if 'phoneme' in str(page_props).lower():
            print('Has phoneme data!')
            print(str(page_props)[:1000])
    except Exception as e:
        print(f'JSON parse error: {e}')

# Look for audio references in main JS bundle
js_file = base + '/_next/static/chunks/fd9d1056-2821b0f0cabcd8bd.js'
r2 = requests.get(js_file, timeout=15)
content = r2.text

# Find all fetch/XHR patterns
fetch_calls = re.findall(r'fetch\([^)]{0,200}\)', content)
print(f'\nFetch calls: {len(fetch_calls)}')
for fc in fetch_calls[:10]:
    print(f'  {fc[:150]}')

# Find URL construction patterns
url_patterns = re.findall(r'["\']https?://[^\s"\']+', content)
print(f'\nURLs ({len(url_patterns)}):')
for u in url_patterns[:20]:
    print(f'  {u}')

# Look for fetch( string concatenation
concat_fetch = re.findall(r'fetch\s*\(\s*[+\w]+\s*\+', content)
print(f'\nConcat fetch: {len(concat_fetch)}')
for cf in concat_fetch[:10]:
    print(f'  {cf[:100]}')

# Look for XMLHttpRequest patterns
xhr = re.findall(r'XMLHttpRequest[^;]{0,300}', content)
print(f'\nXHR patterns: {len(xhr)}')
for x in xhr[:5]:
    print(f'  {x[:200]}')

# Look for POST data or API paths
api_paths = re.findall(r'["\'](/api/[^"\']+)["\']', content)
print(f'\nAPI paths: {api_paths[:20]}')

# Look for phoneme-related strings
for keyword in ['phoneme', 'phonetic', 'phoneme_b', 'phoneme_bat']:
    idx = content.find(keyword)
    if idx >= 0:
        print(f'\n"{keyword}" at {idx}: {content[max(0,idx-50):idx+200]}')
