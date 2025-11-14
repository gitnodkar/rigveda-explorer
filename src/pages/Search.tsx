import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Loader2, Volume2, Pause, Play, BookOpen, Sun, Moon, Sparkles, Clock, Users, Flame, Zap, Droplets, Leaf, Mountain, Crown, Anchor, Shield, Star, Heart, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRigvedaData } from "@/hooks/useRigvedaData";
import { RigvedaVerse, SearchType } from "@/types/rigveda";
import { chatWithGroq, GroqMessage } from "@/lib/groq";
import {
  getUniqueDeityOptions,
  getUniqueRishiOptions,
  getUniqueMeterOptions,
  getEnglishDeity,
  getEnglishRishi,
  getEnglishMeter,
  MANDALA_INFO,
  FAMOUS_MANTRAS,
  DEITY_MAPPINGS,
  RISHI_MAPPINGS,
  METER_MAPPINGS,
  removeDiacritics
} from "@/lib/helpers";

const Search = () => {
  const { data, loading, error } = useRigvedaData();
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<SearchType>("Keyword/Verse Reference");
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("All");
  const [maxResults, setMaxResults] = useState("1");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'verse' | 'hymn'>('verse');
  const [translationLang, setTranslationLang] = useState("None");
  const [translating, setTranslating] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [isSeeking, setIsSeeking] = useState<Record<string, boolean>>({});
  const [audioProgress, setAudioProgress] = useState<Record<string, {currentTime: number, duration: number | null}>>({});
  const [selectedMantra, setSelectedMantra] = useState<{ name: string; mantra: any } | null>(null); // For modal
  const [openMantra, setOpenMantra] = useState<string | null>(null); // Track open dialog for famous mantras
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const audioListeners = useRef<Record<string, {timeupdate: () => void, ended: () => void, loadedmetadata: () => void}>>({});
  const seekInputRefs = useRef<Record<string, HTMLInputElement>>({});

  // Icons and colors for slider
  const icons = [Flame, Zap, Droplets, Leaf, Sun, Moon, Mountain, Crown, Anchor, Shield, Star, Heart];
  const colors = [
    "from-amber-400 to-orange-600",    // Saffron-gold (Agni/fire)
    "from-indigo-600 to-purple-600",   // Royal-purple (Indra/thunder)
    "from-emerald-500 to-teal-600",    // Emerald-green (Soma/plant)
    "from-blue-500 to-cyan-600",       // Celestial-blue (Varuna/water)
    "from-yellow-400 to-amber-600",    // Solar-gold (Surya/sun)
    "from-violet-500 to-pink-600",     // Lunar-purple (Chandra/moon)
    "from-stone-500 to-gray-700",      // Earthy-gray (Prithvi/earth)
    "from-rose-500 to-red-600",        // Crimson-red (Rudra/storm)
    "from-green-600 to-forest-600",    // Forest-green (Vanaspatis/trees)
    "from-slate-600 to-zinc-700",      // Ancient-bronze (Yama/death)
    "from-sky-500 to-blue-600",        // Sky-blue (Vayu/wind)
    "from-fuchsia-500 to-violet-600"   // Mystic-fuchsia (general divine)
  ];

  // Mantras for slider
  const mantras = useMemo(() => {
    // Thematic icon mapping based on common FAMOUS_MANTRAS keys (adjust as needed)
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      "Gayatri Mantra": Sun,           // Solar wisdom
      "Agni Sukta": Flame,        // Fire god
      "Indra's Valor": Zap,            // Thunderbolt
      "Soma Hymn": Leaf,               // Moon plant
      "Nadi Sukta": Droplets,     // Ocean god
      "Maha Mrityunjaya Mantra": Shield,         // Storm protector
      "Purusha Sukta": Crown,          // Cosmic man
      "Nasadiya Sukta": Star,          // Creation mystery
      "Hiranyagarbha": Heart,          // Golden womb
      // Fallback to BookOpen for unlisted
      default: BookOpen
    };

    return Object.entries(FAMOUS_MANTRAS).map(([name, m], index) => {
      const Icon = iconMap[name] || iconMap.default || icons[index % icons.length];
      return {
        name,
        title: name,
        location: m.location,
        description: m.fun_fact || `${(m.meaning || '').substring(0, 100)}...`,
        icon: Icon,
        color: colors[index % colors.length],
        ...m
      };
    });
  }, [FAMOUS_MANTRAS]);

  const MantrasSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;

      const startInterval = () => {
        interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % mantras.length);
        }, 4000);
      };

      if (!isHovered) {
        startInterval();
      }

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [isHovered, mantras.length]);

    if (mantras.length === 0) return null;

    return (
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl mx-auto max-w-4xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {mantras.map((mantra) => {
            const Icon = mantra.icon;
            return (
              <Dialog key={mantra.name} open={openMantra === mantra.name} onOpenChange={(open) => setOpenMantra(open ? mantra.name : null)}>
                <DialogTrigger asChild>
                  <div className="w-full flex-shrink-0 p-8 text-center bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-r ${mantra.color} shadow-lg group`}>
                      <Icon className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">{mantra.title}</h3>
                    <div className="text-xs text-primary mb-4">📍 {mantra.location}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">{mantra.description}</p>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-full bg-gradient-to-r ${mantra.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      {mantra.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="text-sm font-semibold text-primary">📍 {mantra.location}</div>
                    {(() => {
                      const locationMatch = mantra.location.match(/^(\d+)\.(\d+)(?:\.(\d+))?$/);
                      if (locationMatch) {
                        const [, mandala, sukta, verseNum] = locationMatch;
                        const verses = data.filter((v: RigvedaVerse) =>
                          v.mandala === mandala && v.sukta === sukta && (!verseNum || v.verse === verseNum)
                        ).sort((a: RigvedaVerse, b: RigvedaVerse) => parseInt(a.verse) - parseInt(b.verse));
                        if (verses.length > 0) {
                          return (
                            <div className="overflow-x-auto pb-4">
                              <div className="flex gap-4 min-w-max">
                                {verses.map(verse => (
                                  <CompactVerseCard key={`${verse.mandala}.${verse.sukta}.${verse.verse}`} verse={verse} />
                                ))}
                              </div>
                            </div>
                          );
                        }
                      }
                      // Fallback for pre-defined single mantra content
                      return (
                        <>
                          <div className="bg-mantra-bg p-4 rounded-lg font-devanagari text-base border border-amber-200">
                            {mantra.sanskrit}
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-sm">
                            {mantra.meaning}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {mantra.fun_fact}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {mantras.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-amber-500 scale-125' : 'bg-slate-300 dark:bg-slate-600 hover:bg-amber-400'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Filter data based on search criteria
  const filteredData = useMemo(() => {
    if (!data.length) return [];

    let filtered = data;

    if (searchType === "Keyword/Verse Reference" && searchValue.trim()) {
      const query = searchValue.trim();

      // Check for verse reference (1.1.1)
      const verseMatch = query.match(/^(\d+)\.(\d+)\.(\d+)$/);
      if (verseMatch) {
        const [, m, s, v] = verseMatch;
        filtered = data.filter(row =>
          row.mandala === m && row.sukta === s && row.verse === v
        );
      }
      // Check for sukta reference (1.1)
      else if (query.match(/^(\d+)\.(\d+)$/)) {
        const [m, s] = query.split('.');
        filtered = data.filter(row =>
          row.mandala === m && row.sukta === s
        );
      }
      // Keyword search (UPDATED: Detect script and search only in relevant column, diacritic-independent)
      else {
        const normalizedQuery = removeDiacritics(query);
        const lowerNormalizedQuery = normalizedQuery.toLowerCase();

        // Detect if query contains Devanagari (Sanskrit script)
        const isDevanagari = /[\u0900-\u097F]/.test(query);

        if (isDevanagari) {
          // Search only in sanskrit column (diacritic-independent)
          filtered = data.filter(row => {
            const normalizedSanskrit = removeDiacritics(row.sanskrit || '');
            return normalizedSanskrit.includes(normalizedQuery);
          });
        } else {
          // Search only in englishtranslation column (case-insensitive, diacritic-independent)
          filtered = data.filter(row => {
            const normalizedTranslit = removeDiacritics(row.english_translation || '').toLowerCase();
            return normalizedTranslit.includes(lowerNormalizedQuery);
          });
        }
      }
    }
    else if (searchType === "Mandala" && filterValue !== "All") {
      filtered = data.filter(row => row.mandala === filterValue);
    }
    else if (searchType === "Deity" && filterValue !== "All") {
      // Find all Sanskrit variants for this English deity
      const sanskritVariants = Object.entries(DEITY_MAPPINGS)
        .filter(([, eng]) => eng === filterValue)
        .map(([san]) => san);
      filtered = data.filter(row =>
        sanskritVariants.some(variant => row.deity?.includes(variant))
      );
    }
    else if (searchType === "Rishi/Clan" && filterValue !== "All") {
      const sanskritVariants = Object.entries(RISHI_MAPPINGS)
        .filter(([, eng]) => eng === filterValue)
        .map(([san]) => san);
      filtered = data.filter(row =>
        sanskritVariants.some(variant => row.rishi?.includes(variant))
      );
    }
    else if (searchType === "Meter" && filterValue !== "All") {
      const sanskritVariants = Object.entries(METER_MAPPINGS)
        .filter(([, eng]) => eng === filterValue)
        .map(([san]) => san);
      filtered = data.filter(row =>
        sanskritVariants.some(variant => row.meter?.includes(variant))
      );
    }

    return filtered;
  }, [data, searchType, searchValue, filterValue]);

  // Group filtered data by sukta for hymn view
  const groupedSuktas = useMemo(() => {
    if (!filteredData.length) return [];

    const groups: Record<string, { key: string; mandala: string; sukta: string; verses: RigvedaVerse[] }> = {};
    filteredData.forEach((verse) => {
      const key = `${verse.mandala}.${verse.sukta}`;
      if (!groups[key]) {
        groups[key] = { key, mandala: verse.mandala, sukta: verse.sukta, verses: [] };
      }
      groups[key].verses.push(verse);
    });

    Object.values(groups).forEach((group) => {
      group.verses.sort((a, b) => parseInt(a.verse) - parseInt(b.verse));
    });

    return Object.values(groups).sort((a, b) => {
      if (a.mandala !== b.mandala) return parseInt(a.mandala) - parseInt(b.mandala);
      return parseInt(a.sukta) - parseInt(b.sukta);
    });
  }, [filteredData]);

  // Get unique values for dropdowns using mappings
  const uniqueDeities = useMemo(() => getUniqueDeityOptions(), []);
  const uniqueRishis = useMemo(() => getUniqueRishiOptions(), []);
  const uniqueMeters = useMemo(() => getUniqueMeterOptions(), []);

  // Pagination
  const resultsPerPage = parseInt(maxResults);
  const totalPages = Math.ceil(
    (viewMode === 'verse' ? filteredData.length : groupedSuktas.length) / resultsPerPage
  );
  const startIdx = (currentPage - 1) * resultsPerPage;
  const paginatedResults = filteredData.slice(startIdx, startIdx + resultsPerPage);
  const paginatedSuktas = groupedSuktas.slice(startIdx, startIdx + resultsPerPage);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const handleSeek = useCallback((suktaKey: string, value: number) => {
    const audio = audioRefs.current[suktaKey];
    if (audio) {
      audio.currentTime = value;
      const inputEl = seekInputRefs.current[suktaKey];
      if (inputEl) {
        inputEl.value = value.toString();
        const percent = audio.duration ? (value / audio.duration) * 100 : 0;
        inputEl.style.background = `linear-gradient(to right, #3b82f6 ${percent}%, #e5e7eb ${percent}%)`;
      }
    }
  }, []);

  const handleAudioToggle = useCallback((mandala: string, sukta: string) => {
    const suktaKey = `${mandala}.${sukta}`;
    let audio = audioRefs.current[suktaKey];

    if (isPlaying[suktaKey]) {
      // Pause
      if (audio) {
        audio.pause();
        const listeners = audioListeners.current[suktaKey];
        if (listeners) {
          audio.removeEventListener("loadedmetadata", listeners.loadedmetadata);
          audio.removeEventListener("timeupdate", listeners.timeupdate);
          audio.removeEventListener("ended", listeners.ended);
          delete audioListeners.current[suktaKey];
        }
      }
      setIsPlaying((prev) => ({ ...prev, [suktaKey]: false }));
      return;
    }

    // Pause all other audios
    Object.entries(audioRefs.current).forEach(([key, a]) => {
      if (key !== suktaKey && a) {
        const otherListeners = audioListeners.current[key];
        if (otherListeners) {
          a.removeEventListener("loadedmetadata", otherListeners.loadedmetadata);
          a.removeEventListener("timeupdate", otherListeners.timeupdate);
          a.removeEventListener("ended", otherListeners.ended);
          delete audioListeners.current[key];
        }
        a.pause();
        setIsPlaying((prev) => ({ ...prev, [key]: false }));
      }
    });

    // Play current
    if (!audio) {
      audio = new Audio(`/audio/${mandala}/${sukta}.mp3`);
      audioRefs.current[suktaKey] = audio;
      setAudioProgress((prev) => ({ ...prev, [suktaKey]: { currentTime: 0, duration: null } }));
    }

    // Remove existing listeners if any
    if (audioListeners.current[suktaKey]) {
      const existing = audioListeners.current[suktaKey];
      audio.removeEventListener("loadedmetadata", existing.loadedmetadata);
      audio.removeEventListener("timeupdate", existing.timeupdate);
      audio.removeEventListener("ended", existing.ended);
      delete audioListeners.current[suktaKey];
    }

    const handleTimeUpdate = () => {
      if (audio) {
        if (!isSeeking[suktaKey]) {
          setAudioProgress((prev) => ({
            ...prev,
            [suktaKey]: {
              currentTime: audio.currentTime,
              duration: audio.duration || (prev[suktaKey]?.duration || null),
            },
          }));
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (audio) {
        setAudioProgress((prev) => ({
          ...prev,
          [suktaKey]: {
            currentTime: audio.currentTime,
            duration: audio.duration,
          },
        }));
      }
    };

    const handleEnded = () => {
      setIsPlaying((prev) => ({ ...prev, [suktaKey]: false }));
      const listeners = audioListeners.current[suktaKey];
      if (listeners && audio) {
        audio.removeEventListener("timeupdate", listeners.timeupdate);
        audio.removeEventListener("ended", listeners.ended);
        audio.removeEventListener("loadedmetadata", listeners.loadedmetadata);
        delete audioListeners.current[suktaKey];
      }
      setAudioProgress((prev) => ({
        ...prev,
        [suktaKey]: {
          currentTime: 0,
          duration: audio?.duration || null,
        },
      }));
    };

    audioListeners.current[suktaKey] = {
      timeupdate: handleTimeUpdate,
      loadedmetadata: handleLoadedMetadata,
      ended: handleEnded,
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    audio.currentTime = 0;
    audio
      .play()
      .catch((err) => {
        toast({
          title: "Playback Failed",
          description: err.message,
          variant: "destructive",
        });
      });
    setIsPlaying((prev) => ({ ...prev, [suktaKey]: true }));
  }, [isPlaying, isSeeking, toast]);

  const handleTranslate = async (verse: RigvedaVerse) => {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!groqKey) {
      toast({
        title: "API Key Missing",
        description: "Please add VITE_GROQ_API_KEY to your .env file",
        variant: "destructive"
      });
      return;
    }

    const langMap: Record<string, string> = {
      "Hindi (हिंदी)": "Hindi",
      "Marathi (मराठी)": "Marathi",
      "Tamil (தமிழ்)": "Tamil",
      "Telugu (తెలుగు)": "Telugu",
      "Bengali (বাংলা)": "Bengali",
    };

    const targetLang = langMap[translationLang];
    if (!targetLang) return;

    const verseKey = `${verse.mandala}.${verse.sukta}.${verse.verse}-${targetLang}`;

    // Check if already translated
    if (translations[verseKey]) {
      return;
    }

    setTranslating(verseKey);

    try {
      const prompt = `You are an expert literary translator specializing in English to ${targetLang} translation of sacred Vedic texts.

Your task: Translate this English translation of a Rigveda verse into beautiful, natural ${targetLang}.

CRITICAL INSTRUCTIONS:
1. Translate the ENGLISH text below into ${targetLang}
2. Maintain the poetic and devotional, respected tone. We are referring to Gods in here.
3. Use natural ${targetLang} grammar and sentence structure
4. Write in proper ${targetLang} script (Devanagari for Hindi/Marathi, Tamil/Telugu/Bengali scripts)
5. DO NOT transliterate Sanskrit - translate the English meaning
6. Keep the literary quality of the original English
7. Provide ONLY the ${targetLang} translation - no explanations

English text to translate (from Griffith's translation):
${verse.english_translation}

Context:
- This is verse ${verse.mandala}.${verse.sukta}.${verse.verse} from the Rigveda
- Deity: ${getEnglishDeity(verse.deity)}
- Rishi: ${getEnglishRishi(verse.rishi)}

Now provide a natural, literary ${targetLang} translation:`;

      const messages: GroqMessage[] = [
        { role: 'user', content: prompt }
      ];

      const translation = await chatWithGroq(groqKey, messages, 'llama-3.3-70b-versatile');

      setTranslations(prev => ({
        ...prev,
        [verseKey]: translation
      }));

    } catch (error) {
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "Failed to translate",
        variant: "destructive"
      });
    } finally {
      setTranslating(null);
    }
  };

  // Render a compact verse card for carousel or dialog
  const CompactVerseCard = ({ verse }: { verse: RigvedaVerse }) => {
    const suktaKey = `${verse.mandala}.${verse.sukta}`;
    const progress = audioProgress[suktaKey];
    const duration = progress?.duration;
    const currentTime = progress?.currentTime || 0;
    const percent = duration ? (currentTime / duration) * 100 : 0;

    return (
      <Card className="flex-shrink-0 w-[280px] h-[400px] overflow-hidden">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="font-semibold mb-2 text-primary font-devanagari text-sm">
            ऋचा {verse.verse}
          </div>
          <div className="sanskrit-text bg-verse-bg rounded-lg p-2 mb-2 font-devanagari leading-relaxed flex-1 overflow-y-auto">
            <div className="text-lg">{verse.sanskrit}</div>
            {verse.transliteration && (
              <div className="text-xs font-mono text-muted-foreground mt-1">
                {verse.transliteration}
              </div>
            )}
          </div>
          <div className="text-xs mb-2 text-muted-foreground">
            {getEnglishDeity(verse.deity)} | {getEnglishRishi(verse.rishi)} | {getEnglishMeter(verse.meter)}
          </div>
          {/* Simplified audio */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAudioToggle(verse.mandala, verse.sukta);
            }}
            className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20 self-end"
          >
            {isPlaying[suktaKey] ? <Pause className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Render translation section
  const renderTranslation = (verse: RigvedaVerse) => {
    if (translationLang === "None") return null;

    const langMap: Record<string, string> = {
      "Hindi (हिंदी)": "Hindi",
      "Marathi (मराठी)": "Marathi",
      "Tamil (தமிழ்)": "Tamil",
      "Telugu (తెలుగు)": "Telugu",
      "Bengali (বাংলা)": "Bengali",
    };

    if (translationLang === "English (Griffith)") {
      return (
        <div className="translation-text bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-4 border-blue-400">
          <div className="font-semibold mb-2">English Translation (Griffith):</div>
          {verse.english_translation}
        </div>
      );
    }

    if (translationLang === "English (Wilson)") {
      return (
        <div className="translation-text bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-4 border-blue-400">
          <div className="font-semibold mb-2">English Translation (Wilson):</div>
          {verse.english_translation_wilson || "Translation not available."}
        </div>
      );
    }

    const targetLang = langMap[translationLang];
    if (!targetLang) return null;
    const vKey = `${verse.mandala}.${verse.sukta}.${verse.verse}-${targetLang}`;

    return translations[vKey] ? (
      <div className="translation-text bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border-l-4 border-green-400">
        <div className="font-semibold mb-2">{translationLang} Translation:</div>
        {translations[vKey]}
      </div>
    ) : (
      <Button
        onClick={() => handleTranslate(verse)}
        disabled={translating === vKey}
        className="w-full"
      >
        {translating === vKey ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Translating to {translationLang}...
          </>
        ) : (
          <>🌐 Translate to {translationLang}</>
        )}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="container py-8 max-w-7xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-7xl">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Error loading data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Search & Explore</h1>
        <p className="text-lg text-muted-foreground">
          Search through 10,552 verses across all 10 Mandalas
        </p>
      </div>

      {/* Search Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-[1fr_2.25fr_0.5fr_1fr] gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search By</label>
              <Select value={searchType} onValueChange={(val) => {
                setSearchType(val as SearchType);
                setCurrentPage(1);
                setFilterValue("All");
                setSearchValue("");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Keyword/Verse Reference">Keyword/Verse Reference</SelectItem>
                  <SelectItem value="Deity">Deity</SelectItem>
                  <SelectItem value="Rishi/Clan">Rishi/Clan</SelectItem>
                  <SelectItem value="Meter">Meter</SelectItem>
                  <SelectItem value="Mandala">Mandala</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {searchType === "Keyword/Verse Reference" ? "Search Term" : `Select ${searchType}`}
              </label>
              {searchType === "Keyword/Verse Reference" ? (
                <Input
                  placeholder="e.g., Agni, 1.1.1, fire"
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              ) : searchType === "Mandala" ? (
                <Select value={filterValue} onValueChange={handleFilterChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {[1,2,3,4,5,6,7,8,9,10].map(m => (
                      <SelectItem key={m} value={String(m)}>Mandala {m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : searchType === "Deity" ? (
                <Select value={filterValue} onValueChange={handleFilterChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {uniqueDeities.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : searchType === "Rishi/Clan" ? (
                <Select value={filterValue} onValueChange={handleFilterChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {uniqueRishis.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={filterValue} onValueChange={handleFilterChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {uniqueMeters.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Max Results</label>
              <Select value={maxResults} onValueChange={(val) => {
                setMaxResults(val);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Translation Language</label>
              <Select value={translationLang} onValueChange={setTranslationLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="English (Griffith)">English (Griffith)</SelectItem>
                  <SelectItem value="English (Wilson)">English (Wilson)</SelectItem>
                  <SelectItem value="Hindi (हिंदी)">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="Marathi (मराठी)">Marathi (मराठी)</SelectItem>
                  <SelectItem value="Tamil (தமிழ்)">Tamil (தமிழ்)</SelectItem>
                  <SelectItem value="Telugu (తెలుగు)">Telugu (తెలుగు)</SelectItem>
                  <SelectItem value="Bengali (বাংলা)">Bengali (বাংলা)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">View Mode</label>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'verse' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('verse');
                  setCurrentPage(1);
                }}
              >
                Verse
              </Button>
              <Button
                variant={viewMode === 'hymn' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('hymn');
                  setCurrentPage(1);
                }}
              >
                Hymn
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mandala Info */}
      {searchType === "Mandala" && filterValue !== "All" && MANDALA_INFO[parseInt(filterValue)] && (
        <Card className="mb-6 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📖</span>
              <p className="text-sm leading-relaxed">{MANDALA_INFO[parseInt(filterValue)]}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          📖 {viewMode === 'verse'
            ? `${filteredData.length} verses found`
            : `${groupedSuktas.length} hymns found (${filteredData.length} verses)`
          } {viewMode === 'verse' && `(Showing ${paginatedResults.length})`}
        </h2>
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Jump to page"
                className="w-32 h-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = parseInt((e.target as HTMLInputElement).value);
                    if (value >= 1 && value <= totalPages) {
                      setCurrentPage(value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Results Content */}
      {viewMode === 'verse' ? (
        paginatedResults.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No verses found. Try different search criteria.</p>
          </Card>
        ) : (
          paginatedResults.map((verse) => {
            const suktaKey = `${verse.mandala}.${verse.sukta}`;
            const progress = audioProgress[suktaKey];
            const duration = progress?.duration;
            const currentTime = progress?.currentTime || 0;
            const percent = duration ? (currentTime / duration) * 100 : 0;
            return (
              <Card key={`${verse.mandala}.${verse.sukta}.${verse.verse}`} className="verse-card mb-6">
                <CardContent className="pt-6">
                  {/* Reference */}
                  <div className="font-semibold mb-4 text-primary font-devanagari">
                    मण्डल {verse.mandala} • सूक्त {verse.sukta} • ऋचा {verse.verse}
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Crown className="h-4 w-4" />
                        देवता:
                      </span>{" "}
                      <span className="font-devanagari">{verse.deity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        ऋषि/कुल:
                      </span>{" "}
                      <span className="font-devanagari">{verse.rishi}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Ruler className="h-4 w-4" />
                        छन्द:
                      </span>{" "}
                      <span className="font-devanagari">{verse.meter}</span>
                    </div>
                  </div>

                  {/* Sanskrit Text with Transliteration and Audio Controls */}
                  <div className="sanskrit-text bg-verse-bg rounded-lg p-4 mb-4 font-devanagari leading-relaxed relative">
                    <div className="text-xl md:text-2xl mb-2">
                        {verse.sanskrit}
                    </div>
                    {verse.transliteration && (
                        <div className="text-md font-mono text-muted-foreground">
                            {verse.transliteration}
                        </div>
                    )}
                    {/* Audio Controls - positioned at bottom right */}
                    <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAudioToggle(verse.mandala, verse.sukta)}
                        className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20"
                        title={`Listen to Sukta ${verse.mandala}.${verse.sukta} audio`}
                      >
                        {isPlaying[suktaKey] ? (
                          <Pause className="h-4 w-4 text-red-500" />
                        ) : (
                          <Volume2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                      {isPlaying[suktaKey] && duration && !isNaN(duration) && (
                        <input
                          ref={(el) => seekInputRefs.current[suktaKey] = el}
                          type="range"
                          min="0"
                          max={duration}
                          value={currentTime}
                          onMouseDown={() => setIsSeeking((prev) => ({ ...prev, [suktaKey]: true }))}
                          onTouchStart={() => setIsSeeking((prev) => ({ ...prev, [suktaKey]: true }))}
                          onChange={(e) => handleSeek(suktaKey, parseFloat(e.target.value))}
                          onMouseUp={() => {
                            setIsSeeking((prev) => ({ ...prev, [suktaKey]: false }));
                            const audio = audioRefs.current[suktaKey];
                            if (audio) {
                              setAudioProgress((prev) => ({
                                ...prev,
                                [suktaKey]: {
                                  currentTime: audio.currentTime,
                                  duration: audio.duration || prev[suktaKey]?.duration || null,
                                },
                              }));
                            }
                          }}
                          onTouchEnd={() => {
                            setIsSeeking((prev) => ({ ...prev, [suktaKey]: false }));
                            const audio = audioRefs.current[suktaKey];
                            if (audio) {
                              setAudioProgress((prev) => ({
                                ...prev,
                                [suktaKey]: {
                                  currentTime: audio.currentTime,
                                  duration: audio.duration || prev[suktaKey]?.duration || null,
                                },
                              }));
                            }
                          }}
                          className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 ${percent}%, #e5e7eb ${percent}%)`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Translation Section */}
                  {renderTranslation(verse)}
                </CardContent>
              </Card>
            );
          })
        )
      ) : (
        paginatedSuktas.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hymns found. Try different search criteria.</p>
          </Card>
        ) : (
          <Accordion type="multiple" collapsible className="w-full">
            {paginatedSuktas.map((s) => {
              const suktaKey = s.key;
              const progress = audioProgress[suktaKey];
              const duration = progress?.duration;
              const currentTime = progress?.currentTime || 0;
              const percent = duration ? (currentTime / duration) * 100 : 0;
              const firstVerse = s.verses[0]; // Assume uniform metadata
              return (
                <AccordionItem key={s.key} value={s.key}>
                  <AccordionTrigger className="hover:no-underline pr-0">
                    <div className="flex w-full justify-between items-center p-0">
                      <span className="font-semibold text-primary font-devanagari">
                        {s.mandala}.{s.sukta}
                      </span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-sm text-muted-foreground">({s.verses.length} verses)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAudioToggle(s.mandala, s.sukta);
                          }}
                          className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20"
                          title={`Listen to Sukta ${s.mandala}.${s.sukta} audio`}
                        >
                          {isPlaying[suktaKey] ? (
                            <Pause className="h-4 w-4 text-red-500" />
                          ) : (
                            <Volume2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                        {isPlaying[suktaKey] && duration && !isNaN(duration) && (
                          <input
                            ref={(el) => seekInputRefs.current[suktaKey] = el}
                            type="range"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setIsSeeking((prev) => ({ ...prev, [suktaKey]: true }));
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              setIsSeeking((prev) => ({ ...prev, [suktaKey]: true }));
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSeek(suktaKey, parseFloat(e.target.value));
                            }}
                            onMouseUp={(e) => {
                              e.stopPropagation();
                              setIsSeeking((prev) => ({ ...prev, [suktaKey]: false }));
                              const audio = audioRefs.current[suktaKey];
                              if (audio) {
                                setAudioProgress((prev) => ({
                                  ...prev,
                                  [suktaKey]: {
                                    currentTime: audio.currentTime,
                                    duration: audio.duration || prev[suktaKey]?.duration || null,
                                  },
                                }));
                              }
                            }}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              setIsSeeking((prev) => ({ ...prev, [suktaKey]: false }));
                              const audio = audioRefs.current[suktaKey];
                              if (audio) {
                                setAudioProgress((prev) => ({
                                  ...prev,
                                  [suktaKey]: {
                                    currentTime: audio.currentTime,
                                    duration: audio.duration || prev[suktaKey]?.duration || null,
                                  },
                                }));
                              }
                            }}
                            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 ${percent}%, #e5e7eb ${percent}%)`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {/* Sukta-level Metadata (shown once at top) */}
                    {firstVerse && (
                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm p-3 bg-muted/20 rounded">
                        <div>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Crown className="h-4 w-4" />
                            देवता:
                          </span>{" "}
                          <span className="font-devanagari">{firstVerse.deity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            ऋषि/कुल:
                          </span>{" "}
                          <span className="font-devanagari">{firstVerse.rishi}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Ruler className="h-4 w-4" />
                            छन्द:
                          </span>{" "}
                          <span className="font-devanagari">{firstVerse.meter}</span>
                        </div>
                      </div>
                    )}
                    {s.verses.map((verse) => {
                      return (
                        <Card key={`${verse.mandala}.${verse.sukta}.${verse.verse}`} className="mb-4">
                          <CardContent className="pt-4">
                            {/* Reference */}
                            <div className="font-semibold mb-3 text-sm text-primary font-devanagari">
                              ऋचा {verse.verse}
                            </div>

                            {/* Sanskrit Text with Transliteration (increased font) */}
                            <div className="sanskrit-text bg-verse-bg rounded-lg p-3 mb-3 font-devanagari leading-relaxed">
                              <div className="text-xl mb-1">
                                  {verse.sanskrit}
                              </div>
                              {verse.transliteration && (
                                  <div className="text-sm font-mono text-muted-foreground">
                                      {verse.transliteration}
                                  </div>
                              )}
                            </div>

                            {/* Translation Section */}
                            {renderTranslation(verse)}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )
      )}

      {/* Featured Mantras Slider */}
      <div className="mt-12 mb-8">
        <div className="border-t border-border mb-8" />
        <h2 className="text-3xl font-bold mb-3"> Famous Mantras </h2>
        <p className="text-muted-foreground mb-6">Discover famous mantras - click to explore</p>
        <MantrasSlider />
      </div>

      {/* Help Text */}
      <div className="border-t border-border mt-12 mb-8" />
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Search Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use verse reference format like "1.1.1" (Mandala.Sukta.Verse) for specific verses</li>
            <li>• Use sukta reference like "1.1" to see all verses in that hymn</li>
            <li>• Search by deity names like "Agni", "Indra", "Surya" to find related verses</li>
            <li>• Try keywords like "fire", "creation", "water" to discover thematic verses</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Search;