// phonics_vocab.js — Phonics course vocabulary data
// Structure: { [unitKey]: { title, subtitle, words: [...] } }
// Each word: { word, phonetic, definition, audio, image, has_image }

export const PHONICS_VOCAB = {

  // ── Level 1: 26 Letters + Short Vowel CVC ──────────────────────────────
  phL1u1: {
    title: 'Consonant Sounds',
    subtitle: 'b d f h j k l m n p r s t v w y z',
    words: [
      { word: 'bat',  phonetic: '/bæt/',  definition: 'b → /b/ (bat, ball, bed)',  audio: 'bat.mp3',  image: '', has_image: false },
      { word: 'dog',  phonetic: '/dɒɡ/',  definition: 'd → /d/ (dog, desk, door)', audio: 'dog.mp3',  image: '', has_image: false },
      { word: 'fan',  phonetic: '/fæn/',  definition: 'f → /f/ (fan, fish, frog)', audio: 'fan.mp3',  image: '', has_image: false },
      { word: 'hat',  phonetic: '/hæt/',  definition: 'h → /h/ (hat, hen, hill)',  audio: 'hat.mp3',  image: '', has_image: false },
      { word: 'jam',  phonetic: '/dʒæm/', definition: 'j → /dʒ/ (jam, jet, jug)', audio: 'jam.mp3',  image: '', has_image: false },
      { word: 'kit',  phonetic: '/kɪt/',  definition: 'k → /k/ (kit, king, kite)', audio: 'kit.mp3',  image: '', has_image: false },
      { word: 'leg',  phonetic: '/leɡ/',  definition: 'l → /l/ (leg, lamp, leaf)', audio: 'leg.mp3',  image: '', has_image: false },
      { word: 'map',  phonetic: '/mæp/',  definition: 'm → /m/ (map, milk, moon)', audio: 'map.mp3',  image: '', has_image: false },
      { word: 'net',  phonetic: '/net/',  definition: 'n → /n/ (net, nose, nest)', audio: 'net.mp3',  image: '', has_image: false },
      { word: 'pig',  phonetic: '/pɪɡ/',  definition: 'p → /p/ (pig, pen, park)',  audio: 'pig.mp3',  image: '', has_image: false },
      { word: 'rat',  phonetic: '/ræt/',  definition: 'r → /r/ (rat, red, ring)',  audio: 'rat.mp3',  image: '', has_image: false },
      { word: 'sun',  phonetic: '/sʌn/',  definition: 's → /s/ (sun, sit, sock)',  audio: 'sun.mp3',  image: '', has_image: false },
      { word: 'tap',  phonetic: '/tæp/',  definition: 't → /t/ (tap, ten, top)',   audio: 'tap.mp3',  image: '', has_image: false },
      { word: 'van',  phonetic: '/væn/',  definition: 'v → /v/ (van, vet, vine)',  audio: 'van.mp3',  image: '', has_image: false },
      { word: 'web',  phonetic: '/web/',  definition: 'w → /w/ (web, win, wolf)',  audio: 'web.mp3',  image: '', has_image: false },
      { word: 'yak',  phonetic: '/jæk/',  definition: 'y → /j/ (yak, yes, yell)', audio: 'yak.mp3',  image: '', has_image: false },
      { word: 'zip',  phonetic: '/zɪp/',  definition: 'z → /z/ (zip, zoo, zero)', audio: 'zip.mp3',  image: '', has_image: false },
    ]
  },

  phL1u2: {
    title: 'Special Consonants',
    subtitle: 'c g x qu',
    words: [
      { word: 'cat',   phonetic: '/kæt/',   definition: 'c → /k/ before a, o, u (cat, cup, cod)',   audio: 'cat.mp3',   image: '', has_image: false },
      { word: 'city',  phonetic: '/ˈsɪti/', definition: 'c → /s/ before e, i, y (city, cent, cycle)', audio: 'city.mp3',  image: '', has_image: false },
      { word: 'go',    phonetic: '/ɡəʊ/',   definition: 'g → /ɡ/ before a, o, u (go, gap, got)',    audio: 'go.mp3',    image: '', has_image: false },
      { word: 'gym',   phonetic: '/dʒɪm/',  definition: 'g → /dʒ/ before e, i, y (gym, gem, giraffe)', audio: 'gym.mp3',   image: '', has_image: false },
      { word: 'box',   phonetic: '/bɒks/',  definition: 'x → /ks/ at end of word (box, fox, mix)',  audio: 'box.mp3',   image: '', has_image: false },
      { word: 'exam',  phonetic: '/ɪɡˈzæm/', definition: 'x → /ɡz/ between vowels (exam, exact)',  audio: 'exam.mp3',  image: '', has_image: false },
      { word: 'queen', phonetic: '/kwiːn/', definition: 'qu → /kw/ (queen, quick, quiet)',           audio: 'queen.mp3', image: '', has_image: false },
    ]
  },

  phL1u3: {
    title: 'Short Vowels (CVC)',
    subtitle: 'a e i o u — closed syllable',
    words: [
      { word: 'cat',  phonetic: '/kæt/',  definition: 'a → /æ/ in closed syllable (cat, bag, man)',  audio: 'cat.mp3',  image: '', has_image: false },
      { word: 'pen',  phonetic: '/pen/',  definition: 'e → /e/ in closed syllable (pen, bed, red)',  audio: 'pen.mp3',  image: '', has_image: false },
      { word: 'sit',  phonetic: '/sɪt/',  definition: 'i → /ɪ/ in closed syllable (sit, big, him)',  audio: 'sit.mp3',  image: '', has_image: false },
      { word: 'dog',  phonetic: '/dɒɡ/',  definition: 'o → /ɒ/ in closed syllable (dog, hot, top)',  audio: 'dog.mp3',  image: '', has_image: false },
      { word: 'cup',  phonetic: '/kʌp/',  definition: 'u → /ʌ/ in closed syllable (cup, run, bus)',  audio: 'cup.mp3',  image: '', has_image: false },
      { word: 'map',  phonetic: '/mæp/',  definition: 'Short a: map, cap, sad, ran',                 audio: 'map.mp3',  image: '', has_image: false },
      { word: 'bed',  phonetic: '/bed/',  definition: 'Short e: bed, leg, wet, ten',                 audio: 'bed.mp3',  image: '', has_image: false },
      { word: 'pin',  phonetic: '/pɪn/',  definition: 'Short i: pin, lip, win, did',                 audio: 'pin.mp3',  image: '', has_image: false },
      { word: 'pot',  phonetic: '/pɒt/',  definition: 'Short o: pot, fox, lot, rob',                 audio: 'pot.mp3',  image: '', has_image: false },
      { word: 'bug',  phonetic: '/bʌɡ/',  definition: 'Short u: bug, mud, fun, cut',                 audio: 'bug.mp3',  image: '', has_image: false },
    ]
  },

  // ── Level 2: Long Vowels ────────────────────────────────────────────────
  phL2u1: {
    title: 'Long Vowels (CV)',
    subtitle: 'Open syllable — vowel says its name',
    words: [
      { word: 'me',   phonetic: '/miː/',  definition: 'e → /iː/ in open syllable (me, he, she, be)', audio: 'me.mp3',   image: '', has_image: false },
      { word: 'go',   phonetic: '/ɡəʊ/',  definition: 'o → /əʊ/ in open syllable (go, no, so)',      audio: 'go.mp3',   image: '', has_image: false },
      { word: 'hi',   phonetic: '/haɪ/',  definition: 'i → /aɪ/ in open syllable (hi, my, by)',      audio: 'hi.mp3',   image: '', has_image: false },
      { word: 'we',   phonetic: '/wiː/',  definition: 'e → /iː/ open syllable (we, be, he)',          audio: 'we.mp3',   image: '', has_image: false },
      { word: 'no',   phonetic: '/nəʊ/',  definition: 'o → /əʊ/ open syllable (no, go, so)',          audio: 'no.mp3',   image: '', has_image: false },
    ]
  },

  phL2u2: {
    title: 'Magic E (CVCe)',
    subtitle: 'Silent e makes the vowel long',
    words: [
      { word: 'make',  phonetic: '/meɪk/', definition: 'a_e → /eɪ/ (make, cake, name, late)',  audio: 'make.mp3',  image: '', has_image: false },
      { word: 'time',  phonetic: '/taɪm/', definition: 'i_e → /aɪ/ (time, bike, fine, like)',  audio: 'time.mp3',  image: '', has_image: false },
      { word: 'home',  phonetic: '/həʊm/', definition: 'o_e → /əʊ/ (home, note, hope, bone)',  audio: 'home.mp3',  image: '', has_image: false },
      { word: 'cute',  phonetic: '/kjuːt/', definition: 'u_e → /juː/ (cute, tune, cube, mule)', audio: 'cute.mp3',  image: '', has_image: false },
      { word: 'these', phonetic: '/ðiːz/', definition: 'e_e → /iː/ (these, here, theme)',       audio: 'these.mp3', image: '', has_image: false },
      { word: 'cake',  phonetic: '/keɪk/', definition: 'a_e pattern: cake, lake, same, wave',   audio: 'cake.mp3',  image: '', has_image: false },
      { word: 'bike',  phonetic: '/baɪk/', definition: 'i_e pattern: bike, kite, pine, ride',   audio: 'bike.mp3',  image: '', has_image: false },
      { word: 'bone',  phonetic: '/bəʊn/', definition: 'o_e pattern: bone, code, pole, rose',   audio: 'bone.mp3',  image: '', has_image: false },
    ]
  },

  // ── Level 3: Vowel Teams ────────────────────────────────────────────────
  phL3u1: {
    title: 'Vowel Teams: ai / ay',
    subtitle: 'ai ay → /eɪ/',
    words: [
      { word: 'rain',  phonetic: '/reɪn/', definition: 'ai → /eɪ/ (rain, tail, wait, sail)',  audio: 'rain.mp3',  image: '', has_image: false },
      { word: 'play',  phonetic: '/pleɪ/', definition: 'ay → /eɪ/ (play, day, say, way)',     audio: 'play.mp3',  image: '', has_image: false },
      { word: 'train', phonetic: '/treɪn/', definition: 'ai in train, brain, chain, plain',   audio: 'train.mp3', image: '', has_image: false },
      { word: 'stay',  phonetic: '/steɪ/', definition: 'ay in stay, clay, pray, spray',       audio: 'stay.mp3',  image: '', has_image: false },
      { word: 'snail', phonetic: '/sneɪl/', definition: 'ai in snail, trail, frail',          audio: 'snail.mp3', image: '', has_image: false },
    ]
  },

  phL3u2: {
    title: 'Vowel Teams: ee / ea',
    subtitle: 'ee ea → /iː/',
    words: [
      { word: 'bee',   phonetic: '/biː/',  definition: 'ee → /iː/ (bee, tree, see, free)',    audio: 'bee.mp3',   image: '', has_image: false },
      { word: 'tea',   phonetic: '/tiː/',  definition: 'ea → /iː/ (tea, sea, read, meat)',    audio: 'tea.mp3',   image: '', has_image: false },
      { word: 'bread', phonetic: '/bred/', definition: 'ea → /e/ exception (bread, head, dead)', audio: 'bread.mp3', image: '', has_image: false },
      { word: 'tree',  phonetic: '/triː/', definition: 'ee in tree, green, sleep, feet',      audio: 'tree.mp3',  image: '', has_image: false },
      { word: 'dream', phonetic: '/driːm/', definition: 'ea in dream, cream, stream, clean',  audio: 'dream.mp3', image: '', has_image: false },
    ]
  },

  phL3u3: {
    title: 'Vowel Teams: oa / oo',
    subtitle: 'oa → /əʊ/  oo → /uː/ or /ʊ/',
    words: [
      { word: 'boat',  phonetic: '/bəʊt/', definition: 'oa → /əʊ/ (boat, coat, road, soap)',  audio: 'boat.mp3',  image: '', has_image: false },
      { word: 'moon',  phonetic: '/muːn/', definition: 'oo → /uː/ (moon, food, pool, soon)',  audio: 'moon.mp3',  image: '', has_image: false },
      { word: 'book',  phonetic: '/bʊk/',  definition: 'oo → /ʊ/ (book, cook, look, foot)',  audio: 'book.mp3',  image: '', has_image: false },
      { word: 'road',  phonetic: '/rəʊd/', definition: 'oa in road, toad, groan, float',      audio: 'road.mp3',  image: '', has_image: false },
      { word: 'school', phonetic: '/skuːl/', definition: 'oo in school, cool, fool, tool',    audio: 'school.mp3', image: '', has_image: false },
    ]
  },

  phL3u4: {
    title: 'Vowel Teams: ou / ow / oi / oy',
    subtitle: 'ou ow → /aʊ/  oi oy → /ɔɪ/',
    words: [
      { word: 'out',   phonetic: '/aʊt/',  definition: 'ou → /aʊ/ (out, loud, found, cloud)', audio: 'out.mp3',   image: '', has_image: false },
      { word: 'now',   phonetic: '/naʊ/',  definition: 'ow → /aʊ/ (now, cow, how, town)',     audio: 'now.mp3',   image: '', has_image: false },
      { word: 'slow',  phonetic: '/sləʊ/', definition: 'ow → /əʊ/ (slow, snow, grow, flow)',  audio: 'slow.mp3',  image: '', has_image: false },
      { word: 'coin',  phonetic: '/kɔɪn/', definition: 'oi → /ɔɪ/ (coin, oil, join, soil)',   audio: 'coin.mp3',  image: '', has_image: false },
      { word: 'boy',   phonetic: '/bɔɪ/',  definition: 'oy → /ɔɪ/ (boy, toy, joy, royal)',    audio: 'boy.mp3',   image: '', has_image: false },
    ]
  },

  // ── Level 4: Consonant Digraphs + Blends ───────────────────────────────
  phL4u1: {
    title: 'Consonant Digraphs',
    subtitle: 'ch sh th wh ph ng nk',
    words: [
      { word: 'chair',  phonetic: '/tʃeə/', definition: 'ch → /tʃ/ (chair, child, chip, lunch)',  audio: 'chair.mp3',  image: '', has_image: false },
      { word: 'ship',   phonetic: '/ʃɪp/',  definition: 'sh → /ʃ/ (ship, fish, shop, wish)',      audio: 'ship.mp3',   image: '', has_image: false },
      { word: 'think',  phonetic: '/θɪŋk/', definition: 'th → /θ/ voiceless (think, three, bath)', audio: 'think.mp3',  image: '', has_image: false },
      { word: 'this',   phonetic: '/ðɪs/',  definition: 'th → /ð/ voiced (this, that, them, with)', audio: 'this.mp3',   image: '', has_image: false },
      { word: 'what',   phonetic: '/wɒt/',  definition: 'wh → /w/ (what, when, where, which)',    audio: 'what.mp3',   image: '', has_image: false },
      { word: 'phone',  phonetic: '/fəʊn/', definition: 'ph → /f/ (phone, photo, graph)',          audio: 'phone.mp3',  image: '', has_image: false },
      { word: 'sing',   phonetic: '/sɪŋ/',  definition: 'ng → /ŋ/ (sing, long, ring, song)',      audio: 'sing.mp3',   image: '', has_image: false },
      { word: 'think',  phonetic: '/θɪŋk/', definition: 'nk → /ŋk/ (think, bank, drink, pink)',   audio: 'think.mp3',  image: '', has_image: false },
    ]
  },

  phL4u2: {
    title: 'Consonant Blends',
    subtitle: 'bl br cl cr dr fl fr + 3-letter blends',
    words: [
      { word: 'black',  phonetic: '/blæk/', definition: 'bl blend (black, blue, blow, blank)',    audio: 'black.mp3',  image: '', has_image: false },
      { word: 'bread',  phonetic: '/bred/', definition: 'br blend (bread, bring, brown, break)',  audio: 'bread.mp3',  image: '', has_image: false },
      { word: 'clap',   phonetic: '/klæp/', definition: 'cl blend (clap, class, clean, clock)',   audio: 'clap.mp3',   image: '', has_image: false },
      { word: 'crab',   phonetic: '/kræb/', definition: 'cr blend (crab, cry, cross, crown)',     audio: 'crab.mp3',   image: '', has_image: false },
      { word: 'drum',   phonetic: '/drʌm/', definition: 'dr blend (drum, draw, dress, drink)',    audio: 'drum.mp3',   image: '', has_image: false },
      { word: 'flag',   phonetic: '/flæɡ/', definition: 'fl blend (flag, flat, fly, floor)',      audio: 'flag.mp3',   image: '', has_image: false },
      { word: 'frog',   phonetic: '/frɒɡ/', definition: 'fr blend (frog, from, free, fresh)',     audio: 'frog.mp3',   image: '', has_image: false },
      { word: 'street', phonetic: '/striːt/', definition: 'str 3-letter blend (street, strong, strip)', audio: 'street.mp3', image: '', has_image: false },
      { word: 'spring', phonetic: '/sprɪŋ/', definition: 'spr 3-letter blend (spring, spray, spread)', audio: 'spring.mp3', image: '', has_image: false },
    ]
  },

  // ── Level 5: R-Controlled Vowels + Diphthongs ──────────────────────────
  phL5u1: {
    title: 'R-Controlled Vowels',
    subtitle: 'ar or er ir ur',
    words: [
      { word: 'car',   phonetic: '/kɑː/',  definition: 'ar → /ɑː/ (car, star, farm, park)',    audio: 'car.mp3',   image: '', has_image: false },
      { word: 'fork',  phonetic: '/fɔːk/', definition: 'or → /ɔː/ (fork, horse, corn, sport)', audio: 'fork.mp3',  image: '', has_image: false },
      { word: 'her',   phonetic: '/hɜː/',  definition: 'er → /ɜː/ (her, term, fern, verb)',    audio: 'her.mp3',   image: '', has_image: false },
      { word: 'bird',  phonetic: '/bɜːd/', definition: 'ir → /ɜː/ (bird, girl, first, shirt)', audio: 'bird.mp3',  image: '', has_image: false },
      { word: 'turn',  phonetic: '/tɜːn/', definition: 'ur → /ɜː/ (turn, burn, hurt, curl)',   audio: 'turn.mp3',  image: '', has_image: false },
      { word: 'care',  phonetic: '/keə/',  definition: 'are/air → /eə/ (care, chair, share)',  audio: 'care.mp3',  image: '', has_image: false },
    ]
  },

  phL5u2: {
    title: 'Diphthongs',
    subtitle: '/eɪ/ /aɪ/ /ɔɪ/ /aʊ/ /əʊ/ /ɪə/ /eə/ /ʊə/',
    words: [
      { word: 'cake',  phonetic: '/keɪk/', definition: '/eɪ/ diphthong (cake, rain, play, they)', audio: 'cake.mp3',  image: '', has_image: false },
      { word: 'my',    phonetic: '/maɪ/',  definition: '/aɪ/ diphthong (my, time, night, fly)',   audio: 'my.mp3',    image: '', has_image: false },
      { word: 'boy',   phonetic: '/bɔɪ/',  definition: '/ɔɪ/ diphthong (boy, coin, noise)',       audio: 'boy.mp3',   image: '', has_image: false },
      { word: 'now',   phonetic: '/naʊ/',  definition: '/aʊ/ diphthong (now, out, town, cloud)',  audio: 'now.mp3',   image: '', has_image: false },
      { word: 'go',    phonetic: '/ɡəʊ/',  definition: '/əʊ/ diphthong (go, home, boat, snow)',   audio: 'go.mp3',    image: '', has_image: false },
      { word: 'ear',   phonetic: '/ɪə/',   definition: '/ɪə/ diphthong (ear, here, near, fear)',  audio: 'ear.mp3',   image: '', has_image: false },
      { word: 'hair',  phonetic: '/heə/',  definition: '/eə/ diphthong (hair, care, bear, there)', audio: 'hair.mp3',  image: '', has_image: false },
      { word: 'poor',  phonetic: '/pʊə/',  definition: '/ʊə/ diphthong (poor, tour, sure)',       audio: 'poor.mp3',  image: '', has_image: false },
    ]
  },

  // ── Level 6: Special Rules ──────────────────────────────────────────────
  phL6u1: {
    title: 'Silent Letters',
    subtitle: 'kn- wr- -mb -bt -st',
    words: [
      { word: 'knee',   phonetic: '/niː/',   definition: 'kn- → silent k (knee, know, knife, knock)', audio: 'knee.mp3',   image: '', has_image: false },
      { word: 'write',  phonetic: '/raɪt/',  definition: 'wr- → silent w (write, wrong, wrap, wrist)', audio: 'write.mp3',  image: '', has_image: false },
      { word: 'climb',  phonetic: '/klaɪm/', definition: '-mb → silent b (climb, lamb, thumb, comb)',  audio: 'climb.mp3',  image: '', has_image: false },
      { word: 'doubt',  phonetic: '/daʊt/',  definition: '-bt → silent b (doubt, debt)',               audio: 'doubt.mp3',  image: '', has_image: false },
      { word: 'listen', phonetic: '/ˈlɪsn/', definition: '-st → silent t (listen, fasten, castle)',    audio: 'listen.mp3', image: '', has_image: false },
      { word: 'honest', phonetic: '/ˈɒnɪst/', definition: 'h → silent (honest, hour, heir)',          audio: 'honest.mp3', image: '', has_image: false },
    ]
  },

  phL6u2: {
    title: 'Irregular Words',
    subtitle: 'High-frequency sight words',
    words: [
      { word: 'the',   phonetic: '/ðə/',   definition: 'the → /ðə/ (most common English word)',  audio: 'the.mp3',   image: '', has_image: false },
      { word: 'said',  phonetic: '/sed/',  definition: 'said → /sed/ (not /seɪd/)',               audio: 'said.mp3',  image: '', has_image: false },
      { word: 'was',   phonetic: '/wɒz/',  definition: 'was → /wɒz/ (not /wæs/)',                 audio: 'was.mp3',   image: '', has_image: false },
      { word: 'of',    phonetic: '/ɒv/',   definition: 'of → /ɒv/ (not /ɒf/)',                    audio: 'of.mp3',    image: '', has_image: false },
      { word: 'do',    phonetic: '/duː/',  definition: 'do → /duː/ (not /dəʊ/)',                  audio: 'do.mp3',    image: '', has_image: false },
      { word: 'have',  phonetic: '/hæv/',  definition: 'have → /hæv/ (not /heɪv/)',               audio: 'have.mp3',  image: '', has_image: false },
      { word: 'come',  phonetic: '/kʌm/',  definition: 'come → /kʌm/ (not /kəʊm/)',               audio: 'come.mp3',  image: '', has_image: false },
      { word: 'some',  phonetic: '/sʌm/',  definition: 'some → /sʌm/ (not /səʊm/)',               audio: 'some.mp3',  image: '', has_image: false },
    ]
  },

  phL6u3: {
    title: 'Multisyllabic Words',
    subtitle: 'Syllable splitting rules',
    words: [
      { word: 'pencil',   phonetic: '/ˈpensɪl/',  definition: 'pen·cil — VC/CV split (consonant between vowels)', audio: 'pencil.mp3',   image: '', has_image: false },
      { word: 'rabbit',   phonetic: '/ˈræbɪt/',   definition: 'rab·bit — double consonant splits (VC/CV)',        audio: 'rabbit.mp3',   image: '', has_image: false },
      { word: 'table',    phonetic: '/ˈteɪbl/',   definition: 'ta·ble — open syllable + consonant-le',            audio: 'table.mp3',    image: '', has_image: false },
      { word: 'hospital', phonetic: '/ˈhɒspɪtl/', definition: 'hos·pi·tal — 3 syllables',                        audio: 'hospital.mp3', image: '', has_image: false },
      { word: 'umbrella', phonetic: '/ʌmˈbrelə/', definition: 'um·brel·la — 3 syllables',                        audio: 'umbrella.mp3', image: '', has_image: false },
      { word: 'fantastic', phonetic: '/fænˈtæstɪk/', definition: 'fan·tas·tic — 3 syllables',                    audio: 'fantastic.mp3', image: '', has_image: false },
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
  { id: 'phL1', label: 'Level 1', title: '26 Letters & Short Vowels', units: ['phL1u1','phL1u2','phL1u3'] },
  { id: 'phL2', label: 'Level 2', title: 'Long Vowels & Magic E',     units: ['phL2u1','phL2u2'] },
  { id: 'phL3', label: 'Level 3', title: 'Vowel Teams',               units: ['phL3u1','phL3u2','phL3u3','phL3u4'] },
  { id: 'phL4', label: 'Level 4', title: 'Consonant Digraphs & Blends', units: ['phL4u1','phL4u2'] },
  { id: 'phL5', label: 'Level 5', title: 'R-Controlled & Diphthongs', units: ['phL5u1','phL5u2'] },
  { id: 'phL6', label: 'Level 6', title: 'Special Rules',             units: ['phL6u1','phL6u2','phL6u3'] },
]
