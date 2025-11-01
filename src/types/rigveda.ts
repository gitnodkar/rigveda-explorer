export interface RigvedaVerse {
  mandala: string;
  sukta: string;
  verse: string;
  rishi: string;
  deity: string;
  meter: string;
  sanskrit: string;
  english_translation: string;
  transliteration: string;
}

export type SearchType = "Deity" | "Rishi/Clan" | "Meter" | "Mandala" | "Keyword/Verse Reference";
