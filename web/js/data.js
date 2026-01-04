export const QUIZ_DATA = {
  mod1: {
    title: "Besaran & Satuan",
    questions: [
      { q: "Satuan panjang dalam SI adalah?", opts: ["meter", "cm", "foot", "inch"], a: 0 },
      { q: "Satuan massa SI adalah?", opts: ["gram", "kg", "ton", "ounce"], a: 1 }
    ]
  },
  mod2: {
    title: "Vektor",
    questions: [
      { q: "Vektor memiliki...", opts: ["nilai saja", "arah saja", "nilai dan arah", "tidak ada"], a: 2 },
      { q: "Penjumlahan vektor dilakukan dengan...", opts: ["aljabar biasa", "metode grafis", "metode numerik", "tidak bisa"], a: 1 }
    ]
  },
  mod3: {
    title: "Kinematika",
    questions: [
      { q: "Besaran yang berubah terhadap waktu adalah...", opts: ["jarak", "percepatan", "massa", "gaya"], a: 1 },
      { q: "Jika kecepatan konstan maka percepatan...", opts: ["nol", "positif", "negatif", "tak terhingga"], a: 0 }
    ]
  },
  mod4: {
    title: "Dinamika Partikel",
    questions: [
      { q: "Hukum Newton I berkaitan dengan...", opts: ["inertia", "gaya", "massa", "gerak melingkar"], a: 0 },
      { q: "F = ma adalah rumus dari...", opts: ["Newton", "Galileo", "Einstein", "Pascal"], a: 0 }
    ]
  },
  mod5: {
    title: "Usaha & Energi",
    questions: [
      { q: "Energi kinetik bergantung pada...", opts: ["kecepatan kuadrat", "jarak", "gaya", "waktu"], a: 0 },
      { q: "Satuan usaha dalam SI adalah...", opts: ["Joule", "Watt", "Newton", "Pascal"], a: 0 }
    ]
  },
  mod6: {
    title: "Momentum & Tumbukan",
    questions: [
      { q: "Momentum didefinisikan sebagai...", opts: ["massa × kecepatan", "gaya × waktu", "energi × waktu", "jarak × gaya"], a: 0 },
      { q: "Pada tumbukan lenting sempurna, energi kinetik...", opts: ["kekal", "hilang", "bertambah", "tak terdefinisi"], a: 0 }
    ]
  },
  mod7: {
    title: "Dinamika Rotasi",
    questions: [
      { q: "Momen inersia bergantung pada...", opts: ["massa & distribusi", "warna benda", "kecepatan", "gaya"], a: 0 },
      { q: "Torsi adalah analognya...", opts: ["gaya linear", "energi", "massa", "waktu"], a: 0 }
    ]
  }
};

export const MATERI_DATA = [
  { id: 'mod1', icon: '📦', title: 'Besaran & Satuan', desc: 'Dasar pengukuran fisika', video: 'https://youtu.be/1BgEUvpOUqo' },
  { id: 'mod2', icon: '🧭', title: 'Vektor', desc: 'Besaran dengan nilai dan arah', video: 'https://youtu.be/IDJUvIMdCWA' },
  { id: 'mod3', icon: '🚗', title: 'Kinematika', desc: 'Gerak tanpa meninjau penyebab', video: 'https://youtu.be/3J1E4vA-zPg' },
  { id: 'mod4', icon: '🍎', title: 'Dinamika Partikel', desc: 'Hukum Newton tentang gerak', video: 'https://youtu.be/Gq5SrlfEpGU' },
  { id: 'mod5', icon: '⚡', title: 'Usaha & Energi', desc: 'Kerja dan energi kinetik', video: 'https://youtu.be/x_JMeoj_RCw' },
  { id: 'mod6', icon: '💥', title: 'Momentum & Tumbukan', desc: 'Kekekalan momentum', video: 'https://youtu.be/A9sJYJ_byrg' },
  { id: 'mod7', icon: '⚙️', title: 'Dinamika Rotasi', desc: 'Gerak benda berputar', video: 'https://youtu.be/XiLtmjdDSKM' }
];
