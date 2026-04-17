// phonics_vocab.js — Phonics course vocabulary data
// Structure: { [unitKey]: { title, titleZh, subtitle, subtitleZh, words: [...] } }
// Each word: { word, phonetic, definition, audio, image, has_image }

export const PHONICS_VOCAB = {

  // ── Level 1: 26字母音 + 短元音CVC ──────────────────────────────
  phL1u1: {
    title: 'Consonant Sounds',
    titleZh: '辅音字母音',
    subtitle: 'b d f h j k l m n p r s t v w y z',
    subtitleZh: '17个辅音字母的常规发音',
    words: [
      { word: 'bat',  phonetic: '/bæt/',  definition: 'b → /b/ (bat, ball, bed)',  audio: 'bat.mp3',  image: '', has_image: false, syllables: ["b", "a", "t"] },
      { word: 'dog',  phonetic: '/dɒɡ/',  definition: 'd → /d/ (dog, desk, door)', audio: 'dog.mp3',  image: '', has_image: false, syllables: ["d", "o", "g"] },
      { word: 'fan',  phonetic: '/fæn/',  definition: 'f → /f/ (fan, fish, frog)', audio: 'fan.mp3',  image: '', has_image: false, syllables: ["f", "a", "n"] },
      { word: 'hat',  phonetic: '/hæt/',  definition: 'h → /h/ (hat, hen, hill)',  audio: 'hat.mp3',  image: '', has_image: false, syllables: ["h", "a", "t"] },
      { word: 'jam',  phonetic: '/dʒæm/', definition: 'j → /dʒ/ (jam, jet, jug)', audio: 'jam.mp3',  image: '', has_image: false, syllables: ["j", "a", "m"] },
      { word: 'kit',  phonetic: '/kɪt/',  definition: 'k → /k/ (kit, king, kite)', audio: 'kit.mp3',  image: '', has_image: false, syllables: ["k", "i", "t"] },
      { word: 'leg',  phonetic: '/leɡ/',  definition: 'l → /l/ (leg, lamp, leaf)', audio: 'leg.mp3',  image: '', has_image: false, syllables: ["l", "e", "g"] },
      { word: 'map',  phonetic: '/mæp/',  definition: 'm → /m/ (map, milk, moon)', audio: 'map.mp3',  image: '', has_image: false, syllables: ["m", "a", "p"] },
      { word: 'net',  phonetic: '/net/',  definition: 'n → /n/ (net, nose, nest)', audio: 'net.mp3',  image: '', has_image: false, syllables: ["n", "e", "t"] },
      { word: 'pig',  phonetic: '/pɪɡ/',  definition: 'p → /p/ (pig, pen, park)',  audio: 'pig.mp3',  image: '', has_image: false, syllables: ["p", "i", "g"] },
      { word: 'rat',  phonetic: '/ræt/',  definition: 'r → /r/ (rat, red, ring)',  audio: 'rat.mp3',  image: '', has_image: false, syllables: ["r", "a", "t"] },
      { word: 'sun',  phonetic: '/sʌn/',  definition: 's → /s/ (sun, sit, sock)',  audio: 'sun.mp3',  image: '', has_image: false, syllables: ["s", "u", "n"] },
      { word: 'tap',  phonetic: '/tæp/',  definition: 't → /t/ (tap, ten, top)',   audio: 'tap.mp3',  image: '', has_image: false, syllables: ["t", "a", "p"] },
      { word: 'van',  phonetic: '/væn/',  definition: 'v → /v/ (van, vet, vine)',  audio: 'van.mp3',  image: '', has_image: false, syllables: ["v", "a", "n"] },
      { word: 'web',  phonetic: '/web/',  definition: 'w → /w/ (web, win, wolf)',  audio: 'web.mp3',  image: '', has_image: false, syllables: ["w", "e", "b"] },
      { word: 'yak',  phonetic: '/jæk/',  definition: 'y → /j/ (yak, yes, yell)', audio: 'yak.mp3',  image: '', has_image: false, syllables: ["y", "a", "k"] },
      { word: 'zip',  phonetic: '/zɪp/',  definition: 'z → /z/ (zip, zoo, zero)', audio: 'zip.mp3',  image: '', has_image: false, syllables: ["z", "i", "p"] },
    ]
  },

  phL1u2: {
    title: 'Special Consonants',
    titleZh: '特殊辅音',
    subtitle: 'c g x qu',
    subtitleZh: 'c/g的两种发音、x及qu组合',
    words: [
      { word: 'cat',   phonetic: '/kæt/',   definition: 'c → /k/ before a, o, u (cat, cup, cod)',   audio: 'cat.mp3',   image: '', has_image: false, syllables: ["c", "a", "t"] },
      { word: 'city',  phonetic: '/ˈsɪti/', definition: 'c → /s/ before e, i, y (city, cent, cycle)', audio: 'city.mp3',  image: '', has_image: false, syllables: ["c", "i", "ty"] },
      { word: 'go',    phonetic: '/ɡəʊ/',   definition: 'g → /ɡ/ before a, o, u (go, gap, got)',    audio: 'go.mp3',    image: '', has_image: false, syllables: ["g", "o"] },
      { word: 'gym',   phonetic: '/dʒɪm/',  definition: 'g → /dʒ/ before e, i, y (gym, gem, giraffe)', audio: 'gym.mp3',   image: '', has_image: false, syllables: ["g", "y", "m"] },
      { word: 'box',   phonetic: '/bɒks/',  definition: 'x → /ks/ at end of word (box, fox, mix)',  audio: 'box.mp3',   image: '', has_image: false, syllables: ["b", "o", "x"] },
      { word: 'exam',  phonetic: '/ɪɡˈzæm/', definition: 'x → /ɡz/ between vowels (exam, exact)',  audio: 'exam.mp3',  image: '', has_image: false, syllables: ["e", "x", "am"] },
      { word: 'queen', phonetic: '/kwiːn/', definition: 'qu → /kw/ (queen, quick, quiet)',           audio: 'queen.mp3', image: '', has_image: false, syllables: ["qu", "ee", "n"] },
    ]
  },

  phL1u3: {
    title: 'Short Vowels (CVC)',
    titleZh: '短元音CVC',
    subtitle: 'a e i o u — closed syllable',
    subtitleZh: '闭音节中5个短元音 /æ e ɪ ɒ ʌ/',
    words: [
      { word: 'cat',  phonetic: '/kæt/',  definition: 'a → /æ/ in closed syllable (cat, bag, man)',  audio: 'cat.mp3',  image: '', has_image: false, syllables: ["c", "a", "t"] },
      { word: 'pen',  phonetic: '/pen/',  definition: 'e → /e/ in closed syllable (pen, bed, red)',  audio: 'pen.mp3',  image: '', has_image: false, syllables: ["p", "e", "n"] },
      { word: 'sit',  phonetic: '/sɪt/',  definition: 'i → /ɪ/ in closed syllable (sit, big, him)',  audio: 'sit.mp3',  image: '', has_image: false, syllables: ["s", "i", "t"] },
      { word: 'dog',  phonetic: '/dɒɡ/',  definition: 'o → /ɒ/ in closed syllable (dog, hot, top)',  audio: 'dog.mp3',  image: '', has_image: false, syllables: ["d", "o", "g"] },
      { word: 'cup',  phonetic: '/kʌp/',  definition: 'u → /ʌ/ in closed syllable (cup, run, bus)',  audio: 'cup.mp3',  image: '', has_image: false, syllables: ["c", "u", "p"] },
      { word: 'map',  phonetic: '/mæp/',  definition: 'Short a: map, cap, sad, ran',                 audio: 'map.mp3',  image: '', has_image: false, syllables: ["m", "a", "p"] },
      { word: 'bed',  phonetic: '/bed/',  definition: 'Short e: bed, leg, wet, ten',                 audio: 'bed.mp3',  image: '', has_image: false, syllables: ["b", "e", "d"] },
      { word: 'pin',  phonetic: '/pɪn/',  definition: 'Short i: pin, lip, win, did',                 audio: 'pin.mp3',  image: '', has_image: false, syllables: ["p", "i", "n"] },
      { word: 'pot',  phonetic: '/pɒt/',  definition: 'Short o: pot, fox, lot, rob',                 audio: 'pot.mp3',  image: '', has_image: false, syllables: ["p", "o", "t"] },
      { word: 'bug',  phonetic: '/bʌɡ/',  definition: 'Short u: bug, mud, fun, cut',                 audio: 'bug.mp3',  image: '', has_image: false, syllables: ["b", "u", "g"] },
    ]
  },

  // ── Level 2: 长元音 + 魔法E ────────────────────────────────────────────────
  phL2u1: {
    title: 'Long Vowels (CV)',
    titleZh: '开音节长元音',
    subtitle: 'Open syllable — vowel says its name',
    subtitleZh: '开音节中元音发字母本名',
    words: [
      { word: 'me',   phonetic: '/miː/',  definition: 'e → /iː/ in open syllable (me, he, she, be)', audio: 'me.mp3',   image: '', has_image: false, syllables: ["m", "e"] },
      { word: 'go',   phonetic: '/ɡəʊ/',  definition: 'o → /əʊ/ in open syllable (go, no, so)',      audio: 'go.mp3',   image: '', has_image: false, syllables: ["g", "o"] },
      { word: 'hi',   phonetic: '/haɪ/',  definition: 'i → /aɪ/ in open syllable (hi, my, by)',      audio: 'hi.mp3',   image: '', has_image: false, syllables: ["h", "i"] },
      { word: 'we',   phonetic: '/wiː/',  definition: 'e → /iː/ open syllable (we, be, he)',          audio: 'we.mp3',   image: '', has_image: false, syllables: ["w", "e"] },
      { word: 'no',   phonetic: '/nəʊ/',  definition: 'o → /əʊ/ open syllable (no, go, so)',          audio: 'no.mp3',   image: '', has_image: false, syllables: ["n", "o"] },
    ]
  },

  phL2u2: {
    title: 'Magic E (CVCe)',
    titleZh: '魔法E',
    subtitle: 'Silent e makes the vowel long',
    subtitleZh: '词尾不发音的e让前面的元音变长音',
    words: [
      { word: 'make',  phonetic: '/meɪk/', definition: 'a_e → /eɪ/ (make, cake, name, late)',  audio: 'make.mp3',  image: '', has_image: false, syllables: ["m", "a", "k", "e"] },
      { word: 'time',  phonetic: '/taɪm/', definition: 'i_e → /aɪ/ (time, bike, fine, like)',  audio: 'time.mp3',  image: '', has_image: false, syllables: ["t", "i", "m", "e"] },
      { word: 'home',  phonetic: '/həʊm/', definition: 'o_e → /əʊ/ (home, note, hope, bone)',  audio: 'home.mp3',  image: '', has_image: false, syllables: ["h", "o", "m", "e"] },
      { word: 'cute',  phonetic: '/kjuːt/', definition: 'u_e → /juː/ (cute, tune, cube, mule)', audio: 'cute.mp3',  image: '', has_image: false, syllables: ["c", "u", "t", "e"] },
      { word: 'these', phonetic: '/ðiːz/', definition: 'e_e → /iː/ (these, here, theme)',       audio: 'these.mp3', image: '', has_image: false, syllables: ["th", "e", "s", "e"] },
      { word: 'cake',  phonetic: '/keɪk/', definition: 'a_e pattern: cake, lake, same, wave',   audio: 'cake.mp3',  image: '', has_image: false, syllables: ["c", "a", "k", "e"] },
      { word: 'bike',  phonetic: '/baɪk/', definition: 'i_e pattern: bike, kite, pine, ride',   audio: 'bike.mp3',  image: '', has_image: false, syllables: ["b", "i", "k", "e"] },
      { word: 'bone',  phonetic: '/bəʊn/', definition: 'o_e pattern: bone, code, pole, rose',   audio: 'bone.mp3',  image: '', has_image: false, syllables: ["b", "o", "n", "e"] },
    ]
  },

  // ── Level 3: 元音组合 ────────────────────────────────────────────────
  phL3u1: {
    title: 'Vowel Teams: ai / ay',
    titleZh: 'ai / ay 组合',
    subtitle: 'ai ay → /eɪ/',
    subtitleZh: 'ai和ay都发 /eɪ/ 音',
    words: [
      { word: 'rain',  phonetic: '/reɪn/', definition: 'ai → /eɪ/ (rain, tail, wait, sail)',  audio: 'rain.mp3',  image: '', has_image: false, syllables: ["r", "ai", "n"] },
      { word: 'play',  phonetic: '/pleɪ/', definition: 'ay → /eɪ/ (play, day, say, way)',     audio: 'play.mp3',  image: '', has_image: false, syllables: ["pl", "ay"] },
      { word: 'train', phonetic: '/treɪn/', definition: 'ai in train, brain, chain, plain',   audio: 'train.mp3', image: '', has_image: false, syllables: ["tr", "ai", "n"] },
      { word: 'stay',  phonetic: '/steɪ/', definition: 'ay in stay, clay, pray, spray',       audio: 'stay.mp3',  image: '', has_image: false, syllables: ["st", "ay"] },
      { word: 'snail', phonetic: '/sneɪl/', definition: 'ai in snail, trail, frail',          audio: 'snail.mp3', image: '', has_image: false, syllables: ["sn", "ai", "l"] },
    ]
  },

  phL3u2: {
    title: 'Vowel Teams: ee / ea',
    titleZh: 'ee / ea 组合',
    subtitle: 'ee ea → /iː/',
    subtitleZh: 'ee发长音/iː/，ea有例外bread发/e/',
    words: [
      { word: 'bee',   phonetic: '/biː/',  definition: 'ee → /iː/ (bee, tree, see, free)',    audio: 'bee.mp3',   image: '', has_image: false, syllables: ["b", "ee"] },
      { word: 'tea',   phonetic: '/tiː/',  definition: 'ea → /iː/ (tea, sea, read, meat)',    audio: 'tea.mp3',   image: '', has_image: false, syllables: ["t", "ea"] },
      { word: 'bread', phonetic: '/bred/', definition: 'ea → /e/ exception (bread, head, dead)', audio: 'bread.mp3', image: '', has_image: false, syllables: ["br", "ea", "d"] },
      { word: 'tree',  phonetic: '/triː/', definition: 'ee in tree, green, sleep, feet',      audio: 'tree.mp3',  image: '', has_image: false, syllables: ["tr", "ee"] },
      { word: 'dream', phonetic: '/driːm/', definition: 'ea in dream, cream, stream, clean',  audio: 'dream.mp3', image: '', has_image: false, syllables: ["dr", "ea", "m"] },
    ]
  },

  phL3u3: {
    title: 'Vowel Teams: oa / oo',
    titleZh: 'oa / oo 组合',
    subtitle: 'oa → /əʊ/  oo → /uː/ or /ʊ/',
    subtitleZh: 'oa发/əʊ/，oo有两种发音/uː/(moon)和/ʊ/(book)',
    words: [
      { word: 'boat',  phonetic: '/bəʊt/', definition: 'oa → /əʊ/ (boat, coat, road, soap)',  audio: 'boat.mp3',  image: '', has_image: false, syllables: ["b", "oa", "t"] },
      { word: 'moon',  phonetic: '/muːn/', definition: 'oo → /uː/ (moon, food, pool, soon)',  audio: 'moon.mp3',  image: '', has_image: false, syllables: ["m", "oo", "n"] },
      { word: 'book',  phonetic: '/bʊk/',  definition: 'oo → /ʊ/ (book, cook, look, foot)',  audio: 'book.mp3',  image: '', has_image: false, syllables: ["b", "oo", "k"] },
      { word: 'road',  phonetic: '/rəʊd/', definition: 'oa in road, toad, groan, float',      audio: 'road.mp3',  image: '', has_image: false, syllables: ["r", "oa", "d"] },
      { word: 'school', phonetic: '/skuːl/', definition: 'oo in school, cool, fool, tool',    audio: 'school.mp3', image: '', has_image: false, syllables: ["sch", "oo", "l"] },
    ]
  },

  phL3u4: {
    title: 'Vowel Teams: ou / ow / oi / oy',
    titleZh: 'ou / ow / oi / oy 组合',
    subtitle: 'ou ow → /aʊ/  oi oy → /ɔɪ/',
    subtitleZh: 'ou/ow发/aʊ/，oi/oy发/ɔɪ/',
    words: [
      { word: 'out',   phonetic: '/aʊt/',  definition: 'ou → /aʊ/ (out, loud, found, cloud)', audio: 'out.mp3',   image: '', has_image: false, syllables: ["ou", "t"] },
      { word: 'now',   phonetic: '/naʊ/',  definition: 'ow → /aʊ/ (now, cow, how, town)',     audio: 'now.mp3',   image: '', has_image: false, syllables: ["n", "ow"] },
      { word: 'slow',  phonetic: '/sləʊ/', definition: 'ow → /əʊ/ (slow, snow, grow, flow)',  audio: 'slow.mp3',  image: '', has_image: false, syllables: ["sl", "ow"] },
      { word: 'coin',  phonetic: '/kɔɪn/', definition: 'oi → /ɔɪ/ (coin, oil, join, soil)',   audio: 'coin.mp3',  image: '', has_image: false, syllables: ["c", "oi", "n"] },
      { word: 'boy',   phonetic: '/bɔɪ/',  definition: 'oy → /ɔɪ/ (boy, toy, joy, royal)',    audio: 'boy.mp3',   image: '', has_image: false, syllables: ["b", "oy"] },
    ]
  },

  // ── Level 4: 辅音组合 + 连缀 ───────────────────────────────────────────────
  phL4u1: {
    title: 'Consonant Digraphs',
    titleZh: '辅音二合字母',
    subtitle: 'ch sh th wh ph ng nk',
    subtitleZh: '两字母组合发一个音：ch/tʃ/、sh/ʃ/、th/θ/ð/等',
    words: [
      { word: 'chair',  phonetic: '/tʃeə/', definition: 'ch → /tʃ/ (chair, child, chip, lunch)',  audio: 'chair.mp3',  image: '', has_image: false, syllables: ["ch", "ai", "r"] },
      { word: 'ship',   phonetic: '/ʃɪp/',  definition: 'sh → /ʃ/ (ship, fish, shop, wish)',      audio: 'ship.mp3',   image: '', has_image: false, syllables: ["sh", "i", "p"] },
      { word: 'think',  phonetic: '/θɪŋk/', definition: 'th → /θ/ voiceless (think, three, bath)', audio: 'think.mp3',  image: '', has_image: false, syllables: ["th", "i", "nk"] },
      { word: 'this',   phonetic: '/ðɪs/',  definition: 'th → /ð/ voiced (this, that, them, with)', audio: 'this.mp3',   image: '', has_image: false, syllables: ["th", "i", "s"] },
      { word: 'what',   phonetic: '/wɒt/',  definition: 'wh → /w/ (what, when, where, which)',    audio: 'what.mp3',   image: '', has_image: false, syllables: ["wh", "a", "t"] },
      { word: 'phone',  phonetic: '/fəʊn/', definition: 'ph → /f/ (phone, photo, graph)',          audio: 'phone.mp3',  image: '', has_image: false, syllables: ["ph", "o", "ne"] },
      { word: 'sing',   phonetic: '/sɪŋ/',  definition: 'ng → /ŋ/ (sing, long, ring, song)',      audio: 'sing.mp3',   image: '', has_image: false, syllables: ["s", "i", "ng"] },
      { word: 'think',  phonetic: '/θɪŋk/', definition: 'nk → /ŋk/ (think, bank, drink, pink)',   audio: 'think.mp3',  image: '', has_image: false, syllables: ["th", "i", "nk"] },
    ]
  },

  phL4u2: {
    title: 'Consonant Blends',
    titleZh: '辅音连缀',
    subtitle: 'bl br cl cr dr fl fr + 3-letter blends',
    subtitleZh: '两个或三个辅音连续发音，如bl/br/str',
    words: [
      { word: 'black',  phonetic: '/blæk/', definition: 'bl blend (black, blue, blow, blank)',    audio: 'black.mp3',  image: '', has_image: false, syllables: ["bl", "a", "ck"] },
      { word: 'bread',  phonetic: '/bred/', definition: 'br blend (bread, bring, brown, break)',  audio: 'bread.mp3',  image: '', has_image: false, syllables: ["br", "ea", "d"] },
      { word: 'clap',   phonetic: '/klæp/', definition: 'cl blend (clap, class, clean, clock)',   audio: 'clap.mp3',   image: '', has_image: false, syllables: ["cl", "a", "p"] },
      { word: 'crab',   phonetic: '/kræb/', definition: 'cr blend (crab, cry, cross, crown)',     audio: 'crab.mp3',   image: '', has_image: false, syllables: ["cr", "a", "b"] },
      { word: 'drum',   phonetic: '/drʌm/', definition: 'dr blend (drum, draw, dress, drink)',    audio: 'drum.mp3',   image: '', has_image: false, syllables: ["dr", "u", "m"] },
      { word: 'flag',   phonetic: '/flæɡ/', definition: 'fl blend (flag, flat, fly, floor)',      audio: 'flag.mp3',   image: '', has_image: false, syllables: ["fl", "a", "g"] },
      { word: 'frog',   phonetic: '/frɒɡ/', definition: 'fr blend (frog, from, free, fresh)',     audio: 'frog.mp3',   image: '', has_image: false, syllables: ["fr", "o", "g"] },
      { word: 'street', phonetic: '/striːt/', definition: 'str 3-letter blend (street, strong, strip)', audio: 'street.mp3', image: '', has_image: false, syllables: ["str", "ee", "t"] },
      { word: 'spring', phonetic: '/sprɪŋ/', definition: 'spr 3-letter blend (spring, spray, spread)', audio: 'spring.mp3', image: '', has_image: false, syllables: ["spr", "i", "ng"] },
    ]
  },

  // ── Level 5: R控制元音 + 双元音 ───────────────────────────────────────────
  phL5u1: {
    title: 'R-Controlled Vowels',
    titleZh: 'R控制元音',
    subtitle: 'ar or er ir ur',
    subtitleZh: '元音+r发特殊音：ar/ɑː/、or/ɔː/、er/ir/ur/ɜː/',
    words: [
      { word: 'car',   phonetic: '/kɑː/',  definition: 'ar → /ɑː/ (car, star, farm, park)',    audio: 'car.mp3',   image: '', has_image: false, syllables: ["c", "ar"] },
      { word: 'fork',  phonetic: '/fɔːk/', definition: 'or → /ɔː/ (fork, horse, corn, sport)', audio: 'fork.mp3',  image: '', has_image: false, syllables: ["f", "or", "k"] },
      { word: 'her',   phonetic: '/hɜː/',  definition: 'er → /ɜː/ (her, term, fern, verb)',    audio: 'her.mp3',   image: '', has_image: false, syllables: ["h", "er"] },
      { word: 'bird',  phonetic: '/bɜːd/', definition: 'ir → /ɜː/ (bird, girl, first, shirt)', audio: 'bird.mp3',  image: '', has_image: false, syllables: ["b", "ir", "d"] },
      { word: 'turn',  phonetic: '/tɜːn/', definition: 'ur → /ɜː/ (turn, burn, hurt, curl)',   audio: 'turn.mp3',  image: '', has_image: false, syllables: ["t", "ur", "n"] },
      { word: 'care',  phonetic: '/keə/',  definition: 'are/air → /eə/ (care, chair, share)',  audio: 'care.mp3',  image: '', has_image: false, syllables: ["c", "are"] },
    ]
  },

  phL5u2: {
    title: 'Diphthongs',
    titleZh: '双元音',
    subtitle: '/eɪ/ /aɪ/ /ɔɪ/ /aʊ/ /əʊ/ /ɪə/ /eə/ /ʊə/',
    subtitleZh: '8个双元音：/eɪ/蛋糕 /aɪ/我的 /ɔɪ/男孩 /aʊ/现在 /əʊ/走 /ɪə/耳朵 /eə/头发 /ʊə/贫',
    words: [
      { word: 'cake',  phonetic: '/keɪk/', definition: '/eɪ/ diphthong (cake, rain, play, they)', audio: 'cake.mp3',  image: '', has_image: false, syllables: ["c", "a", "ke"] },
      { word: 'my',    phonetic: '/maɪ/',  definition: '/aɪ/ diphthong (my, time, night, fly)',   audio: 'my.mp3',    image: '', has_image: false, syllables: ["m", "y"] },
      { word: 'boy',   phonetic: '/bɔɪ/',  definition: '/ɔɪ/ diphthong (boy, coin, noise)',       audio: 'boy.mp3',   image: '', has_image: false, syllables: ["b", "oy"] },
      { word: 'now',   phonetic: '/naʊ/',  definition: '/aʊ/ diphthong (now, out, town, cloud)',  audio: 'now.mp3',   image: '', has_image: false, syllables: ["n", "ow"] },
      { word: 'go',    phonetic: '/ɡəʊ/',  definition: '/əʊ/ diphthong (go, home, boat, snow)',   audio: 'go.mp3',    image: '', has_image: false, syllables: ["g", "o"] },
      { word: 'ear',   phonetic: '/ɪə/',   definition: '/ɪə/ diphthong (ear, here, near, fear)',  audio: 'ear.mp3',   image: '', has_image: false, syllables: ["ea", "r"] },
      { word: 'hair',  phonetic: '/heə/',  definition: '/eə/ diphthong (hair, care, bear, there)', audio: 'hair.mp3',  image: '', has_image: false, syllables: ["h", "ai", "r"] },
      { word: 'poor',  phonetic: '/pʊə/',  definition: '/ʊə/ diphthong (poor, tour, sure)',       audio: 'poor.mp3',  image: '', has_image: false, syllables: ["p", "oo", "r"] },
    ]
  },

  // ── Level 6: 特殊规则 ──────────────────────────────────────────────
  phL6u1: {
    title: 'Silent Letters',
    titleZh: '不发音字母',
    subtitle: 'kn- wr- -mb -bt -st',
    subtitleZh: 'knee/wrap/climb等词中部分字母不发音',
    words: [
      { word: 'knee',   phonetic: '/niː/',   definition: 'kn- → silent k (knee, know, knife, knock)', audio: 'knee.mp3',   image: '', has_image: false, syllables: ["kn", "ee"] },
      { word: 'write',  phonetic: '/raɪt/',  definition: 'wr- → silent w (write, wrong, wrap, wrist)', audio: 'write.mp3',  image: '', has_image: false, syllables: ["wr", "i", "te"] },
      { word: 'climb',  phonetic: '/klaɪm/', definition: '-mb → silent b (climb, lamb, thumb, comb)',  audio: 'climb.mp3',  image: '', has_image: false, syllables: ["cl", "i", "mb"] },
      { word: 'doubt',  phonetic: '/daʊt/',  definition: '-bt → silent b (doubt, debt)',               audio: 'doubt.mp3',  image: '', has_image: false, syllables: ["d", "ou", "bt"] },
      { word: 'listen', phonetic: '/ˈlɪsn/', definition: '-st → silent t (listen, fasten, castle)',    audio: 'listen.mp3', image: '', has_image: false, syllables: ["l", "i", "st", "en"] },
      { word: 'honest', phonetic: '/ˈɒnɪst/', definition: 'h → silent (honest, hour, heir)',          audio: 'honest.mp3', image: '', has_image: false, syllables: ["h", "o", "n", "est"] },
    ]
  },

  phL6u2: {
    title: 'Irregular Words',
    titleZh: '不规则发音',
    subtitle: 'High-frequency sight words',
    subtitleZh: '常见高频词的特殊发音：the/of/do/was/said等',
    words: [
      { word: 'the',   phonetic: '/ðə/',   definition: 'the → /ðə/ (most common English word)',  audio: 'the.mp3',   image: '', has_image: false, syllables: ["th", "e"] },
      { word: 'said',  phonetic: '/sed/',  definition: 'said → /sed/ (not /seɪd/)',               audio: 'said.mp3',  image: '', has_image: false, syllables: ["s", "ai", "d"] },
      { word: 'was',   phonetic: '/wɒz/',  definition: 'was → /wɒz/ (not /wæs/)',                 audio: 'was.mp3',   image: '', has_image: false, syllables: ["w", "a", "s"] },
      { word: 'of',    phonetic: '/ɒv/',   definition: 'of → /ɒv/ (not /ɒf/)',                    audio: 'of.mp3',    image: '', has_image: false, syllables: ["o", "f"] },
      { word: 'do',    phonetic: '/duː/',  definition: 'do → /duː/ (not /dəʊ/)',                  audio: 'do.mp3',    image: '', has_image: false, syllables: ["d", "o"] },
      { word: 'have',  phonetic: '/hæv/',  definition: 'have → /hæv/ (not /heɪv/)',               audio: 'have.mp3',  image: '', has_image: false, syllables: ["h", "a", "ve"] },
      { word: 'come',  phonetic: '/kʌm/',  definition: 'come → /kʌm/ (not /kəʊm/)',               audio: 'come.mp3',  image: '', has_image: false, syllables: ["c", "o", "me"] },
      { word: 'some',  phonetic: '/sʌm/',  definition: 'some → /sʌm/ (not /səʊm/)',               audio: 'some.mp3',  image: '', has_image: false, syllables: ["s", "o", "me"] },
    ]
  },

  phL6u3: {
    title: 'Multisyllabic Words',
    titleZh: '多音节词',
    subtitle: 'Syllable splitting rules',
    subtitleZh: 'pencil/paper/hospital等多音节词的拆分规则',
    words: [
      { word: 'pencil',   phonetic: '/ˈpensɪl/',  definition: 'pen·cil — VC/CV split (consonant between vowels)', audio: 'pencil.mp3',   image: '', has_image: false, syllables: ["pen", "cil"] },
      { word: 'rabbit',   phonetic: '/ˈræbɪt/',   definition: 'rab·bit — double consonant splits (VC/CV)',        audio: 'rabbit.mp3',   image: '', has_image: false, syllables: ["rab", "bit"] },
      { word: 'table',    phonetic: '/ˈteɪbl/',   definition: 'ta·ble — open syllable + consonant-le',            audio: 'table.mp3',    image: '', has_image: false, syllables: ["ta", "ble"] },
      { word: 'hospital', phonetic: '/ˈhɒspɪtl/', definition: 'hos·pi·tal — 3 syllables',                        audio: 'hospital.mp3', image: '', has_image: false, syllables: ["hos", "pi", "tal"] },
      { word: 'umbrella', phonetic: '/ʌmˈbrelə/', definition: 'um·brel·la — 3 syllables',                        audio: 'umbrella.mp3', image: '', has_image: false, syllables: ["um", "brel", "la"] },
      { word: 'fantastic', phonetic: '/fænˈtæstɪk/', definition: 'fan·tas·tic — 3 syllables',                    audio: 'fantastic.mp3', image: '', has_image: false, syllables: ["fan", "tas", "tic"] },
    ]
  },
}

// Flat VOCAB-compatible format for App.jsx
export const PHONICS_COURSE_UNITS = [
  'phL1u1','phL1u2','phL1u3',
  'phL2u1','phL2u2',
  'phL3u1','phL3u2','phL3u3','phL3u4',
  'phL4u1','phL4u2',
  'phL5u1','phL5u2',
  'phL6u1','phL6u2','phL6u3',
]

export const PHONICS_LEVELS = [
  { id: 'phL1', label: 'Level 1', labelZh: '第一级', title: '26 Letters & Short Vowels', titleZh: '26字母音与短元音', units: ['phL1u1','phL1u2','phL1u3'] },
  { id: 'phL2', label: 'Level 2', labelZh: '第二级', title: 'Long Vowels & Magic E',     titleZh: '长元音与魔法E', units: ['phL2u1','phL2u2'] },
  { id: 'phL3', label: 'Level 3', labelZh: '第三级', title: 'Vowel Teams',               titleZh: '元音组合', units: ['phL3u1','phL3u2','phL3u3','phL3u4'] },
  { id: 'phL4', label: 'Level 4', labelZh: '第四级', title: 'Consonant Digraphs & Blends', titleZh: '辅音组合与连缀', units: ['phL4u1','phL4u2'] },
  { id: 'phL5', label: 'Level 5', labelZh: '第五级', title: 'R-Controlled & Diphthongs', units: ['phL5u1','phL5u2'] },
  { id: 'phL6', label: 'Level 6', labelZh: '第六级', title: 'Special Rules',             titleZh: '特殊规则', units: ['phL6u1','phL6u2','phL6u3'] },
]
