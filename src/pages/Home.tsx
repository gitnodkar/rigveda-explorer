// home.tsx
import { useState, useEffect } from "react";
import { Sparkles, Search, BarChart3, MessageSquare, ArrowRight, BookOpen, Sun, Moon, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const facts = [
  {
    icon: Sun,
    title: "Oldest Vedic Text",
    description: "The Rigveda is the oldest of the four Vedas, composed around 3000 BCE or earlier in traditional views, forming the bedrock of Vedic literature with over 1,000 hymns praising deities like Indra and Agni.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: BookOpen,
    title: "10 Mandalas Structure",
    description: "Organized into 10 mandalas (books) containing 1,028 suktas (hymns) and about 10,552 richas (verses), with family books (2–7) being the oldest, arranged by ancient clan authors.",
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: Users,
    title: "Vedic Sanskrit Legacy",
    description: "Composed in archaic Vedic Sanskrit, an early Indo-Aryan language, it preserves Proto-Indo-European roots and shows ties to Iranian Avesta, with influences from Dravidian and Munda speakers.",
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: Clock,
    title: "Oral Transmission Mastery",
    description: "Preserved orally for millennia through precise techniques like padapāṭha, ensuring phonetic fidelity; oldest manuscripts date to the 11th century CE from Nepal.",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: Moon,
    title: "Philosophical Depths",
    description: "Blends polytheistic praise with profound inquiries into cosmology and existence, as in the Nasadiya Sukta, influencing Hindu philosophy, rituals, and ethics to this day.",
    color: "from-amber-500 to-orange-600"
  },
  {
    icon: Sparkles,
    title: "UNESCO Recognition",
    description: "Inscribed in UNESCO's Memory of the World Register in 2007 for its global cultural value, with manuscripts in Sharada and Devanagari scripts held in India and abroad.",
    color: "from-teal-500 to-cyan-600"
  }
];

const FactsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const startInterval = () => {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % facts.length);
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
  }, [isHovered]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl mx-auto max-w-4xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {facts.map((fact, index) => {
          const Icon = fact.icon;
          return (
            <div key={index} className="w-full flex-shrink-0 p-8 text-center bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-r ${fact.color} shadow-lg`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-playfair font-bold mb-4 text-slate-800 dark:text-slate-100">{fact.title}</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">{fact.description}</p>
            </div>
          );
        })}
      </div>
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {facts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-orange-500 scale-125' : 'bg-slate-300 dark:bg-slate-600 hover:bg-orange-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen font-inter">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-950/20" />
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-300 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-orange-200/50">
            <Sparkles className="h-4 w-4" />
            <span>Humanity's oldest sacred scripture, reimagined for today</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-sans font-family:sans-serif font-bold mb-6 leading-tight text-slate-800 dark:text-white">
            Unveil the <span className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent">Eternal Wisdom</span>
            <br />
            of 10,552 Verses
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-4xl mx-auto leading-relaxed font-light">
            Immerse in the Rigveda's timeless hymns through intuitive search, AI-guided insights, and dynamic visualizations—from ancient chants to profound revelations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/search">
              <Button size="lg" className="gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 font-medium text-lg px-8 py-6">
                <Search className="h-5 w-5" />
                Begin Your Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/ai">
              <Button size="lg" variant="outline" className="gap-3 border-2 border-slate-300 dark:border-slate-600 hover:border-orange-500 transition-all duration-300 font-medium text-lg px-8 py-6">
                <MessageSquare className="h-5 w-5" />
                Consult AI Scholar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-20 px-4 bg-gradient-to-b from-white/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-12 text-slate-800 dark:text-white tracking-tight">
            Pathways to Discovery
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/search" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-8 pb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-playfair font-semibold mb-4 text-slate-800 dark:text-white text-center">Intelligent Search</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-center">
                    Unearth verses by deity, sage, meter, or theme across the entire canon.
                  </p>
                  <div className="flex items-center justify-center text-orange-600 font-medium group-hover:gap-2 transition-all">
                    <span>Discover Now</span>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/visualize" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-8 pb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-playfair font-semibold mb-4 text-slate-800 dark:text-white text-center">Visual Revelations</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-center">
                    Interactive maps of mandalas, deities, and patterns in Vedic thought.
                  </p>
                  <div className="flex items-center justify-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                    <span>View Patterns</span>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai" className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="pt-8 pb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <MessageSquare className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-playfair font-semibold mb-4 text-slate-800 dark:text-white text-center">AI Dialogues</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-center">
                    Engage in enlightened conversations with cited Vedic wisdom.
                  </p>
                  <div className="flex items-center justify-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                    <span>Ask Away</span>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Facts Slider */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4 text-slate-800 dark:text-white">
              Timeless Facts of the Rigveda
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Swipe through curated insights from ancient lore to scholarly depths
            </p>
          </div>
          <FactsSlider />
          <div className="text-center mt-8">
            <Link to="/search">
              <Button variant="outline" className="gap-2 text-lg px-8 py-6 border-2 border-slate-300 dark:border-slate-600 hover:border-orange-500">
                <BookOpen className="h-5 w-5" />
                Dive Deeper
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-orange-200/50">
                <Clock className="h-4 w-4" />
                <span>c. 3000 BCE or Earlier</span>
              </div>
              <h2 className="text-4xl font-playfair font-bold mb-6 text-slate-800 dark:text-white">The Rigveda's Eternal Echo</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-light">
                As the dawn of Vedic wisdom, the Rigveda captures the cosmos, rituals, and human spirit in verses that transcend time. Its hymns, born in the cradle of Indo-Aryan culture, weave philosophy with poetry.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                Featuring Griffith's revered English translations, this explorer bridges antiquity and modernity for seekers, scholars, and the spiritually curious.
              </p>
            </div>
            
            <div className="order-1 lg:order-2">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-slate-800/80 dark:to-orange-900/20 backdrop-blur-sm">
                <CardContent className="pt-8 space-y-6 pb-8">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-700/50">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📜</span>
                    </div>
                    <div>
                      <div className="font-playfair font-bold text-xl text-slate-800 dark:text-white">10 Mandalas</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Books of divine order</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-700/50">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🙏</span>
                    </div>
                    <div>
                      <div className="font-playfair font-bold text-xl text-slate-800 dark:text-white">1,028 Suktas</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Hymns of invocation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-700/50">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">✨</span>
                    </div>
                    <div>
                      <div className="font-playfair font-bold text-xl text-slate-800 dark:text-white">10,552 Richas</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Verses of cosmic power</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;