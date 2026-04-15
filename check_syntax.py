with open('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'rb') as f:
    content = f.read()

# 验证基本结构
print('File size:', len(content))
print('Starts with // PU2:', content[:10] == b'// PU2 Voc')
print('Ends with };', content[-3:] == b'};\r')

# 检查引号配对
single_quotes = content.count(b"'")
double_quotes = content.count(b'"')
print(f'Single quotes: {single_quotes}, Double quotes: {double_quotes}')

# 查找可能的语法错误
try:
    text = content.decode('utf-8', errors='replace')
    # 检查括号配对
    print('Opening braces:', text.count('{'))
    print('Closing braces:', text.count('}'))
except Exception as e:
    print('Decode error:', e)
