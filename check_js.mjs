import fs from 'fs';
const content = fs.readFileSync('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'utf8');
try {
  new Function(content);
  console.log('Syntax OK');
} catch (e) {
  console.log('Syntax error:', e.message);
  // 找错误位置
  const match = e.message.match(/at position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    console.log('Error at position:', pos);
    console.log('Context:', content.substring(Math.max(0, pos - 50), pos + 50));
  }
}
