const V=['iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə','ɑː','ɔː','uː','ɜː','ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ','a','i','o','u'];
const st='ˈwenzdeɪ';
const vu=[];let pp=0;
while(pp<st.length){
  if(st[pp]==='ˈ'||st[pp]==='ˌ'){pp++;continue;}
  let matched=false;
  for(const vp of V){if(st.slice(pp,pp+vp.length)===vp){vu.push({i:vp,cp:pp});pp+=vp.length;matched=true;break;}}
  if(!matched)pp++;
}
console.log('vowels:',vu);
console.log('gap start:',vu[0].cp+vu[0].i.length);
console.log('gap end:',vu[1].cp);
console.log('gap chars:',st.slice(vu[0].cp+vu[0].i.length, vu[1].cp));
console.log('gap length:',st.slice(vu[0].cp+vu[0].i.length, vu[1].cp).length);
