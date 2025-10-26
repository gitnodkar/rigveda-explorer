import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
  const [translationLang, setTranslationLang] = useState("English (Griffith)");
  const [translating, setTranslating] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});

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
      // Keyword search
      else {
        const lowerQuery = query.toLowerCase();
        filtered = data.filter(row =>
          row.english_translation?.toLowerCase().includes(lowerQuery) ||
          row.sanskrit?.includes(query) ||
          row.deity?.toLowerCase().includes(lowerQuery) ||
          row.rishi?.toLowerCase().includes(lowerQuery)
        );
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

  // Get unique values for dropdowns using mappings
  const uniqueDeities = useMemo(() => getUniqueDeityOptions(), []);
  const uniqueRishis = useMemo(() => getUniqueRishiOptions(), []);
  const uniqueMeters = useMemo(() => getUniqueMeterOptions(), []);

  // Pagination
  const resultsPerPage = parseInt(maxResults);
  const totalPages = Math.ceil(filteredData.length / resultsPerPage);
  const startIdx = (currentPage - 1) * resultsPerPage;
  const paginatedResults = filteredData.slice(startIdx, startIdx + resultsPerPage);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const handleTranslate = async (verse: RigvedaVerse, index: number) => {
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
      "Telugu (తెలుగు)": "Telugu"
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
4. Write in proper ${targetLang} script (Devanagari for Hindi/Marathi, Tamil/Telugu scripts)
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
          <div className="grid md:grid-cols-4 gap-4">
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
                  <SelectItem value="English (Griffith)">English (Griffith)</SelectItem>
                  <SelectItem value="Hindi (हिंदी)">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="Marathi (मराठी)">Marathi (मराठी)</SelectItem>
                  <SelectItem value="Tamil (தமிழ்)">Tamil (தமிழ்)</SelectItem>
                  <SelectItem value="Telugu (తెలుగు)">Telugu (తెలుగు)</SelectItem>
                </SelectContent>
              </Select>
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
          📖 {filteredData.length} verses found (Showing {paginatedResults.length})
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

      {/* Verse Cards */}
      {paginatedResults.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No verses found. Try different search criteria.</p>
        </Card>
      ) : (
        paginatedResults.map((verse, idx) => (
          <Card key={`${startIdx + idx}-${verse.mandala || 'x'}.${verse.sukta || 'x'}.${verse.verse || 'x'}`} className="verse-card mb-6">
            <CardContent className="pt-6">
              {/* Reference */}
              <div className="font-semibold mb-4 text-primary font-devanagari">
                मण्डल {verse.mandala} • सूक्त {verse.sukta} • ऋचा {verse.verse}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">🙏 देवता:</span>{" "}
                  <span className="font-devanagari">{verse.deity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">👤 ऋषि/कुल:</span>{" "}
                  <span className="font-devanagari">{verse.rishi}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">📏 छन्द:</span>{" "}
                  <span className="font-devanagari">{verse.meter}</span>
                </div>
              </div>

              {/* Sanskrit Text */}
              <div className="sanskrit-text bg-verse-bg rounded-lg p-4 mb-4 font-devanagari text-lg leading-relaxed">
                {verse.sanskrit}
              </div>

              {/* English Translation */}
              {translationLang === "English (Griffith)" ? (
                <div className="translation-text bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="font-semibold mb-2">English Translation (Griffith):</div>
                  {verse.english_translation}
                </div>
              ) : (
                <>
                  <div className="translation-text bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-4 border-blue-400 mb-3">
                    <div className="font-semibold mb-2">English Translation (Griffith):</div>
                    {verse.english_translation}
                  </div>

                  {(() => {
                    const langMap: Record<string, string> = {
                      "Hindi (हिंदी)": "Hindi",
                      "Marathi (मराठी)": "Marathi",
                      "Tamil (தமிழ்)": "Tamil",
                      "Telugu (తెలుగు)": "Telugu"
                    };
                    const targetLang = langMap[translationLang];
                    const verseKey = `${verse.mandala}.${verse.sukta}.${verse.verse}-${targetLang}`;

                    return translations[verseKey] ? (
                      <div className="translation-text bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border-l-4 border-green-400">
                        <div className="font-semibold mb-2">{translationLang} Translation:</div>
                        {translations[verseKey]}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleTranslate(verse, startIdx + idx)}
                        disabled={translating === verseKey}
                        className="w-full"
                      >
                        {translating === verseKey ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Translating to {translationLang}...
                          </>
                        ) : (
                          <>🌐 Translate to {translationLang}</>
                        )}
                      </Button>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Famous Mantras Section */}
      <div className="mt-12 mb-8">
        <div className="border-t border-border mb-8" />
        <h2 className="text-3xl font-bold mb-3">📚 Famous Mantras from Rigveda</h2>
        <p className="text-muted-foreground mb-6">Discover the origins of mantras used in daily worship</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(FAMOUS_MANTRAS).map(([name, mantra]) => (
            <Card key={name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🕉️ {name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm font-semibold text-primary">📍 {mantra.location}</div>
                <div className="text-sm text-muted-foreground">
                  🙏 <strong>Deity:</strong> {mantra.deity} | 👤 <strong>Rishi:</strong> {mantra.rishi}
                </div>
                <div className="bg-mantra-bg p-4 rounded-lg font-devanagari text-base border border-amber-200">
                  {mantra.sanskrit}
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg text-sm">
                  {mantra.meaning}
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="fun-fact" className="border-none">
                    <AccordionTrigger className="text-sm font-semibold py-2">
                      💡 Did You Know?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pt-2">
                      {mantra.fun_fact}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="border-t border-border mt-12 mb-8" />
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">💡 Search Tips</h3>
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
