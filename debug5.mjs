const w='have breakfast';
const p='/hæv ˈbrekfəst/';
const ip=p.replace(/[\[\]\/]/g,'').split(/\s+/);
console.log('word:',w);
console.log('word parts:',w.split(' '));
console.log('IPA parts:',ip);
console.log('parts count:',w.split(' ').length, 'vs', ip.length);
