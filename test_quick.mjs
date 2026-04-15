const V = ['iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə','ɑː','ɔː','uː','ɜː','ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ','a','i','o','u'];
function sS(w, p) {
  if (!p) return [{ l: w, i: '' }];
  const st = p.replace(/[\[\]\/]/g, '');
  const vu = []; let pp = 0;
  while (pp < st.length) {
    if (st[pp]==='ˈ'||st[pp]==='ˌ'){pp++;continue;}
    let matched=false;
    for (const vp of V) {
      if (st.slice(pp,pp+vp.length)===vp){vu.push({i:vp,cp:pp});pp+=vp.length;matched=true;break;}
    }
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
    for(const{l:dl,i:di} of CM){
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
    return{ci:1,cl:0};
  }
  function aL(letters,syllableIpas){
    const result=[];let lPos=0;
    for(let si=0;si<syllableIpas.length;si++){
      const ipa=syllableIpas[si].replace(/[ˈˌ]/g,'');
      let syll='';let iPos=0;
      while(iPos<ipa.length&&lPos<letters.length){
        const{ci,cl}=mO(letters,lPos,ipa.slice(iPos));
        if(cl>0){syll+=letters.slice(lPos,lPos+cl);lPos+=cl;}
        iPos+=ci;
      }
      if(iPos>=ipa.length&&lPos<letters.length){syll+=letters.slice(lPos);lPos=letters.length;}
      result.push(syll);
    }
    return result;
  }
  const wl=w.replace(/ /g,'').toLowerCase();
  let ls=aL(wl,si);
  if(ls.join('').length!==wl.length){
    const il=si.map(ip=>ip.replace(/[ˈˌ]/g,'').length);
    const ti=il.reduce((a,b)=>a+b,0);
    if(ti>0){
      let cnt=il.map(l=>Math.round(l/ti*wl.length));
      const diff=wl.length-cnt.reduce((a,b)=>a+b,0);
      if(diff>0)cnt[cnt.length-1]+=diff;
      if(diff<0)cnt[cnt.length-1]+=diff;
      let wPos=0;ls.length=0;
      for(const c of cnt){ls.push(wl.slice(wPos,wPos+c));wPos+=c;}
    }
  }
  return si.map((ipa,ii)=>({l:ls[ii]||'',i:'/'+ipa+'/'}));
}
const tests=[
  ['Wednesday','/ˈwenzdeɪ/'],['headache','/ˈhedeɪk/'],['treasure','/ˈtreʒə/'],['sweater','/ˈswetə/'],
  ['cooker','/ˈkʊkə/'],['library','/ˈlaɪbrəri/'],['shoulder','/ˈʃəʊldə/'],['strawberry','/ˈstrɔːbəri/'],
  ['milkshake','/ˈmɪlkeɪk/'],['yoghurt','/ˈjɒɡət/'],['text','/tekst/'],['frightened','/ˈfraɪtnd/'],
  ['listen to music','/ˈlɪsən tə ˈmjuːzɪk/'],['go skating','/ɡəʊ ˈskeɪtɪŋ/'],
  ['watch a DVD','/wɒtʃ ə diː viː ˈdiː/'],['shopping centre','/ˈʃɒpɪŋ ˈsentə/'],
  ['university','/ˌjuːnɪˈvɜːsəti/'],['photographer','/fəˈtɒɡrəfə/'],
  ['scissors','/ˈsɪzəz/'],['backache','/ˈbækeɪk/'],['world tour','/wɜːld tʊə/'],
  ['world','/wɜːld/'],['music','/ˈmjuːzɪk/'],['jump','/dʒʌmp/'],['cold','/kəʊld/'],
  ['fly','/flaɪ/'],['cough','/kɒf/'],['taught','/tɔːt/'],['caught','/kɔːt/'],
  ['skipped','/skɪpt/'],['science','/ˈsaɪəns/'],['sand castle','/sænd ˈkɑːsəl/'],
  ['tractor','/ˈtræktə/'],['Thursday','/ˈθɜːzdeɪ/'],['cinema','/ˈsɪnəmə/'],
  ['café','/ˈkæfeɪ/'],['kangaroo','/ˌkæŋɡəˈruː/'],['stomach','/ˈstʌmək/'],['surprised','/səˈpraɪzd/'],
  ['threw','/θruː/'],['gold','/ɡəʊld/'],['science','/ˈsaɪəns/'],
  ['sand castle','/sænd ˈkɑːsəl/'],
];
let pass=0,fail=0;
for(const[w,p]of tests){
  const r=sS(w,p);
  const got=r.map(s=>s.l).join('');
  const exp=w.replace(/ /g,'');
  const ok=got===exp;
  if(ok)pass++;else fail++;
  console.log((ok?'✓':'✗')+' '+w.padEnd(25)+' => '+r.map(s=>'['+s.l+']').join(' '));
  if(!ok)console.log('  got:"'+got+'"('+got.length+') expected:"'+exp+'"('+exp.length+')');
}
console.log('\nResult: '+pass+' pass, '+fail+' fail');
