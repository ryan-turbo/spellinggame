const V=['iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə','ɑː','ɔː','uː','ɜː','ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ','a','i','o','u'];
function s(w,p){
  if(!p)return[{l:w,i:''}];
  const st=p.replace(/[\[\]\/]/g,'');
  const vu=[];let pp=0;
  while(pp<st.length){
    if(st[pp]==='ˈ'||st[pp]==='ˌ'){pp++;continue;}
    let matched=false;
    for(const vp of V){if(st.slice(pp,pp+vp.length)===vp){vu.push({i:vp,cp:pp});pp+=vp.length;matched=true;break;}}
    if(!matched)pp++;
  }
  if(vu.length===0)return[{l:w,i:''}];
  if(vu.length===1)return[{l:w,i:p}];
  const si=[];let prev=0;
  for(let ii=1;ii<vu.length;ii++){
    const gs=vu[ii-1].cp+vu[ii-1].i.length;
    const ge=vu[ii].cp;
    const nc=st.slice(gs,ge).replace(/[ˈˌ]/g,'').length;
    if(nc===0){si.push(st.slice(prev,gs+1));prev=gs+1;}
    else if(nc===1){si.push(st.slice(prev,gs));prev=gs;}
    else if(nc===2){si.push(st.slice(prev,gs+1));prev=gs+1;}
    else{si.push(st.slice(prev,gs+Math.ceil(nc/2)));prev=gs+Math.ceil(nc/2);}
  }
  si.push(st.slice(prev));
  const vp=['iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə','ɑː','ɔː','uː','ɜː','ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ','a','i','o','u'];
  const hasVowel=(ipa)=>vp.some(v=>ipa.includes(v));
  if(si.length>=2&&!hasVowel(si[0])){si[1]=si[0]+si[1];si.shift();}
  console.log('syllableIpas:',si);
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
        {l:'ou',i:['aʊ','əʊ','ʌ']},{l:'ow',i:['aʊ','əʊ']},{l:'oo',i:['uː','ʊ']},
        {l:'ee',i:['iː']},{l:'ea',i:['iː','e','eɪ']},
        {l:'ai',i:['eɪ']},{l:'ay',i:['eɪ']},{l:'oy',i:['ɔɪ']},{l:'oi',i:['ɔɪ']},
        {l:'ie',i:['aɪ','iː']},{l:'au',i:['ɔː']},{l:'aw',i:['ɔː']},
        {l:'ey',i:['eɪ']},{l:'ei',i:['eɪ']},
        {l:'ar',i:['ɑː','ɒ']},{l:'or',i:['ɔː','ɜː']},{l:'er',i:['ɜː']},
        {l:'ir',i:['ɜː']},{l:'ur',i:['ɜː']},{l:'ear',i:['ɪə','ɜː']},{l:'air',i:['eə']},
        {l:'ere',i:['ɪə','eə']},{l:'are',i:['eə']},{l:'oor',i:['ɔː']},{l:'our',i:['ɔː','ʊə']},
        {l:'a',i:['ɑː','æ','ɒ','eɪ']},{l:'e',i:['e']},{l:'i',i:['ɪ','aɪ','iː']},
        {l:'o',i:['ɒ','əʊ','ʌ']},{l:'u',i:['ʌ','ʊ','uː','ə']},{l:'y',i:['ɪ','aɪ']},
      ];
      for(const{l:vl,i:va}of vc){
        if(letters.slice(pos,pos+vl.length).toLowerCase()===vl){
          for(const ip of va){if(ipa.startsWith(ip))return{ci:ip.length,cl:vl.length};}
        }
      }
    }
    return{ci:1,cl:1};
  }
  function aL(letters,syllableIpas){
    const result=[];let lPos=0;
    for(let sii=0;sii<syllableIpas.length;sii++){
      const ipa=syllableIpas[sii].replace(/[ˈˌ]/g,'');
      let syll='';let iPos=0;
      console.log('syllable',sii,': ipa="'+ipa+'"');
      while(iPos<ipa.length&&lPos<letters.length){
        const{ci,cl}=mO(letters,lPos,ipa.slice(iPos));
        console.log('  lPos='+lPos+', iPos='+iPos+', letters['+lPos+']='+letters[lPos]+', ipa.slice('+iPos+')='+ipa.slice(iPos)+', match={ci:'+ci+',cl:'+cl+'}');
        if(cl>0){syll+=letters.slice(lPos,lPos+cl);lPos+=cl;}
        iPos+=ci;
      }
      if(iPos>=ipa.length&&lPos<letters.length){syll+=letters.slice(lPos);lPos=letters.length;}
      result.push(syll);
      console.log('  -> syll="'+syll+'"');
    }
    return result;
  }
  const wl=w.replace(/ /g,'').toLowerCase();
  let ls=aL(wl,si);
  return si.map((ipa,ii)=>({l:ls[ii]||'',i:'/'+ipa+'/'}));
}
console.log('\n=== Wednesday ===');
s('Wednesday','/ˈwenzdeɪ/');
