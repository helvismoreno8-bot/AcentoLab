import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================================
   AcentoLab — Entrenador de pronunciación, acento y vocabulario en inglés
   para hispanohablantes (afinado para un bogotano).
   Novedades:
   - Progreso guardado entre sesiones (window.storage) + racha
   - Modo Charla: conversación con tutor IA
   - Panel de Progreso (estadísticas)
   - Ritmo y entonación de frases completas
   ========================================================================= */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

.al-root{
  --paper:#EAEDEF; --surface:#FFFFFF; --ink:#1B2233; --muted:#5A6478;
  --line:#DFE3E8; --coral:#F2545B; --coral-d:#D63B44; --teal:#12A594;
  --amber:#F6B93B; --violet:#5B58C7;
  --serif:'Fraunces',Georgia,serif; --sans:'Inter',system-ui,sans-serif;
  --mono:'Space Mono','SF Mono',ui-monospace,monospace;
  font-family:var(--sans); color:var(--ink);
  background:
    radial-gradient(1200px 500px at 15% -10%, #F5EDE4 0%, transparent 55%),
    radial-gradient(900px 500px at 100% 0%, #E3EFEC 0%, transparent 50%),
    var(--paper);
  min-height:100vh; -webkit-font-smoothing:antialiased;
}
.al-root *{box-sizing:border-box;}
.al-wrap{max-width:720px;margin:0 auto;padding:28px 18px 72px;}

.al-ipa-strip{font-family:var(--mono);color:#B9C0CB;font-size:15px;letter-spacing:.28em;
  user-select:none;overflow:hidden;white-space:nowrap;margin-bottom:18px;}

.al-brand{display:flex;align-items:baseline;gap:10px;margin-bottom:4px;}
.al-logo{font-family:var(--serif);font-weight:900;font-size:30px;letter-spacing:-.02em;}
.al-logo .dot{color:var(--coral);}
.al-tag{color:var(--muted);font-size:13px;font-weight:500;}

.al-card{background:var(--surface);border:1px solid var(--line);border-radius:18px;
  box-shadow:0 1px 0 rgba(27,34,51,.02),0 10px 30px -22px rgba(27,34,51,.35);}
.al-pad{padding:22px;}

.al-btn{font-family:var(--sans);font-weight:600;font-size:15px;border:none;cursor:pointer;
  border-radius:12px;padding:12px 18px;transition:transform .08s ease,filter .15s ease,background .15s;}
.al-btn:active{transform:translateY(1px);}
.al-btn:focus-visible{outline:3px solid #A9C7FF;outline-offset:2px;}
.al-primary{background:var(--coral);color:#fff;box-shadow:0 8px 18px -8px var(--coral);}
.al-primary:hover{filter:brightness(1.05);}
.al-ghost{background:#F1F3F5;color:var(--ink);}
.al-ghost:hover{background:#E8ECEF;}
.al-teal{background:var(--teal);color:#fff;}
.al-teal:hover{filter:brightness(1.06);}
.al-mini{padding:9px 13px;font-size:13.5px;border-radius:10px;}
.al-btn[disabled]{opacity:.5;cursor:not-allowed;}

.al-tabs{display:flex;gap:6px;background:#E4E8EB;border:1px solid var(--line);
  padding:5px;border-radius:14px;margin:18px 0;overflow:auto;}
.al-tab{flex:0 0 auto;white-space:nowrap;border:none;background:transparent;cursor:pointer;
  font-family:var(--sans);font-weight:600;font-size:13.5px;color:var(--muted);
  padding:9px 12px;border-radius:10px;transition:all .15s;}
.al-tab.on{background:#fff;color:var(--ink);box-shadow:0 4px 12px -6px rgba(27,34,51,.4);}

.al-chip{display:inline-flex;align-items:center;gap:7px;background:#EAF6F3;color:#0B7568;
  border:1px solid #BFE7DF;font-weight:700;font-size:13px;padding:6px 12px;border-radius:999px;}

.al-word{font-family:var(--serif);font-weight:600;font-size:30px;letter-spacing:-.01em;line-height:1.1;}
.al-ipa{font-family:var(--mono);color:var(--muted);font-size:15px;margin-top:2px;}
.al-eyebrow{font-family:var(--mono);text-transform:uppercase;letter-spacing:.18em;
  font-size:11px;color:var(--violet);font-weight:700;}

.al-pair{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;}
.al-vs{font-family:var(--mono);color:#C2C8D2;font-size:13px;font-weight:700;}
.al-slot{background:#F7F8FA;border:1px solid var(--line);border-radius:14px;padding:14px;text-align:center;}

.al-wave{display:inline-flex;align-items:flex-end;gap:3px;height:16px;}
.al-wave span{width:3px;height:5px;background:currentColor;border-radius:2px;opacity:.55;}
.al-wave.go span{animation:albar .7s ease-in-out infinite;}
.al-wave.go span:nth-child(2){animation-delay:.1s}
.al-wave.go span:nth-child(3){animation-delay:.2s}
.al-wave.go span:nth-child(4){animation-delay:.3s}
.al-wave.go span:nth-child(5){animation-delay:.15s}
@keyframes albar{0%,100%{height:5px}50%{height:16px}}

.al-rec{display:inline-block;width:9px;height:9px;border-radius:50%;background:#fff;margin-right:7px;
  animation:alpulse 1s ease-in-out infinite;}
@keyframes alpulse{0%,100%{opacity:1}50%{opacity:.3}}

.al-q{font-family:var(--serif);font-weight:600;font-size:21px;line-height:1.3;margin-bottom:16px;}
.al-opt{display:block;width:100%;text-align:left;background:#F7F8FA;border:1.5px solid var(--line);
  border-radius:13px;padding:14px 16px;margin-bottom:10px;cursor:pointer;font-size:15.5px;
  font-family:var(--sans);color:var(--ink);transition:all .12s;}
.al-opt:hover{border-color:#C7CDD6;background:#F1F3F6;}
.al-opt.sel{border-color:var(--coral);background:#FEF0F0;box-shadow:0 0 0 3px #FBDBDC;}

.al-progress{height:7px;background:#E1E5E9;border-radius:99px;overflow:hidden;margin-bottom:22px;}
.al-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--coral),var(--amber));
  border-radius:99px;transition:width .3s ease;}

.al-tip{background:#FFF8EC;border:1px solid #F3E2BC;border-radius:12px;padding:12px 14px;
  font-size:13.5px;color:#7A5B12;line-height:1.5;}
.al-tip b{color:#5E4409;}

.al-muted{color:var(--muted);}
.al-note{font-size:12.5px;color:var(--muted);line-height:1.5;}
.al-row{display:flex;gap:9px;flex-wrap:wrap;align-items:center;}
.al-hr{height:1px;background:var(--line);border:none;margin:18px 0;}
.al-spin{width:18px;height:18px;border:2.5px solid #E4E8EB;border-top-color:var(--coral);
  border-radius:50%;animation:alspin .7s linear infinite;display:inline-block;vertical-align:middle;}
@keyframes alspin{to{transform:rotate(360deg)}}

.al-fade{animation:alfade .35s ease both;}
@keyframes alfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

.al-flash-front{font-family:var(--serif);font-weight:600;font-size:26px;}
.al-box{font-family:var(--mono);font-size:11px;color:var(--muted);}

/* rhythm */
.al-sent{font-family:var(--serif);font-size:24px;line-height:1.5;}
.al-sent .st{color:var(--coral);font-weight:600;}
.al-sent .un{color:#9AA2AF;font-weight:400;font-size:19px;}

/* chat */
.al-chat{display:flex;flex-direction:column;gap:10px;max-height:420px;overflow-y:auto;padding:4px;}
.al-bub{max-width:82%;padding:11px 14px;border-radius:16px;font-size:15px;line-height:1.5;}
.al-bub.tut{align-self:flex-start;background:#F1F3F6;border:1px solid var(--line);border-bottom-left-radius:5px;}
.al-bub.me{align-self:flex-end;background:var(--coral);color:#fff;border-bottom-right-radius:5px;}
.al-fix{font-family:var(--sans);font-size:13px;color:#0B7568;margin-top:6px;display:block;}
.al-input{flex:1;border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;font-size:15px;
  font-family:var(--sans);outline:none;}
.al-input:focus{border-color:var(--coral);box-shadow:0 0 0 3px #FBDBDC;}

/* stats */
.al-stat{background:#F7F8FA;border:1px solid var(--line);border-radius:14px;padding:16px;text-align:center;}
.al-stat b{font-family:var(--serif);font-weight:900;font-size:30px;display:block;line-height:1;}
.al-statgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.al-bar{height:12px;background:#E4E8EB;border-radius:99px;overflow:hidden;margin:6px 0 12px;}
.al-bar i{display:block;height:100%;border-radius:99px;}

@media (max-width:560px){
  .al-word{font-size:25px;} .al-q{font-size:19px;} .al-logo{font-size:26px;} .al-sent{font-size:21px;}
}
`;

/* ------------------------------- DATA -------------------------------- */

const PLACEMENT = [
  { q: "She ___ a nurse at the hospital.", opts: ["are", "is", "am", "be"], a: 1 },
  { q: "There are five ___ in my bag.", opts: ["book", "bookes", "books", "bookies"], a: 2 },
  { q: "Yesterday I ___ to the market.", opts: ["go", "goed", "gone", "went"], a: 3 },
  { q: "That class was so long — I felt really ___.", opts: ["bored", "boring", "bore", "boredom"], a: 0 },
  { q: "I ___ never ___ Thai food before.", opts: ["did / eat", "have / eaten", "has / ate", "am / eating"], a: 1 },
  { q: "My brother is very good ___ chess.", opts: ["in", "on", "at", "with"], a: 2 },
  { q: '"Actually" en inglés significa…', opts: ["actualmente", "en realidad", "por ahora", "de hecho, hoy"], a: 1 },
  { q: "If I ___ more money, I would travel the world.", opts: ["have", "will have", "had", "would have"], a: 2 },
  { q: "We're really looking ___ to the concert.", opts: ["forward", "front", "ahead", "up"], a: 0 },
  { q: "A meticulous person is very ___.", opts: ["lazy", "careful", "loud", "fast"], a: 1 },
];

function scoreToLevel(correct) {
  if (correct <= 2) return { level: "A1", label: "Principiante" };
  if (correct <= 4) return { level: "A2", label: "Básico" };
  if (correct <= 6) return { level: "B1", label: "Intermedio" };
  if (correct <= 8) return { level: "B2", label: "Intermedio alto" };
  if (correct === 9) return { level: "C1", label: "Avanzado" };
  return { level: "C1", label: "Avanzado (¡casi C2!)" };
}

const SOUNDS = [
  { id: "vb", eyebrow: "/v/ vs /b/", title: "La V que no existe en español",
    tip: "En español V y B suenan igual. Para la /v/ inglesa, muerde suave el labio inferior con los dientes de arriba y deja vibrar el aire. La /b/ junta los dos labios.",
    pairs: [["vote","/voʊt/","boat","/boʊt/"],["very","/ˈvɛri/","berry","/ˈbɛri/"],["vest","/vɛst/","best","/bɛst/"]] },
  { id: "th1", eyebrow: "/θ/", title: "TH sordo (think)",
    tip: "Saca un poquito la punta de la lengua entre los dientes y sopla, SIN voz. No es /s/ ni /t/.",
    pairs: [["think","/θɪŋk/","sink","/sɪŋk/"],["thin","/θɪn/","tin","/tɪn/"],["three","/θriː/","tree","/triː/"]] },
  { id: "th2", eyebrow: "/ð/", title: "TH sonoro (this)",
    tip: "Misma posición de lengua entre los dientes, pero AHORA con voz (vibra la garganta). No lo cambies por /d/.",
    pairs: [["they","/ðeɪ/","day","/deɪ/"],["than","/ðæn/","Dan","/dæn/"],["breathe","/briːð/","breed","/briːd/"]] },
  { id: "z", eyebrow: "/z/ vs /s/", title: "La Z con zumbido",
    tip: "La /z/ inglesa vibra (zzz de abeja). En español no existe, tiendes a decir /s/. Pon la mano en la garganta: debe vibrar.",
    pairs: [["zip","/zɪp/","sip","/sɪp/"],["zoo","/zuː/","Sue","/suː/"],["buzz","/bʌz/","bus","/bʌs/"]] },
  { id: "ish", eyebrow: "/ʃ/ vs /tʃ/", title: "SH suave vs CH",
    tip: "La /ʃ/ (sh) es aire continuo, como pedir silencio: shhh. La /tʃ/ (ch) tiene un golpecito al inicio.",
    pairs: [["ship","/ʃɪp/","chip","/tʃɪp/"],["share","/ʃɛr/","chair","/tʃɛr/"],["wash","/wɑʃ/","watch","/wɑtʃ/"]] },
  { id: "ii", eyebrow: "/ɪ/ vs /iː/", title: "Ship o sheep",
    tip: "El español tiene una sola I. /iː/ es larga y tensa (sheep); /ɪ/ es corta y relajada (ship). No las mezcles.",
    pairs: [["ship","/ʃɪp/","sheep","/ʃiːp/"],["bit","/bɪt/","beat","/biːt/"],["live","/lɪv/","leave","/liːv/"]] },
  { id: "ae", eyebrow: "/æ/ · /ɛ/ · /ʌ/", title: "Bat, bet, but",
    tip: "Tres vocales que el español no distingue. /æ/ boca muy abierta (bat), /ɛ/ media (bet), /ʌ/ neutra y corta (but).",
    pairs: [["bat","/bæt/","bet","/bɛt/"],["cat","/kæt/","cut","/kʌt/"],["bad","/bæd/","bud","/bʌd/"]] },
  { id: "sclus", eyebrow: "sC-", title: "No digas 'eschool'",
    tip: "Palabras que empiezan en s + consonante NO llevan 'e' delante. Arranca directo con la /s/: 's-chool', no 'e-school'.",
    pairs: [["school","/skuːl/","speak","/spiːk/"],["Spain","/speɪn/","student","/ˈstuːdənt/"],["sport","/spɔːrt/","start","/stɑːrt/"]],
    singles: true },
];

const ENDINGS = {
  ed: { title: "Terminación -ed (3 sonidos)",
    tip: "Depende del sonido anterior: /t/ tras sonido sordo, /d/ tras sonoro, /ɪd/ tras t/d.",
    groups: [
      { label: "/t/  (sonido sordo antes)", words: [["walked","/wɔːkt/"],["stopped","/stɑpt/"],["laughed","/læft/"]] },
      { label: "/d/  (sonido sonoro antes)", words: [["played","/pleɪd/"],["called","/kɔːld/"],["opened","/ˈoʊpənd/"]] },
      { label: "/ɪd/  (después de t o d)", words: [["wanted","/ˈwɑntɪd/"],["needed","/ˈniːdɪd/"],["decided","/dɪˈsaɪdɪd/"]] },
    ] },
  s: { title: "Terminación -s (3 sonidos)",
    tip: "/s/ tras sonido sordo, /z/ tras sonoro, /ɪz/ tras sonidos sibilantes (s, z, sh, ch, ge).",
    groups: [
      { label: "/s/", words: [["cats","/kæts/"],["books","/bʊks/"],["stops","/stɑps/"]] },
      { label: "/z/", words: [["dogs","/dɔːgz/"],["plays","/pleɪz/"],["knees","/niːz/"]] },
      { label: "/ɪz/", words: [["houses","/ˈhaʊzɪz/"],["watches","/ˈwɑtʃɪz/"],["oranges","/ˈɔːrɪndʒɪz/"]] },
    ] },
  ough: { title: "-ough: misma escritura, 6 sonidos",
    tip: "El terror del inglés: se escribe igual pero suena distinto cada vez. Apréndelas de memoria, una por una.",
    groups: [
      { label: "distintos sonidos de -ough", words: [
        ["through","/θruː/"],["though","/ðoʊ/"],["tough","/tʌf/"],
        ["thought","/θɔːt/"],["cough","/kɔːf/"],["thorough","/ˈθʌroʊ/"]] },
    ] },
  fam: { title: "Familias que riman",
    tip: "Practica en bloque: el patrón se te queda en el oído y lo generalizas a palabras nuevas.",
    groups: [
      { label: "-ight  /aɪt/", words: [["night","/naɪt/"],["light","/laɪt/"],["bright","/braɪt/"]] },
      { label: "-ake  /eɪk/", words: [["make","/meɪk/"],["take","/teɪk/"],["cake","/keɪk/"]] },
      { label: "-tion  /ʃən/", words: [["nation","/ˈneɪʃən/"],["action","/ˈækʃən/"],["motion","/ˈmoʊʃən/"]] },
    ] },
};

const RHYTHM = {
  tip: "El inglés es de ritmo acentual: las palabras con contenido (verbos, sustantivos, adjetivos) suenan fuertes y largas; las de relleno (to, of, the, a, for) se comen y se acortan. El español da a todas las sílabas casi el mismo peso — ese contraste es lo que más marca el 'acento'.",
  items: [
    { sent: "I want to go to the store.", stress: ["want","go","store"], note: "'to' y 'the' se reducen a /tə/ y /ðə/. Rápido: 'wanna go'." },
    { sent: "What are you doing this weekend?", stress: ["doing","weekend"], note: "'What are you' se funde: /wɒdəjə/. Enlaza las palabras." },
    { sent: "I'd like a cup of coffee, please.", stress: ["like","cup","coffee","please"], note: "'of' es débil /əv/; enlaza 'cup_of'." },
    { sent: "He didn't know the answer.", stress: ["didn't","know","answer"], note: "'the' débil /ðə/; enlaza 'the_answer'." },
    { sent: "Can you give me a hand?", stress: ["give","hand"], note: "'Can you' se reduce a /kənjə/. (Idiom: pedir ayuda.)" },
    { sent: "We're going to be late for the meeting.", stress: ["going","late","meeting"], note: "'going to' → 'gonna'; 'for the' se comen." },
    { sent: "Thanks for everything you've done.", stress: ["Thanks","everything","done"], note: "Enlaza 'for_everything'; 'you've' contraído." },
    { sent: "She's been working all day long.", stress: ["working","day","long"], note: "'been' débil /bɪn/; 'She's' contraído." },
  ],
};

const VOCAB_TOPICS = ["trabajo","viajes","tecnología","comida","emociones","negocios","salud","vida diaria","estudios","naturaleza"];

// Preposiciones — trampas típicas del hispanohablante. Van casi siempre débiles al hablar.
const PREPOSITIONS = [
  { cat: "Tiempo", q: "The meeting is ___ Monday.", opts: ["in", "on", "at"], a: 1, full: "The meeting is on Monday.", exp: "Días de la semana → on." },
  { cat: "Tiempo", q: "I was born ___ 1998.", opts: ["in", "on", "at"], a: 0, full: "I was born in 1998.", exp: "Años, meses, estaciones → in." },
  { cat: "Tiempo", q: "See you ___ 9 o'clock.", opts: ["in", "on", "at"], a: 2, full: "See you at 9 o'clock.", exp: "Horas exactas → at." },
  { cat: "Lugar", q: "She lives ___ Bogotá.", opts: ["in", "on", "at"], a: 0, full: "She lives in Bogotá.", exp: "Ciudades y países → in." },
  { cat: "Lugar", q: "The keys are ___ the table.", opts: ["in", "on", "at"], a: 1, full: "The keys are on the table.", exp: "Sobre una superficie → on." },
  { cat: "Verbo + prep", q: "It depends ___ the weather.", opts: ["of", "on", "in"], a: 1, full: "It depends on the weather.", exp: "'Depend' siempre lleva ON, aunque en español digas 'depende de'." },
  { cat: "Verbo + prep", q: "We're waiting ___ the bus.", opts: ["for", "to", "by"], a: 0, full: "We're waiting for the bus.", exp: "'Wait' lleva FOR ('esperar el bus')." },
  { cat: "Verbo + prep", q: "He's listening ___ music.", opts: ["—", "to", "at"], a: 1, full: "He's listening to music.", exp: "'Listen' lleva TO." },
  { cat: "Verbo + prep", q: "We arrived ___ the airport late.", opts: ["to", "at", "in"], a: 1, full: "We arrived at the airport late.", exp: "'Arrive AT' un punto (o IN una ciudad). Nunca 'arrive to'." },
  { cat: "Verbo + prep", q: "Please explain the problem ___ me.", opts: ["—", "to", "for"], a: 1, full: "Please explain the problem to me.", exp: "'Explain TO someone'. No se dice 'explain me'." },
  { cat: "Adjetivo + prep", q: "I'm very good ___ cooking.", opts: ["in", "at", "on"], a: 1, full: "I'm very good at cooking.", exp: "good / bad AT algo." },
  { cat: "Adjetivo + prep", q: "She's married ___ a doctor.", opts: ["with", "to", "of"], a: 1, full: "She's married to a doctor.", exp: "'Married TO', no 'married with'." },
  { cat: "Adjetivo + prep", q: "Are you interested ___ art?", opts: ["in", "on", "for"], a: 0, full: "Are you interested in art?", exp: "interested IN." },
  { cat: "Adjetivo + prep", q: "I'm afraid ___ spiders.", opts: ["of", "to", "from"], a: 0, full: "I'm afraid of spiders.", exp: "afraid OF." },
  { cat: "Adjetivo + prep", q: "This one is different ___ the other.", opts: ["of", "than", "from"], a: 2, full: "This one is different from the other.", exp: "different FROM (inglés americano)." },
  { cat: "Adjetivo + prep", q: "I'm responsible ___ the team.", opts: ["of", "for", "about"], a: 1, full: "I'm responsible for the team.", exp: "responsible FOR." },
];

// Tiempos verbales difíciles de PRONUNCIAR: contracciones y reducciones del habla real.
const VERBS = {
  contr: { title: "Contracciones", sub: "Básicas",
    tip: "En inglés hablado casi todo va contraído. Decir la forma larga suena lento y raro; practícalas hasta que salgan solas.",
    items: [["I'm","/aɪm/","I am"],["you're","/jʊr/","you are"],["he's","/hiːz/","he is / he has"],
      ["I've","/aɪv/","I have"],["I'll","/aɪl/","I will"],["won't","/woʊnt/","will not"],
      ["didn't","/ˈdɪdənt/","did not"],["doesn't","/ˈdʌzənt/","does not"],["wouldn't","/ˈwʊdənt/","would not"]] },
  perfect: { title: "would've", sub: "Condicional perfecto",
    tip: "Se dicen /ˈwʊdəv/, /ˈʃʊdəv/, /ˈkʊdəv/ — el 'have' se reduce a /əv/. NUNCA se escribe ni se piensa como 'would of'.",
    items: [["would've","/ˈwʊdəv/","would have"],["should've","/ˈʃʊdəv/","should have"],
      ["could've","/ˈkʊdəv/","could have"],["must've","/ˈmʌstəv/","must have"],
      ["I would've gone","/aɪ ˈwʊdəv ɡɔːn/","condicional perfecto"]] },
  gonna: { title: "gonna / wanna", sub: "Reducciones",
    tip: "Reducciones del habla real: going to → gonna, want to → wanna, have to → hafta, got to → gotta. Informal pero universal.",
    items: [["gonna","/ˈɡʌnə/","going to"],["wanna","/ˈwɒnə/","want to"],
      ["hafta","/ˈhæftə/","have to"],["gotta","/ˈɡɒtə/","got to"],["used to","/ˈjuːstə/","antes solía"]] },
  past: { title: "Pasado -ed", sub: "Clusters",
    tip: "El pasado regular junta consonantes que el español separa. No metas vocales de más: 'asked' es /æskt/, ¡una sola sílaba!",
    items: [["asked","/æskt/","ask + ed"],["worked","/wɜːrkt/","work + ed"],
      ["watched","/wɑtʃt/","watch + ed"],["helped","/hɛlpt/","help + ed"],["texts","/tɛksts/","4 consonantes juntas"]] },
  dense: { title: "Frases densas", sub: "Todo junto",
    tip: "Aquí se junta todo: auxiliares débiles, contracciones y enlaces. Escúchalas y repítelas enteras, con ritmo.",
    items: [["I've been working all morning.","","present perfect continuous"],
      ["If I'd known, I would've told you.","","tercer condicional"],
      ["She's already left, hasn't she?","","present perfect + question tag"],
      ["What have you been doing?","/wʌt (h)əv jə bɪn ˈduːɪŋ/","'have you been' se come casi todo"]] },
};

/* --------------------------- STORAGE --------------------------------- */
function todayStr() { return new Date().toISOString().slice(0, 10); }
function daysBetween(a, b) {
  try { return Math.round((new Date(b) - new Date(a)) / 86400000); } catch (e) { return 99; }
}
async function storageGet(k) {
  try { const v = localStorage.getItem(k); return v == null ? null : { value: v }; } catch (e) { return null; }
}
async function storageSet(k, v) {
  try { localStorage.setItem(k, v); } catch (e) {}
}
async function storageDel(k) {
  try { localStorage.removeItem(k); } catch (e) {}
}
const DEFAULT_PROGRESS = {
  level: "B1", placementDone: false, vocabKnown: [],
  practice: { sounds: 0, endings: 0, rhythm: 0, verbs: 0 },
  prepCorrect: 0, prepTotal: 0,
  convoTurns: 0, streak: 1, lastActive: todayStr(), createdAt: todayStr(),
};

/* --------------------------- SPEECH HOOK ----------------------------- */
function useSpeech() {
  const [voices, setVoices] = useState([]);
  const [speakingKey, setSpeakingKey] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { try { window.speechSynthesis.onvoiceschanged = null; } catch (e) {} };
  }, []);
  const enVoice =
    voices.find((v) => /en[-_]US/i.test(v.lang)) ||
    voices.find((v) => /en[-_]GB/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang));
  const speak = useCallback((text, key, rate = 0.88) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (enVoice) u.voice = enVoice;
    u.lang = "en-US"; u.rate = rate;
    u.onend = () => setSpeakingKey(null);
    u.onerror = () => setSpeakingKey(null);
    setSpeakingKey(key);
    window.speechSynthesis.speak(u);
  }, [enVoice]);
  const supported = typeof window !== "undefined" && !!window.speechSynthesis;
  return { speak, speakingKey, supported };
}

/* --------------------------- RECORDER HOOK --------------------------- */
function useRecorder() {
  const supported =
    typeof navigator !== "undefined" && !!navigator.mediaDevices &&
    typeof window !== "undefined" && !!window.MediaRecorder;
  const [recordingKey, setRecordingKey] = useState(null);
  const [clips, setClips] = useState({});
  const [error, setError] = useState(null);
  const mr = useRef(null); const chunks = useRef([]);
  const start = useCallback(async (key) => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setClips((c) => ({ ...c, [key]: url }));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start(); mr.current = rec; setRecordingKey(key);
    } catch (e) {
      setError(e && e.name === "NotAllowedError" ? "denied" : "unavailable");
      setRecordingKey(null);
    }
  }, []);
  const stop = useCallback(() => {
    try { if (mr.current && mr.current.state !== "inactive") mr.current.stop(); } catch (e) {}
    setRecordingKey(null);
  }, []);
  return { supported, recordingKey, clips, error, start, stop };
}
function playClip(url) { try { const a = new Audio(url); a.play(); } catch (e) {} }

/* --------------------------- AI (Claude) ----------------------------- */
async function claudeText(system, messages) {
  const res = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
  });
  if (!res.ok) throw new Error("proxy error " + res.status);
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}
async function claudeJSON(system, user) {
  const t = await claudeText(system, [{ role: "user", content: user }]);
  return JSON.parse(t.replace(/```json/gi, "").replace(/```/g, "").trim());
}

/* --------------------------- SMALL PIECES ---------------------------- */
function Wave({ active, color }) {
  return (
    <span className={"al-wave" + (active ? " go" : "")} style={{ color: color || "currentColor" }}>
      <span /><span /><span /><span /><span />
    </span>
  );
}
function Practice({ pkey, text, speech, rec, onPractice }) {
  const speaking = speech.speakingKey === pkey;
  const recording = rec.recordingKey === pkey;
  const hasClip = !!rec.clips[pkey];
  const fire = (fn) => { if (onPractice) onPractice(); fn(); };
  return (
    <div className="al-row" style={{ marginTop: 12 }}>
      <button className="al-btn al-teal al-mini" onClick={() => fire(() => speech.speak(text, pkey))}>
        {speaking ? <Wave active color="#fff" /> : "🔊 Modelo"}
      </button>
      {rec.supported && (recording ? (
        <button className="al-btn al-primary al-mini" onClick={rec.stop}><span className="al-rec" />Detener</button>
      ) : (
        <button className="al-btn al-ghost al-mini" onClick={() => fire(() => rec.start(pkey))}>🎙️ Grabar</button>
      ))}
      {hasClip && (
        <button className="al-btn al-ghost al-mini" onClick={() => playClip(rec.clips[pkey])}>▶ Mi voz</button>
      )}
    </div>
  );
}
function LoadingCard({ msg }) {
  return (
    <div className="al-card al-pad al-fade" style={{ textAlign: "center", padding: 40 }}>
      <div className="al-spin" />
      <div className="al-muted" style={{ marginTop: 12, fontSize: 14.5 }}>{msg}</div>
    </div>
  );
}
function ErrorCard({ onRetry }) {
  return (
    <div className="al-card al-pad al-fade" style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>No pude cargar el contenido</div>
      <p className="al-note">La conexión con el tutor falló. Inténtalo de nuevo.</p>
      <button className="al-btn al-primary al-mini" style={{ marginTop: 8 }} onClick={onRetry}>Reintentar</button>
    </div>
  );
}

/* ------------------------------ SCREENS ------------------------------ */
function Welcome({ onStart }) {
  return (
    <div className="al-fade">
      <div className="al-ipa-strip">ə θ ð æ ʃ ʒ ŋ ɪ iː ʌ ʊ v z ɔː eɪ oʊ aɪ tʃ dʒ ə θ ð æ ʃ</div>
      <div className="al-brand"><span className="al-logo">Acento<span className="dot">·</span>Lab</span></div>
      <div className="al-tag" style={{ marginBottom: 22 }}>Pronunciación, acento y vocabulario en inglés · para hispanohablantes 🇨🇴</div>
      <div className="al-card al-pad">
        <div className="al-eyebrow">Cómo funciona</div>
        <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 24, margin: "8px 0 14px" }}>
          Un laboratorio para tu oído y tu boca.
        </h2>
        <p className="al-muted" style={{ lineHeight: 1.6, fontSize: 15, marginTop: 0 }}>
          Primero un test rápido para ubicar tu nivel. Luego practicas los sonidos que más se le
          atragantan a un bogotano, el ritmo de las frases, vocabulario e idioms a tu nivel, y
          puedes conversar con un tutor. Tu progreso se guarda solo.
        </p>
        <hr className="al-hr" />
        <p className="al-note" style={{ marginTop: 0 }}>
          🎙️ Grabar tu voz pide permiso de micrófono. Si tu navegador no lo permite aquí, el audio
          modelo sigue funcionando: escucha y repite en voz alta.
        </p>
        <button className="al-btn al-primary" style={{ marginTop: 16, width: "100%" }} onClick={onStart}>
          Empezar test de ubicación
        </button>
      </div>
    </div>
  );
}
function Placement({ onDone }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const q = PLACEMENT[i];
  const picked = answers[i];
  const pct = Math.round((i / PLACEMENT.length) * 100);
  function next() {
    if (i + 1 < PLACEMENT.length) setI(i + 1);
    else onDone(PLACEMENT.reduce((n, item, idx) => n + (answers[idx] === item.a ? 1 : 0), 0));
  }
  return (
    <div className="al-fade">
      <div className="al-brand" style={{ marginBottom: 16 }}>
        <span className="al-logo" style={{ fontSize: 22 }}>Acento<span className="dot">·</span>Lab</span>
        <span className="al-tag">Test de ubicación</span>
      </div>
      <div className="al-progress"><i style={{ width: pct + "%" }} /></div>
      <div className="al-card al-pad">
        <div className="al-eyebrow">Pregunta {i + 1} de {PLACEMENT.length}</div>
        <div className="al-q" style={{ marginTop: 10 }}>{q.q}</div>
        {q.opts.map((o, idx) => (
          <button key={idx} className={"al-opt" + (picked === idx ? " sel" : "")}
            onClick={() => setAnswers((a) => ({ ...a, [i]: idx }))}>{o}</button>
        ))}
        <div className="al-row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          <button className="al-btn al-ghost al-mini" disabled={i === 0} onClick={() => setI(i - 1)}>← Atrás</button>
          <button className="al-btn al-primary" disabled={picked === undefined} onClick={next}>
            {i + 1 === PLACEMENT.length ? "Ver mi nivel" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}
function Results({ correct, onContinue }) {
  const { level, label } = scoreToLevel(correct);
  return (
    <div className="al-fade">
      <div className="al-card al-pad" style={{ textAlign: "center" }}>
        <div className="al-eyebrow">Tu nivel estimado</div>
        <div style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 64, lineHeight: 1, margin: "10px 0", color: "var(--coral)" }}>{level}</div>
        <div style={{ fontWeight: 600, fontSize: 18 }}>{label}</div>
        <p className="al-muted" style={{ fontSize: 14.5, marginTop: 10 }}>
          Acertaste {correct} de {PLACEMENT.length}. Usaré este nivel para elegir tu vocabulario e idioms. Puedes cambiarlo cuando quieras.
        </p>
        <button className="al-btn al-primary" style={{ marginTop: 14, width: "100%" }} onClick={() => onContinue(level)}>
          Entrar a practicar
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- MODULES ------------------------------- */
function SoundsModule({ speech, rec, track }) {
  const [open, setOpen] = useState(SOUNDS[0].id);
  const t = () => track("sounds");
  return (
    <div className="al-fade">
      {SOUNDS.map((s) => {
        const isOpen = open === s.id;
        return (
          <div key={s.id} className="al-card" style={{ marginBottom: 12 }}>
            <button onClick={() => setOpen(isOpen ? null : s.id)}
              style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 18 }}>
              <div className="al-eyebrow">{s.eyebrow}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 19 }}>{s.title}</span>
                <span className="al-muted" style={{ fontSize: 20 }}>{isOpen ? "–" : "+"}</span>
              </div>
            </button>
            {isOpen && (
              <div className="al-pad" style={{ paddingTop: 0 }}>
                <div className="al-tip" style={{ marginBottom: 16 }}>{s.tip}</div>
                {s.singles
                  ? s.pairs.map((row, ri) => (
                      <div key={ri} className="al-pair" style={{ marginBottom: 12 }}>
                        {[[row[0], row[1]], [row[2], row[3]]].map((w, wi) => (
                          <div key={wi} className="al-slot" style={{ gridColumn: wi === 0 ? "1" : "3" }}>
                            <div className="al-word" style={{ fontSize: 22 }}>{w[0]}</div>
                            <div className="al-ipa">{w[1]}</div>
                            <Practice pkey={s.id + ri + wi} text={w[0]} speech={speech} rec={rec} onPractice={t} />
                          </div>
                        ))}
                        <span className="al-vs" style={{ gridColumn: 2 }}>·</span>
                      </div>
                    ))
                  : s.pairs.map((p, ri) => (
                      <div key={ri} className="al-pair" style={{ marginBottom: 12 }}>
                        <div className="al-slot">
                          <div className="al-word" style={{ fontSize: 22 }}>{p[0]}</div>
                          <div className="al-ipa">{p[1]}</div>
                          <Practice pkey={s.id + ri + "a"} text={p[0]} speech={speech} rec={rec} onPractice={t} />
                        </div>
                        <span className="al-vs">vs</span>
                        <div className="al-slot">
                          <div className="al-word" style={{ fontSize: 22 }}>{p[2]}</div>
                          <div className="al-ipa">{p[3]}</div>
                          <Practice pkey={s.id + ri + "b"} text={p[2]} speech={speech} rec={rec} onPractice={t} />
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EndingsModule({ speech, rec, track }) {
  const keys = Object.keys(ENDINGS);
  const [sub, setSub] = useState(keys[0]);
  const data = ENDINGS[sub];
  const t = () => track("endings");
  return (
    <div className="al-fade">
      <div className="al-tabs">
        {keys.map((k) => (
          <button key={k} className={"al-tab" + (sub === k ? " on" : "")} onClick={() => setSub(k)}>
            {k === "ed" ? "-ed" : k === "s" ? "-s" : k === "ough" ? "-ough" : "rimas"}
          </button>
        ))}
      </div>
      <div className="al-card al-pad">
        <div className="al-word" style={{ fontSize: 21 }}>{data.title}</div>
        <div className="al-tip" style={{ margin: "12px 0 18px" }}>{data.tip}</div>
        {data.groups.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 18 }}>
            <div className="al-eyebrow" style={{ marginBottom: 8 }}>{g.label}</div>
            <div className="al-row">
              {g.words.map((w, wi) => (
                <div key={wi} className="al-slot" style={{ flex: "1 1 140px", minWidth: 120 }}>
                  <div className="al-word" style={{ fontSize: 19 }}>{w[0]}</div>
                  <div className="al-ipa">{w[1]}</div>
                  <Practice pkey={sub + gi + wi} text={w[0]} speech={speech} rec={rec} onPractice={t} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RhythmModule({ speech, rec, track }) {
  const t = () => track("rhythm");
  return (
    <div className="al-fade">
      <div className="al-tip" style={{ marginBottom: 14 }}>{RHYTHM.tip}</div>
      {RHYTHM.items.map((it, i) => {
        const words = it.sent.split(" ");
        const stressSet = new Set(it.stress.map((w) => w.toLowerCase()));
        return (
          <div key={i} className="al-card al-pad" style={{ marginBottom: 12 }}>
            <div className="al-sent">
              {words.map((w, wi) => {
                const clean = w.replace(/[.,?!]/g, "").toLowerCase();
                const on = stressSet.has(clean);
                return <span key={wi} className={on ? "st" : "un"}>{w}{wi < words.length - 1 ? " " : ""}</span>;
              })}
            </div>
            <div className="al-note" style={{ marginTop: 10 }}>💬 {it.note}</div>
            <Practice pkey={"rh" + i} text={it.sent} speech={speech} rec={rec} onPractice={t} />
          </div>
        );
      })}
      <div className="al-note" style={{ textAlign: "center", marginTop: 6 }}>
        Escucha el modelo, fíjate en las palabras <span style={{ color: "var(--coral)", fontWeight: 600 }}>fuertes</span> y repítelo con ese vaivén.
      </div>
    </div>
  );
}

function VocabModule({ level, speech, rec, track, onKnown, known }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setErr(false);
    const topic = VOCAB_TOPICS[Math.floor(Math.random() * VOCAB_TOPICS.length)];
    try {
      const sys = "Eres tutor de inglés para hispanohablantes de Bogotá, Colombia. Devuelves SOLO un array JSON válido, sin texto, sin markdown, sin ```.";
      const user = `Genera 6 palabras de vocabulario en inglés útiles y NO triviales para el nivel CEFR ${level}, tema: ${topic}. No repitas palabras muy básicas. Cada objeto con las claves exactas: "word", "ipa" (transcripción IPA entre //), "pos" (categoría gramatical corta), "es" (traducción al español), "def" (definición en inglés, máx 11 palabras), "example" (oración natural en inglés, máx 13 palabras). Varía las palabras.`;
      const arr = await claudeJSON(sys, user);
      if (Array.isArray(arr) && arr.length) { setItems(arr); setIdx(0); setFlipped(false); setSession({}); }
      else setErr(true);
    } catch (e) { setErr(true); }
    setLoading(false);
  }, [level]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingCard msg="Preparando tu vocabulario…" />;
  if (err) return <ErrorCard onRetry={load} />;
  if (!items.length) return null;

  const card = items[idx];
  const total = items.length;
  const key = "voc" + idx + card.word;
  function mark(isKnown) {
    setSession((k) => ({ ...k, [idx]: isKnown }));
    if (isKnown) onKnown(card.word);
    setFlipped(false);
    if (idx + 1 < total) setIdx(idx + 1);
  }
  const doneCount = Object.keys(session).length;

  return (
    <div className="al-fade">
      <div className="al-row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <span className="al-box">Tarjeta {idx + 1} / {total} · nivel {level} · sabes {known.length} en total</span>
        <button className="al-btn al-ghost al-mini" onClick={load}>↻ Nuevas palabras</button>
      </div>
      <div className="al-card al-pad" style={{ minHeight: 210 }}>
        <div className="al-eyebrow">{card.pos}</div>
        <div className="al-flash-front" style={{ marginTop: 6 }}>{card.word}</div>
        <div className="al-ipa">{card.ipa}</div>
        <Practice pkey={key} text={card.word} speech={speech} rec={rec} onPractice={() => track("sounds")} />
        {!flipped ? (
          <button className="al-btn al-ghost al-mini" style={{ marginTop: 16 }} onClick={() => setFlipped(true)}>Mostrar significado</button>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{card.es}</div>
            <div className="al-muted" style={{ fontSize: 14.5 }}>{card.def}</div>
            <div style={{ marginTop: 10, fontStyle: "italic", fontSize: 15 }}>“{card.example}”</div>
            <button className="al-btn al-teal al-mini" style={{ marginTop: 12 }} onClick={() => speech.speak(card.example, key + "ex")}>
              {speech.speakingKey === key + "ex" ? <Wave active color="#fff" /> : "🔊 Oración"}
            </button>
          </div>
        )}
      </div>
      <div className="al-row" style={{ justifyContent: "space-between", marginTop: 14 }}>
        <button className="al-btn al-ghost" onClick={() => mark(false)}>↻ Repasar</button>
        <button className="al-btn al-primary" onClick={() => mark(true)}>✓ Ya la sé</button>
      </div>
      {doneCount === total && (
        <div className="al-tip" style={{ marginTop: 14, textAlign: "center" }}>
          ¡Terminaste el set! Sabías {Object.values(session).filter(Boolean).length} de {total}. Pulsa <b>↻ Nuevas palabras</b> para otro tema.
        </div>
      )}
    </div>
  );
}

function IdiomsModule({ level, speech, rec }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [reveal, setReveal] = useState({});
  const load = useCallback(async () => {
    setLoading(true); setErr(false); setReveal({});
    try {
      const sys = "Eres tutor de inglés para hispanohablantes de Bogotá, Colombia. Devuelves SOLO un array JSON válido, sin texto, sin markdown, sin ```.";
      const user = `Genera 5 idioms (expresiones idiomáticas) en inglés comunes y apropiados para el nivel CEFR ${level}. Cada objeto con claves exactas: "idiom", "meaning" (significado en inglés claro, máx 11 palabras), "es" (qué significa en español, máx 11 palabras), "example" (oración natural que use el idiom), "register" (uno de: informal, neutral, formal). Varía las expresiones.`;
      const arr = await claudeJSON(sys, user);
      if (Array.isArray(arr) && arr.length) setItems(arr); else setErr(true);
    } catch (e) { setErr(true); }
    setLoading(false);
  }, [level]);
  useEffect(() => { load(); }, [load]);
  if (loading) return <LoadingCard msg="Buscando idioms para tu nivel…" />;
  if (err) return <ErrorCard onRetry={load} />;
  return (
    <div className="al-fade">
      <div className="al-row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <span className="al-box">Idioms · nivel {level}</span>
        <button className="al-btn al-ghost al-mini" onClick={load}>↻ Otros idioms</button>
      </div>
      {items.map((it, i) => {
        const key = "id" + i + (it.idiom || "");
        const shown = reveal[i];
        return (
          <div key={i} className="al-card al-pad" style={{ marginBottom: 12 }}>
            <div className="al-row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="al-word" style={{ fontSize: 20 }}>{it.idiom}</div>
              <span className="al-chip" style={{ background: "#EEF0FF", color: "var(--violet)", borderColor: "#D5D8FA" }}>{it.register}</span>
            </div>
            <div className="al-row" style={{ marginTop: 10 }}>
              <button className="al-btn al-teal al-mini" onClick={() => speech.speak(it.example || it.idiom, key)}>
                {speech.speakingKey === key ? <Wave active color="#fff" /> : "🔊 Escuchar"}
              </button>
              {rec.supported && (rec.recordingKey === key
                ? <button className="al-btn al-primary al-mini" onClick={rec.stop}><span className="al-rec" />Detener</button>
                : <button className="al-btn al-ghost al-mini" onClick={() => rec.start(key)}>🎙️ Grabar</button>)}
              {rec.clips[key] && <button className="al-btn al-ghost al-mini" onClick={() => playClip(rec.clips[key])}>▶ Mi voz</button>}
              <button className="al-btn al-ghost al-mini" onClick={() => setReveal((r) => ({ ...r, [i]: !shown }))}>
                {shown ? "Ocultar" : "¿Qué significa?"}
              </button>
            </div>
            {shown && (
              <div style={{ marginTop: 12 }} className="al-fade">
                <div style={{ fontWeight: 600 }}>{it.es}</div>
                <div className="al-muted" style={{ fontSize: 14.5, marginTop: 2 }}>{it.meaning}</div>
                <div style={{ marginTop: 8, fontStyle: "italic" }}>“{it.example}”</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChatModule({ level, speech, onTurn }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! 👋 I'm your English practice partner. Tell me — what did you do today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); setLoading(true); onTurn();
    try {
      const sys = `You are a warm, encouraging English conversation partner for a Spanish speaker from Bogotá, Colombia, at CEFR level ${level}. You already greeted them. Keep replies SHORT (2-3 sentences), natural spoken English suited to level ${level}, and ALWAYS end with a simple question to keep the chat going. If they make an important mistake, add one short line at the very end starting with "💡" giving the fix in Spanish (e.g. "💡 Mejor: ..."). Don't nitpick tiny things.`;
      const firstUser = next.findIndex((m) => m.role === "user");
      const apiMsgs = next.slice(firstUser).map((m) => ({ role: m.role, content: m.content }));
      const reply = await claudeText(sys, apiMsgs);
      setMessages((m) => [...m, { role: "assistant", content: reply || "Sorry, could you say that again?" }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Se cayó la conexión con el tutor. Intenta de nuevo." }]);
    }
    setLoading(false);
  }

  function renderTut(content) {
    const parts = content.split("💡");
    return (
      <>
        <span>{parts[0].trim()}</span>
        {parts[1] && <span className="al-fix">💡{parts[1].trim()}</span>}
      </>
    );
  }

  return (
    <div className="al-fade">
      <div className="al-card al-pad">
        <div className="al-eyebrow" style={{ marginBottom: 12 }}>Charla · nivel {level}</div>
        <div className="al-chat" ref={boxRef}>
          {messages.map((m, i) => (
            <div key={i} className={"al-bub " + (m.role === "user" ? "me" : "tut")}>
              {m.role === "assistant" ? (
                <>
                  {renderTut(m.content)}
                  <div>
                    <button className="al-btn al-ghost al-mini" style={{ marginTop: 8 }}
                      onClick={() => speech.speak(m.content.split("💡")[0], "chat" + i)}>
                      {speech.speakingKey === "chat" + i ? <Wave active /> : "🔊"}
                    </button>
                  </div>
                </>
              ) : m.content}
            </div>
          ))}
          {loading && <div className="al-bub tut"><span className="al-spin" style={{ width: 14, height: 14 }} /></div>}
        </div>
        <div className="al-row" style={{ marginTop: 14, flexWrap: "nowrap" }}>
          <input className="al-input" placeholder="Escribe en inglés…" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
          <button className="al-btn al-primary" onClick={send} disabled={loading || !input.trim()}>Enviar</button>
        </div>
        <div className="al-note" style={{ marginTop: 10 }}>
          Consejo: escribe tu respuesta, luego pulsa 🔊 en la respuesta del tutor y léela en voz alta imitando el ritmo.
        </div>
      </div>
    </div>
  );
}

function VerbsModule({ speech, rec, track }) {
  const keys = Object.keys(VERBS);
  const [sub, setSub] = useState(keys[0]);
  const data = VERBS[sub];
  const t = () => track("verbs");
  return (
    <div className="al-fade">
      <div className="al-tabs">
        {keys.map((k) => (
          <button key={k} className={"al-tab" + (sub === k ? " on" : "")} onClick={() => setSub(k)}>{VERBS[k].title}</button>
        ))}
      </div>
      <div className="al-card al-pad">
        <div className="al-eyebrow">{data.sub}</div>
        <div className="al-word" style={{ fontSize: 21, marginTop: 4 }}>{data.title}</div>
        <div className="al-tip" style={{ margin: "12px 0 18px" }}>{data.tip}</div>
        <div className="al-row">
          {data.items.map((it, i) => (
            <div key={i} className="al-slot" style={{ flex: "1 1 180px", minWidth: 150, textAlign: "left" }}>
              <div className="al-word" style={{ fontSize: sub === "dense" ? 17 : 20 }}>{it[0]}</div>
              {it[1] && <div className="al-ipa">{it[1]}</div>}
              <div className="al-note" style={{ marginTop: 4 }}>{it[2]}</div>
              <Practice pkey={"vb" + sub + i} text={it[0]} speech={speech} rec={rec} onPractice={t} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrepositionsModule({ speech, onAnswer }) {
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const item = PREPOSITIONS[idx];
  const answered = chosen !== null;
  const correct = answered && chosen === item.a;

  function pick(i) {
    if (answered) return;
    setChosen(i);
    const ok = i === item.a;
    if (ok) setScore((s) => s + 1);
    onAnswer(ok);
    speech.speak(item.full, "prep" + idx);
  }
  function next() {
    if (idx + 1 < PREPOSITIONS.length) { setIdx(idx + 1); setChosen(null); }
    else setDone(true);
  }
  function restart() { setIdx(0); setChosen(null); setScore(0); setDone(false); }

  if (done) {
    return (
      <div className="al-fade">
        <div className="al-card al-pad" style={{ textAlign: "center" }}>
          <div className="al-eyebrow">Resultado</div>
          <div style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 54, color: "var(--coral)", margin: "8px 0" }}>
            {score}/{PREPOSITIONS.length}
          </div>
          <p className="al-muted" style={{ fontSize: 14.5 }}>Las preposiciones se aprenden de a poco y con oído. Repite el set las veces que quieras.</p>
          <button className="al-btn al-primary" style={{ marginTop: 12 }} onClick={restart}>Volver a empezar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="al-fade">
      <div className="al-progress"><i style={{ width: Math.round((idx / PREPOSITIONS.length) * 100) + "%" }} /></div>
      <div className="al-card al-pad">
        <div className="al-row" style={{ justifyContent: "space-between" }}>
          <span className="al-eyebrow">{item.cat}</span>
          <span className="al-box">{idx + 1} / {PREPOSITIONS.length} · {score} ✓</span>
        </div>
        <div className="al-q" style={{ marginTop: 12 }}>
          {item.q.split("___").map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i === 0 && <span style={{ color: answered ? (correct ? "var(--teal)" : "var(--coral)") : "#C2C8D2", fontWeight: 700 }}>
                {answered ? item.opts[item.a] : "____"}
              </span>}
            </React.Fragment>
          ))}
        </div>
        <div className="al-row">
          {item.opts.map((o, i) => {
            let bg = "#F7F8FA", bd = "var(--line)", col = "var(--ink)";
            if (answered) {
              if (i === item.a) { bg = "#EAF6F3"; bd = "#8FD8CC"; col = "#0B7568"; }
              else if (i === chosen) { bg = "#FEF0F0"; bd = "#F2545B"; col = "var(--coral-d)"; }
            }
            return (
              <button key={i} disabled={answered} onClick={() => pick(i)}
                style={{ flex: "1 1 90px", minWidth: 80, padding: "13px 10px", borderRadius: 12, cursor: answered ? "default" : "pointer",
                  border: "1.5px solid " + bd, background: bg, color: col, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 16 }}>
                {o}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="al-fade" style={{ marginTop: 14 }}>
            <div className={correct ? "" : ""} style={{ fontWeight: 600, color: correct ? "var(--teal)" : "var(--coral-d)" }}>
              {correct ? "✓ ¡Correcto!" : "✗ Casi — la buena es «" + item.opts[item.a] + "»"}
            </div>
            <div className="al-note" style={{ marginTop: 4 }}>{item.exp}</div>
            <div className="al-row" style={{ marginTop: 10 }}>
              <button className="al-btn al-teal al-mini" onClick={() => speech.speak(item.full, "prep" + idx)}>
                {speech.speakingKey === "prep" + idx ? <Wave active color="#fff" /> : "🔊 Oír la frase"}
              </button>
              <button className="al-btn al-primary al-mini" onClick={next}>
                {idx + 1 < PREPOSITIONS.length ? "Siguiente →" : "Ver resultado"}
              </button>
            </div>
            <div className="al-note" style={{ marginTop: 8 }}>Fíjate: la preposición suena débil y pegada a la palabra siguiente.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsModule({ progress, onRetake, onReset }) {
  const p = progress;
  const totalPractice = p.practice.sounds + p.practice.endings + p.practice.rhythm + (p.practice.verbs || 0);
  const bars = [
    { label: "Sonidos", n: p.practice.sounds, c: "var(--coral)" },
    { label: "Terminaciones", n: p.practice.endings, c: "var(--teal)" },
    { label: "Ritmo", n: p.practice.rhythm, c: "var(--violet)" },
    { label: "Verbos", n: p.practice.verbs || 0, c: "var(--amber)" },
  ];
  const prepPct = p.prepTotal ? Math.round((p.prepCorrect / p.prepTotal) * 100) : null;
  const max = Math.max(1, ...bars.map((b) => b.n));
  return (
    <div className="al-fade">
      <div className="al-card al-pad">
        <div className="al-eyebrow">Tu progreso</div>
        <div className="al-statgrid" style={{ marginTop: 12 }}>
          <div className="al-stat"><b style={{ color: "var(--coral)" }}>{p.streak}</b><span className="al-note">🔥 racha (días)</span></div>
          <div className="al-stat"><b style={{ color: "var(--teal)" }}>{p.level}</b><span className="al-note">nivel actual</span></div>
          <div className="al-stat"><b>{p.vocabKnown.length}</b><span className="al-note">palabras que sabes</span></div>
          <div className="al-stat"><b>{p.convoTurns}</b><span className="al-note">turnos de charla</span></div>
          <div className="al-stat"><b style={{ color: "var(--violet)" }}>{prepPct === null ? "—" : prepPct + "%"}</b><span className="al-note">preposiciones ({p.prepCorrect}/{p.prepTotal})</span></div>
        </div>
        <hr className="al-hr" />
        <div className="al-eyebrow" style={{ marginBottom: 12 }}>Práctica de voz ({totalPractice})</div>
        {bars.map((b, i) => (
          <div key={i}>
            <div className="al-note" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{b.label}</span><span>{b.n}</span>
            </div>
            <div className="al-bar"><i style={{ width: Math.round((b.n / max) * 100) + "%", background: b.c }} /></div>
          </div>
        ))}
        <p className="al-note" style={{ marginTop: 4 }}>Empezaste el {p.createdAt}. Tu progreso se guarda automáticamente en este navegador.</p>
        <hr className="al-hr" />
        <div className="al-row">
          <button className="al-btn al-ghost al-mini" onClick={onRetake}>Rehacer test de ubicación</button>
          <button className="al-btn al-ghost al-mini" onClick={onReset} style={{ color: "var(--coral-d)" }}>Reiniciar progreso</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- APP --------------------------------- */
export default function App() {
  const [stage, setStage] = useState("loading"); // loading | welcome | placement | results | app
  const [correct, setCorrect] = useState(0);
  const [tab, setTab] = useState("sounds");
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  const speech = useSpeech();
  const rec = useRecorder();

  // Load saved progress once
  useEffect(() => {
    (async () => {
      const r = await storageGet("acentolab:progress");
      if (r && r.value) {
        try {
          const p = JSON.parse(r.value);
          const today = todayStr();
          if (p.lastActive !== today) {
            const d = daysBetween(p.lastActive, today);
            p.streak = d === 1 ? (p.streak || 1) + 1 : 1;
            p.lastActive = today;
          }
          const merged = { ...DEFAULT_PROGRESS, ...p };
          merged.practice = { ...DEFAULT_PROGRESS.practice, ...(p.practice || {}) };
          setProgress(merged);
          setLoaded(true);
          setStage(p.placementDone ? "app" : "welcome");
          return;
        } catch (e) {}
      }
      setLoaded(true);
      setStage("welcome");
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    if (loaded) storageSet("acentolab:progress", JSON.stringify(progress));
  }, [progress, loaded]);

  const track = useCallback((cat) => {
    setProgress((p) => ({ ...p, practice: { ...p.practice, [cat]: (p.practice[cat] || 0) + 1 } }));
  }, []);
  const addKnown = useCallback((word) => {
    setProgress((p) => (p.vocabKnown.includes(word) ? p : { ...p, vocabKnown: [...p.vocabKnown, word] }));
  }, []);
  const bumpConvo = useCallback(() => {
    setProgress((p) => ({ ...p, convoTurns: p.convoTurns + 1 }));
  }, []);
  const addPrep = useCallback((isCorrect) => {
    setProgress((p) => ({ ...p, prepTotal: p.prepTotal + 1, prepCorrect: p.prepCorrect + (isCorrect ? 1 : 0) }));
  }, []);
  const setLevel = (lv) => setProgress((p) => ({ ...p, level: lv }));

  const TABS = [
    { id: "sounds", label: "Sonidos" },
    { id: "endings", label: "Terminaciones" },
    { id: "rhythm", label: "Ritmo" },
    { id: "prep", label: "Preposiciones" },
    { id: "verbs", label: "Verbos" },
    { id: "vocab", label: "Vocabulario" },
    { id: "idioms", label: "Idioms" },
    { id: "chat", label: "Charla" },
    { id: "stats", label: "Progreso" },
  ];

  return (
    <div className="al-root">
      <style>{CSS}</style>
      <div className="al-wrap">
        {stage === "loading" && <LoadingCard msg="Cargando tu laboratorio…" />}
        {stage === "welcome" && <Welcome onStart={() => setStage("placement")} />}
        {stage === "placement" && (
          <Placement onDone={(c) => {
            setCorrect(c);
            setProgress((p) => ({ ...p, level: scoreToLevel(c).level, placementDone: true, lastActive: todayStr() }));
            setStage("results");
          }} />
        )}
        {stage === "results" && <Results correct={correct} onContinue={() => setStage("app")} />}

        {stage === "app" && (
          <>
            <div className="al-brand" style={{ justifyContent: "space-between", width: "100%" }}>
              <span className="al-logo" style={{ fontSize: 24 }}>Acento<span className="dot">·</span>Lab</span>
              <span className="al-chip">
                Nivel
                <select value={progress.level} onChange={(e) => setLevel(e.target.value)}
                  style={{ border: "none", background: "transparent", color: "#0B7568", fontWeight: 700, fontFamily: "var(--sans)", cursor: "pointer" }}>
                  {["A1", "A2", "B1", "B2", "C1"].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </span>
            </div>

            <div className="al-tabs">
              {TABS.map((t) => (
                <button key={t.id} className={"al-tab" + (tab === t.id ? " on" : "")} onClick={() => setTab(t.id)}>{t.label}</button>
              ))}
            </div>

            {!speech.supported && (
              <div className="al-tip" style={{ marginBottom: 14 }}>
                Tu navegador no tiene voz sintetizada, así que el audio modelo puede no sonar. Prueba en Chrome o Edge.
              </div>
            )}
            {rec.error === "denied" && (
              <div className="al-tip" style={{ marginBottom: 14 }}>
                No diste permiso de micrófono. Actívalo en el candado de la barra de direcciones para grabarte, o escucha y repite.
              </div>
            )}
            {rec.error === "unavailable" && (
              <div className="al-tip" style={{ marginBottom: 14 }}>
                Aquí no se puede usar el micrófono. Abre la app en pantalla completa o en un navegador; mientras, usa el audio modelo.
              </div>
            )}

            {tab === "sounds" && <SoundsModule speech={speech} rec={rec} track={track} />}
            {tab === "endings" && <EndingsModule speech={speech} rec={rec} track={track} />}
            {tab === "rhythm" && <RhythmModule speech={speech} rec={rec} track={track} />}
            {tab === "prep" && <PrepositionsModule speech={speech} onAnswer={addPrep} />}
            {tab === "verbs" && <VerbsModule speech={speech} rec={rec} track={track} />}
            {tab === "vocab" && <VocabModule level={progress.level} speech={speech} rec={rec} track={track} onKnown={addKnown} known={progress.vocabKnown} />}
            {tab === "idioms" && <IdiomsModule level={progress.level} speech={speech} rec={rec} />}
            {tab === "chat" && <ChatModule level={progress.level} speech={speech} onTurn={bumpConvo} />}
            {tab === "stats" && (
              <StatsModule
                progress={progress}
                onRetake={() => setStage("placement")}
                onReset={async () => {
                  await storageDel("acentolab:progress");
                  setProgress({ ...DEFAULT_PROGRESS, createdAt: todayStr(), lastActive: todayStr() });
                  setStage("welcome");
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
