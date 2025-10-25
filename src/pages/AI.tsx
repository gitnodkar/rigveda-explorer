import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { chatWithGroq, GroqMessage } from "@/lib/groq";
import { useRigvedaData } from "@/hooks/useRigvedaData";
import { useToast } from "@/hooks/use-toast";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchRigvedaVerses = (query: string): string => {
    if (!data.length) return "Data not loaded yet.";

    // Check for verse reference (1.1.1)
    const verseMatch = query.match(/(\d+)\.(\d+)\.(\d+)/);
    if (verseMatch) {
      const [, m, s, v] = verseMatch;
      const verse = data.find(row => 
        row.mandala === m && row.sukta === s && row.verse === v
      );
      if (verse) {
        return `Verse ${m}.${s}.${v}:\nSanskrit: ${verse.sanskrit}\nEnglish: ${verse.english_translation}\nDeity: ${verse.deity}\nRishi: ${verse.rishi}`;
      }
    }

    // Check for sukta reference (10.90)
    const suktaMatch = query.match(/(\d+)\.(\d+)/);
    if (suktaMatch) {
      const [, m, s] = suktaMatch;
      const verses = data.filter(row => row.mandala === m && row.sukta === s);
      if (verses.length > 0) {
        return verses.slice(0, 3).map(v => 
          `${v.mandala}.${v.sukta}.${v.verse}: ${v.sanskrit}; ${v.english_translation}`
        ).join('\n\n');
      }
    }

    // Keyword search
    const lowerQuery = query.toLowerCase();
    const results = data.filter(row =>
      row.english_translation?.toLowerCase().includes(lowerQuery) ||
      row.sanskrit?.includes(query) ||
      row.deity?.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);

    if (results.length > 0) {
      return results.map(v => 
        `${v.mandala}.${v.sukta}.${v.verse}: ${v.sanskrit}; ${v.english_translation}`
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
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Search verses related to the query
      const verseContext = searchRigvedaVerses(userMessage);
      const hasVerses = verseContext !== "No verses found matching the query." && verseContext !== "Data not loaded yet.";

      const groqMessages: GroqMessage[] = [
        {
          role: 'system',
          content: `You are an expert scholar on the Rigveda, the oldest sacred text of Hinduism.

You have access to a database of 10,552 verses across 10 Mandalas.

When answering:
1. Use the provided verse context when available
2. Cite specific verse references in Mandala.Sukta.Verse format (e.g., 1.1.1)
3. Provide comprehensive answers with context and significance
4. For general greetings or questions without verse references, respond naturally and offer to help
5. Keep answers concise and scholarly

The database contains all famous hymns including:
- Gayatri Mantra (3.62.10)
- Purusha Sukta (10.90)
- Nasadiya Sukta/Creation Hymn (10.129)
- Maha Mrityunjaya Mantra (7.59.12)`
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        {
          role: 'user',
          content: hasVerses ? `${userMessage}\n\nRelevant verses from the database:\n${verseContext}` : userMessage
        }
      ];

      const response = await chatWithGroq(apiKey, groqMessages, 'llama-3.1-8b-instant');
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Check your API key.",
        variant: "destructive"
      });
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-3">💬 Ask AI Scholar</h1>
        <p className="text-lg text-muted-foreground">
          Get answers about the Rigveda with verse citations
        </p>
      </div>

      <Card className="mb-4 min-h-[500px] flex flex-col">
        <CardContent className="flex-1 p-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="text-6xl mb-4">🕉️</div>
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
              <div ref={messagesEndRef} />
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
