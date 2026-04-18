// 测试 PhonicsCombineGame 完成逻辑
const queue = [{ word: 'test1' }, { word: 'test2' }];
let current = 0;
let finished = false;

function completeWord() {
  const next = current + 1;
  if (next >= queue.length) {
    finished = true;
    console.log('Challenge complete! finished:', finished);
  } else {
    current = next;
    console.log('Next word, current:', current);
  }
}

console.log('Initial - current:', current, 'finished:', finished);
completeWord(); // 完成第一个词
console.log('After word 1 - current:', current, 'finished:', finished);
completeWord(); // 完成第二个词（最后一个）
console.log('After word 2 - current:', current, 'finished:', finished);
