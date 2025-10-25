/**
 * Helper functions and mappings for Rigveda Explorer
 */

// Mandala information
export const MANDALA_INFO: Record<number, string> = {
  1: "The first and the longest mandala contains 191 hymns and opens with hymn 1.1 addressed to Agni; most hymns praise Agni and Indra and the book includes philosophical/riddle verses.",
  2: "The family book of Gṛtsamāda, this mandala consists 43 hymns devoted to Agni, Indra, and the Maruts. It primarily praises Agni and Indra for their divine powers.",
  3: "The family book of Viśvāmitra, it contains 62 hymns to Agni, Indra, and other deities. It is notable for the Gayatri Mantra found in Sukta 62 (3.62.10).",
  4: "The family book of Vāmadeva, it features 58 hymns dedicated to Agni, Indra, and the Ashvins. It reflects the devotion of the Gautama lineage and includes praises to the twin deities.",
  5: "The family book of Atri, it contains 87 hymns addressed to Agni, Indra, and the Vishvedevas. It represents the collective prayers of Atri and his descendants to multiple deities.",
  6: "The family book of Bharadvāja, it contains 75 hymns centered again on Agni and Indra. The verses emphasize their roles as divine forces of light and strength.",
  7: "The family book of Vasiṣṭha, it contains 104 hymns venerating Agni, Indra, and Varuna. It contains the Maha Mrityunjaya Mantra (7.59.12), one of the most sacred Vedic hymns.",
  8: "The family book of Kaṇva and Āṅgirasa, it features 103 hymns to Indra, Agni, and the Ashvins. It celebrates Indra's heroic deeds and the divine blessings of multiple gods.",
  9: "Exclusively dedicated to Soma Pavamana, this mandala's 114 hymns praise the purification and divine essence of Soma. It is the only Rigvedic mandala devoted entirely to a single deity.",
  10: "The final and most philosophical mandala, containing 191 hymns, composed by various Rishis from multiple clans, addresses many deities. It includes profound hymns like the Purusha Sukta (10.90) and Nasadiya Sukta (10.129). Mandala 1 and 10 are the youngest mandalas of the Rigveda."
};

// Deity mappings (Sanskrit to English)
export const DEITY_MAPPINGS: Record<string, string> = {
  "इन्द्रः": "Indra",
  "इन्द्र:": "Indra",
  "पवमान: सोम:": "Soma Pavamana",
  "सोम:": "Soma Pavamana",
  "अग्निः": "Agni",
  "अग्नि:": "Agni",
  "अग्नि ::": "Agni",
  "अग्नी": "Agni",
  "अश्विनौ": "Ashvins",
  "विश्वे देवाः": "Vishvedevas",
  "विश्वेदेवाः": "Vishvedevas",
  "विश्वे देवा:": "Vishvedevas",
  "मरुतः": "Maruts",
  "मरुत:": "Maruts",
  "मित्रावरुणौ": "Mitra-Varuna",
  "मित्रा-वरुणौ": "Mitra-Varuna",
  "इन्द्राग्नी": "Indra-Agni",
  "इन्द्रावरुणौ": "Indra-Varuna",
  "उषाः": "Ushas",
  "उषस:": "Ushas",
  "ऋभवः": "Ribhus",
  "सविता": "Savitar",
  "पूषा": "Pushan",
  "वायुः": "Vayu",
  "वायु:": "Vayu",
  "सूर्यः": "Surya",
  "रुद्रः": "Rudra (Shiva)",
  "अश्वः": "Ashva"
};

// Rishi mappings (Sanskrit to English)
export const RISHI_MAPPINGS: Record<string, string> = {
  "वामदेवो गौतम": "Vamadeva Gautama",
  "बार्हस्पत्यो भरद्वाज": "Bharadvaja Bruhaspatya",
  "मैत्रावरुणिर्वसिष्ठ": "Vasishtha Maitravaruna",
  " मैत्रावरुणिर्वसिष्ठ": "Vasishtha Maitravaruna",
  "गाथिनो विश्वामित्रः": "Vishvamitra Gaathina",
  "गृत्समद": "Gritsamada Angirasa Bhargava",
  "दीर्घतमा औचथ्य": "Dirghatamas Auchathya",
  "गोतमो राहूगण": "Gotama Rahugana",
  "कुत्स आङ्गिरस": "Kutsa Angirasa",
  "कक्षीवान् दैर्घतमस": "Kakshivaan Dairghatamasa",
  "श्यावाश्व आत्रेय": "Shyavashva Atreya",
  "कविर्भार्गव": "Kavi Bhargava",
  "त्रिशोक काण्व": "Trishok Kanva",
  "प्रजापतिर्वैश्वामित्र": "Prajapati Vaishvamitra",
  "मेघातिथि": "Medhatithi Kanva",
  "मेधातिथि": "Medhatithi Kanva",
  "मेध्यातिथि": "Medhatithi Kanva",
  "सावित्री सूर्या ऋषिका": "Surya Savitri Rishika",
  "काश्यपोऽसितो देवलो वा": "Kashyapa Asita Devala",
  "वत्स": "Vatsa Kanva",
  "त्रित आप्त्य": "Trita Aaptya",
  "अगस्त्यो मैत्रावरुणि": "Agastya Maitravaruna",
  "विश्वमना वैयश्व": "Vishvamana Vaiyashva",
  "पराशर शाक्त्य": "Parashar Shaaktya",
  "मधुच्छन्दा वैश्वामित्र": "Madhucchhanda Vaishvamitra"
};

// Meter mappings (Sanskrit to English)
export const METER_MAPPINGS: Record<string, string> = {
  "त्रिष्टुप्": "Trishtubh",
  "गायत्री": "Gayatri",
  "जगती": "Jagati",
  "अनुष्टुप्": "Anushtubh",
  "उष्णिक्": "Ushnik",
  "प्रगाथ:= ( विषमा बृहती, समा सतोबृहती )": "Pragatha",
  "द्विपदा विराट्": "Dvipada Virat",
  "पंक्तिः": "Pankti",
  "महापंक्ति:": "Mahapankti",
  "अत्यष्टिः": "Atyashti",
  "बृहती": "Bruhati",
  "महाबृहती": "Mahabruhati"
};

// Famous mantras
export const FAMOUS_MANTRAS = {
  "Gayatri Mantra": {
    location: "Mandala 3, Sukta 62, Verse 10",
    mandala: 3,
    sukta: 62,
    verse: 10,
    sanskrit: "तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥",
    meaning: "We meditate on the glory of the Creator who has created the Universe; who is worthy of worship; who is the embodiment of knowledge and light; who is the remover of all sin and ignorance. May He enlighten our intellect.",
    fun_fact: "The Gayatri Mantra is one of the most sacred mantras in Hinduism. The prefix 'Om Bhur Bhuvah Svah' (ॐ भूर्भुवः स्वः) was added later from the Yajurveda to invoke the three realms - Earth, Atmosphere, and Heaven.",
    deity: "Savitr (Sun God)",
    rishi: "Vishvamitra"
  },
  "Purusha Sukta": {
    location: "Mandala 10, Sukta 90, Verses 1-16",
    mandala: 10,
    sukta: 90,
    verse: 1,
    sanskrit: "सहस्रशीर्षा पुरुषः सहस्राक्षः सहस्रपात्। स भूमिं विश्वतो वृत्वा अत्यतिष्ठद्दशाङ्गुलम्॥",
    meaning: "The Purusha (Cosmic Being) has a thousand heads, a thousand eyes, and a thousand feet. He pervades the universe and extends beyond it by ten fingers' breadth.",
    fun_fact: "The Purusha Sukta describes the cosmic being from whose sacrifice the universe was created. It's recited during many Hindu rituals and ceremonies.",
    deity: "Purusha (Cosmic Being)",
    rishi: "Narayana"
  },
  "Maha Mrityunjaya Mantra": {
    location: "Mandala 7, Sukta 59, Verse 12",
    mandala: 7,
    sukta: 59,
    verse: 12,
    sanskrit: "त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥",
    meaning: "We worship the three-eyed one (Lord Shiva) who is fragrant and nourishes all beings. May He liberate us from death for the sake of immortality, just as the ripe cucumber is severed from its bondage to the vine.",
    fun_fact: "This Maha Mrityunjaya Mantra is chanted for healing, protection, and liberation. It's one of the most powerful mantras in Hinduism, dedicated to Lord Shiva.",
    deity: "Rudra (Shiva)",
    rishi: "Vashishtha"
  },
  "Nasadiya Sukta": {
    location: "Mandala 10, Sukta 129, Verses 1-7",
    mandala: 10,
    sukta: 129,
    verse: 1,
    sanskrit: "नासदासीन्नो सदासीत्तदानीं नासीद्रजो नो व्योमा परो यत्। किमावरीवः कुह कस्य शर्मन्नम्भः किमासीद्गहनं गभीरम्॥",
    meaning: "Then even nothingness was not, nor existence. There was no air then, nor the heavens beyond it. What covered it? Where was it? In whose keeping?",
    fun_fact: "The Nasadiya Sukta (Hymn of Creation) is one of the most profound philosophical texts in the Rigveda, questioning the very nature of creation and existence.",
    deity: "Unknown/Cosmic Mystery",
    rishi: "Prajapati Parameshthin"
  },
  "Agni Sukta": {
    location: "Mandala 1, Sukta 1, Verses 1-9",
    mandala: 1,
    sukta: 1,
    verse: 1,
    sanskrit: "अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम्। होतारं रत्नधातमम्॥",
    meaning: "I praise Agni, the chosen priest, the divine minister of sacrifice, the invoker, the greatest bestower of treasures.",
    fun_fact: "This is the very first verse of the Rigveda! Agni (fire) is invoked first as he is the messenger between humans and gods, carrying offerings to the divine realm.",
    deity: "Agni (Fire God)",
    rishi: "Madhuchhanda Vaishvamitra"
  },
  "Nadi Sukta": {
    location: "Mandala 10, Sukta 75, Verses 1-9",
    mandala: 10,
    sukta: 75,
    verse: 1,
    sanskrit: "इमं मे गङ्गे यमुने सरस्वति शुतुद्रि स्तोमं सचता परुष्ण्या। असिक्न्या मरुद्वृधे वितस्तयार्जीकीये शृणुह्या सुषोमया॥",
    meaning: "Listen to this hymn, O Ganga, Yamuna, Sarasvati, Shutudri, and Parushni! O Asikni, Marudvridha, Vitasta, Arjikiya, and Sushoma!",
    fun_fact: "The Nadi Sukta is a beautiful hymn dedicated to the sacred rivers of ancient India. It mentions ten major rivers by name, showing the reverence for water bodies in Vedic culture.",
    deity: "Rivers (Nadi Devatas)",
    rishi: "Sindhukshit Praiyamedha"
  }
};

// Rivers mentioned in Rigveda
export const RIVERS: Record<string, string[]> = {
  "Sarasvati": ["सरस्वत", "Sarasvatî"],
  "Sindhu (Indus)": ["सिन्ध"],
  "Ganga": ["गङ्गा", "Gangâ"],
  "Yamuna": ["यमुना", "Yamunâ"],
  "Kubha (Kabul)": ["Kubhâ"],
  "Gomati (Gomal)": ["गोमती", "Gomatî"],
  "Vitasta (Jhelum)": ["वितस्ता", "Vitastâ"],
  "Parushni (Ravi)": ["परुष्णी", "Parushṇî"],
  "Asikni (Chenab)": ["असिक्नी", "Asiknî"],
  "Vipash (Beas)": ["विपाश", "Vipâṣ"],
  "Shutudri (Sutlej)": ["Ṣutudrî"],
  "Marudvridha": ["Marudvr̥idhâ"],
  "Krumu (Kurram)": ["Krumu"]
};

// Tribes mentioned in Rigveda
export const TRIBES: Record<string, string[]> = {
  "Purus": ["Pûru"],
  "Turvasas": ["Turvaṣa"],
  "Yadus": ["Yadu"],
  "Krivis": ["Krivi"],
  "Druhyus": ["Druhyu"],
  "Dasyus": ["Dasyu"],
  "Anus": ["Anus"],
  "Bharatas": ["Bharatas"],
  "Alinas": ["Alinas"],
  "Pakthas": ["Paktha"]
};

// Helper functions
export function getEnglishDeity(sanskrit: string): string {
  const result = DEITY_MAPPINGS[sanskrit];
  if (result) return result;
  return sanskrit.length > 20 ? sanskrit.substring(0, 20) : sanskrit;
}

export function getEnglishRishi(sanskrit: string): string {
  const result = RISHI_MAPPINGS[sanskrit];
  if (result) return result;
  return sanskrit.length > 20 ? sanskrit.substring(0, 20) : sanskrit;
}

export function getEnglishMeter(sanskrit: string): string {
  const result = METER_MAPPINGS[sanskrit];
  if (result) return result;
  return sanskrit.length > 20 ? sanskrit.substring(0, 20) : sanskrit;
}

export function removeDiacritics(text: string): string {
  if (!text) return "";
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
}

// Get unique options for dropdowns
export function getUniqueDeityOptions(): string[] {
  const uniqueValues = Array.from(new Set(Object.values(DEITY_MAPPINGS)));
  return ["All", ...uniqueValues.sort()];
}

export function getUniqueRishiOptions(): string[] {
  const uniqueValues = Array.from(new Set(Object.values(RISHI_MAPPINGS)));
  return ["All", ...uniqueValues.sort()];
}

export function getUniqueMeterOptions(): string[] {
  const uniqueValues = Array.from(new Set(Object.values(METER_MAPPINGS)));
  return ["All", ...uniqueValues.sort()];
}
