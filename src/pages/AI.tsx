import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { chatWithGroqStream, GroqMessage } from "@/lib/groq";
import { useRigvedaData } from "@/hooks/useRigvedaData";
import { useToast } from "@/hooks/use-toast";
import OmImage from "/public/om.png"; // Replace with the path to your custom PNG

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AI = () => {
  const { data } = useRigvedaData();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesContainer = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';

  const scrollToBottom = () => {
    if (messagesContainer.current) {
      messagesContainer.current.scrollTo({
        top: messagesContainer.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (autoScroll && !loading) {
      scrollToBottom();
    }
  }, [messages, autoScroll, loading]);

  const searchRigvedaVerses = (query: string): string => {
    if (!data.length) return "Data not loaded yet.";

    const lowerQuery = query.toLowerCase().trim();

    // Detect greetings or casual chit-chat to avoid irrelevant verse matches
    const greetings = ['hi', 'hello', 'hey', 'namaste', 'greetings', 'sup', 'yo', 'what\'s up', 'howdy'];
    const isGreeting = greetings.some(g => lowerQuery.startsWith(g)) || lowerQuery.length < 3;

    if (isGreeting) {
      return "No verses found matching the query.";
    }

    // Check for verse reference (1.1.1)
    const verseMatch = query.match(/(\d+)\.(\d+)\.(\d+)/);
    if (verseMatch) {
      const [, m, s, v] = verseMatch;
      const verse = data.find(row =>
        parseInt(String(row.mandala)) === parseInt(m) &&
        parseInt(String(row.sukta)) === parseInt(s) &&
        parseInt(String(row.verse)) === parseInt(v)
      );
      if (verse) {
        return `Verse ${m}.${s}.${v}:\nSanskrit: ${verse.sanskrit}\nTransliteration: ${verse.transliteration || 'N/A'}\nEnglish Translation: ${verse.english_translation}\nDeity: ${verse.deity || 'N/A'}\nRishi: ${verse.rishi || 'N/A'}`;
      }
    }

    // Check for sukta reference (10.90)
    const suktaMatch = query.match(/(\d+)\.(\d+)/);
    if (suktaMatch) {
      const [, m, s] = suktaMatch;
      const verses = data.filter(row =>
        parseInt(String(row.mandala)) === parseInt(m) &&
        parseInt(String(row.sukta)) === parseInt(s)
      );
      if (verses.length > 0) {
        return verses.slice(0, 3).map(v =>
          `Verse ${v.mandala}.${v.sukta}.${v.verse}:\nSanskrit: ${v.sanskrit}\nTransliteration: ${v.transliteration || 'N/A'}\nEnglish Translation: ${v.english_translation}\nDeity: ${v.deity || 'N/A'}\nRishi: ${v.rishi || 'N/A'}`
        ).join('\n\n');
      }
    }

    // Rigveda-specific keyword search (more targeted to avoid noise)
    // Only match if query contains potential Rigveda terms (deities, concepts) or is substantive
    const rigvedaKeywords = ['agni', 'indra', 'soma', 'varuna', 'rudra', 'vishnu', 'gayatri', 'purusha', 'nasadiya', 'mrityunjaya', 'mantra', 'sukta', 'rishi', 'deity', 'mandala', 'verse', 'sanskrit', 'transliteration', 'translation'];
    const hasRigvedaTerm = rigvedaKeywords.some(keyword => lowerQuery.includes(keyword));

    if (!hasRigvedaTerm) {
      return "No verses found matching the query.";
    }

    const results = data.filter(row =>
      row.english_translation?.toLowerCase().includes(lowerQuery) ||
      row.sanskrit?.toLowerCase().includes(lowerQuery) ||
      row.deity?.toLowerCase().includes(lowerQuery) ||
      row.rishi?.toLowerCase().includes(lowerQuery) ||
      (row.transliteration && row.transliteration.toLowerCase().includes(lowerQuery))
    ).slice(0, 3);

    if (results.length > 0) {
      return results.map(v =>
        `Verse ${v.mandala}.${v.sukta}.${v.verse}:\nSanskrit: ${v.sanskrit}\nTransliteration: ${v.transliteration || 'N/A'}\nEnglish Translation: ${v.english_translation}\nDeity: ${v.deity || 'N/A'}\nRishi: ${v.rishi || 'N/A'}`
      ).join('\n\n');
    }

    return "No verses found matching the query.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please configure VITE_GROQ_API_KEY in your environment variables.",
        variant: "destructive"
      });
      return;
    }

    const userMessage = input.trim();
    setInput("");

    // Compute searchQuery, potentially using previous user message for follow-ups
    let searchQuery = userMessage;
    const verseRegex = /(\d+)\.(\d+)\.(\d+)/;
    const verseKeywords = ['sanskrit', 'transliteration', 'translation', 'translit', 'verse'];
    const isVerseRequest = !verseRegex.test(userMessage) && verseKeywords.some(k => userMessage.toLowerCase().includes(k.toLowerCase()));
    if (isVerseRequest) {
      // Find last user message with verse ref
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user' && verseRegex.test(messages[i].content)) {
          searchQuery = messages[i].content;
          break;
        }
      }
    }

    const verseContext = searchRigvedaVerses(searchQuery);
    const hasVerses = verseContext !== "No verses found matching the query." && verseContext !== "Data not loaded yet.";

    // Build full history up to previous messages
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    if (autoScroll) {
      scrollToBottom();
    }
    setLoading(true);

    try {
      const userContent = hasVerses
        ? `${userMessage}\n\n[VERSE DATA]\n${verseContext}\n[END VERSE DATA]`
        : userMessage;

      const groqMessages: GroqMessage[] = [
        {
          role: 'system',
          content: `You are an expert scholar on the Rigveda, the oldest sacred text of Hinduism.

You have access to a database of 10,552 verses across 10 Mandalas.

When answering:
1. If [VERSE DATA] ... [END VERSE DATA] is provided in the user message, use EXACTLY the Sanskrit, Transliteration, English Translation, Deity, and Rishi from within it for verse details. Do NOT generate, alter, recall, or use your own knowledge of the verses; stick strictly to the provided data. Quote the exact texts and attribute them as from the database.
2. If the user explicitly asks for verses, transliterations, or translations (e.g., "give me the Sanskrit of...", "transliterate...", "translate verse..."), prioritize providing the full details from the [VERSE DATA]: Sanskrit text, transliteration (if available), English translation, deity, and rishi.
3. Cite specific verse references in Mandala.Sukta.Verse format (e.g., 1.1.1)
4. Provide comprehensive answers with context and significance, but always base verse details on the provided [VERSE DATA].
5. For general greetings or chit-chat, respond briefly and welcomingly (1-2 sentences max), then ask how you can assist with the Rigveda. Do not mention specific verses or hymns unless the user asks.
6. Keep answers concise and scholarly. For rishi and deity in Devanagari, present them as is.

The database contains all famous hymns including:
- Gayatri Mantra (3.62.10)
- Purusha Sukta (10.90)
- Nasadiya Sukta/Creation Hymn (10.129)
- Maha Mrityunjaya Mantra (7.59.12)`
        },
        ...history,
        {
          role: 'user',
          content: userContent
        }
      ];

      // Add empty assistant message that will be updated as chunks arrive
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let fullResponse = '';
      await chatWithGroqStream(
        apiKey,
        groqMessages,
        (chunk) => {
          fullResponse += chunk;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: fullResponse };
            return updated;
          });
          // No scrolling during streaming chunks
        },
        'llama-3.3-70b-versatile'
      );
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Check your API key.",
        variant: "destructive"
      });
      // Remove the user message and empty assistant placeholder if there was an error
      setMessages(prev => {
        if (prev.length >= 2 && prev[prev.length - 2].role === 'user' && prev[prev.length - 1].role === 'assistant') {
          return prev.slice(0, -2);
        }
        return prev.slice(0, -1); // Fallback: just remove the last (user) if assistant not added
      });
      setInput(userMessage);
    } finally {
      setLoading(false);
      if (autoScroll) {
        scrollToBottom();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setAutoScroll(scrollTop + clientHeight >= scrollHeight - 5);
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-3">AI Scholar</h1>
        <p className="text-lg text-muted-foreground">
          Get answers about the Rigveda with verse citations
        </p>
      </div>

      <Card className="mb-4 min-h-[500px] flex flex-col">
        <CardContent
          ref={messagesContainer}
          className="flex-1 p-6 overflow-y-auto"
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <img src={OmImage} alt="Om Symbol" className="h-24 w-24 mb-4" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">Welcome to AI Scholar</h2>
                <p className="text-muted-foreground mb-6">Ask me anything about the Rigveda</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl">
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => setInput("Explain the role of Agni in Rigveda like I'm five")}
                >
                  <div>
                    <div className="font-semibold mb-1">💬 Simple Explanation</div>
                    <div className="text-xs text-muted-foreground">Explain the role of Agni in Rigveda like I'm five</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => setInput("What is the Gayatri Mantra and its significance?")}
                >
                  <div>
                    <div className="font-semibold mb-1">🕉️ Gayatri Mantra</div>
                    <div className="text-xs text-muted-foreground">What is the Gayatri Mantra and its significance?</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => setInput("Summarize the Purusha Sukta in 3 bullet points")}
                >
                  <div>
                    <div className="font-semibold mb-1">📜 Purusha Sukta</div>
                    <div className="text-xs text-muted-foreground">Summarize the Purusha Sukta in 3 bullet points</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => setInput("Explain verse 1.1.1")}
                >
                  <div>
                    <div className="font-semibold mb-1">📖 First Verse</div>
                    <div className="text-xs text-muted-foreground">Explain verse 1.1.1</div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="font-semibold mb-2">
                      {msg.role === 'user' ? 'You' : 'AI Scholar'}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          placeholder="Ask me anything about the Rigveda..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      {messages.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessages([])}
          >
            Clear Chat History
          </Button>
        </div>
      )}
    </div>
  );
};

export default AI;