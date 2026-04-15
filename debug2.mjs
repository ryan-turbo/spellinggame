const CM=[
  {l:'sh',i:'ʃ'},{l:'ch',i:'tʃ'},{l:'th',i:'θ'},{l:'ph',i:'f'},{l:'wh',i:'w'},{l:'wr',i:'r'},
  {l:'kn',i:'n'},{l:'ng',i:'ŋ'},{l:'ck',i:'k'},{l:'sc',i:'s'},{l:'gh',i:''},{l:'mb',i:'m'},
  {l:'b',i:'b'},{l:'c',i:'k'},{l:'d',i:'d'},{l:'f',i:'f'},{l:'g',i:'ɡ'},{l:'h',i:'h'},
  {l:'j',i:'dʒ'},{l:'k',i:'k'},{l:'l',i:'l'},{l:'m',i:'m'},{l:'n',i:'n'},{l:'p',i:'p'},
  {l:'qu',i:'kw'},{l:'r',i:'r'},{l:'s',i:'s'},{l:'t',i:'t'},{l:'v',i:'v'},{l:'w',i:'w'},
  {l:'x',i:'ks'},{l:'y',i:'j'},{l:'z',i:'z'},
];
function mO(letters,pos,ipa){
  if(pos>=letters.length||ipa.length===0)return{ci:0,cl:0};
  for(const{l:dl,i:di}of CM){
    if(letters.slice(pos,pos+dl.length).toLowerCase()===dl){
      if(di==='')return{ci:0,cl:dl.length};
      if(ipa.startsWith(di))return{ci:di.length,cl:dl.length};
    }
  }
  const lc=letters[pos];
  if('aeiouy'.includes(lc)){
    const vc=[
      {l:'a',i:['ɑː','æ','ɒ','eɪ']},{l:'e',i:['e']},{l:'i',i:['ɪ','aɪ','iː']},
      {l:'o',i:['ɒ','əʊ','ʌ']},{l:'u',i:['ʌ','ʊ','uː','ə']},{l:'y',i:['ɪ','aɪ']},
    ];
    for(const{l:vl,i:va}of vc){
      if(letters.slice(pos,pos+vl.length).toLowerCase()===vl){
        for(const ip of va){if(ipa.startsWith(ip))return{ci:ip.length,cl:vl.length};}
      }
    }
  }
  return{ci:1,cl:0};
}
const letters='wednesday';
const ipa='wen';
console.log('Matching ipa=\"'+ipa+'\" against letters=\"'+letters+'\"');
let iPos=0, lPos=0;
while(iPos<ipa.length && lPos<letters.length){
  const r=mO(letters,lPos,ipa.slice(iPos));
  console.log('pos '+lPos+': letters['+lPos+']='+letters[lPos]+', ipa.slice('+iPos+')='+ipa.slice(iPos)+', match='+JSON.stringify(r));
  if(r.cl>0)lPos+=r.cl;
  iPos+=r.ci;
}
console.log('final: lPos='+lPos+', consumed=\"'+letters.slice(0,lPos)+'\"');
