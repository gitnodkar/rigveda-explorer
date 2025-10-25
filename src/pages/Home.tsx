import { Sparkles, BookOpen, Search, BarChart3, MessageSquare, ArrowRight, Flame, Sun, Wind } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Simplified */}
      <section className="relative py-16 px-4 text-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(var(--accent)) 0%, transparent 50%)',
          }}
        />
        
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Humanity's oldest sacred text, now accessible</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Journey Through <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">10,552 Sacred Verses</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Explore the Rigveda's profound wisdom through intelligent search, AI-powered insights, and beautiful visualizations. From ancient hymns to modern understanding.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Search className="h-5 w-5" />
                Start Exploring
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/ai">
              <Button size="lg" variant="outline" className="gap-2 shadow-sm hover:shadow-md transition-shadow">
                <MessageSquare className="h-5 w-5" />
                Ask AI Scholar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Three Ways to Explore
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/search" className="group">
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-primary">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Search className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Search & Filter</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Search 10,552 verses by deity, rishi, meter, mandala, or keywords. Discover specific hymns instantly.
                  </p>
                  <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    <span>Explore verses</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/visualize" className="group">
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-accent">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Visualize Insights</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Interactive charts revealing patterns across mandalas, deities, rishis, and historical references.
                  </p>
                  <div className="flex items-center text-accent font-medium text-sm group-hover:gap-2 transition-all">
                    <span>View analytics</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai" className="group">
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-secondary">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Ask AI Scholar</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Get intelligent answers about Vedic concepts, hymns, and philosophy with precise verse citations.
                  </p>
                  <div className="flex items-center text-secondary font-medium text-sm group-hover:gap-2 transition-all">
                    <span>Start conversation</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Hymns Preview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover Famous Hymns
            </h2>
            <p className="text-muted-foreground text-lg">
              From the Gayatri Mantra to the Purusha Sukta - explore sacred verses that have shaped civilizations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-900">
              <CardContent className="pt-6">
                <Flame className="h-10 w-10 text-orange-600 dark:text-orange-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gayatri Mantra</h3>
                <p className="text-sm text-muted-foreground mb-3">Mandala 3.62.10</p>
                <p className="text-sm leading-relaxed">
                  The most sacred mantra invoking the divine light of Savitar to illuminate the intellect.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
              <CardContent className="pt-6">
                <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Purusha Sukta</h3>
                <p className="text-sm text-muted-foreground mb-3">Mandala 10.90</p>
                <p className="text-sm leading-relaxed">
                  The cosmic hymn describing the universe's creation from the primordial being.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
              <CardContent className="pt-6">
                <Sun className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nasadiya Sukta</h3>
                <p className="text-sm text-muted-foreground mb-3">Mandala 10.129</p>
                <p className="text-sm leading-relaxed">
                  The profound creation hymn questioning existence itself before time began.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link to="/search">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Explore All Famous Mantras
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Redesigned */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-4">
                <Wind className="h-3 w-3" />
                <span>1500-1200 BCE</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">About the Rigveda</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Rigveda is the oldest known Vedic Sanskrit text and one of the world's oldest sacred scriptures. Composed over 3,000 years ago, it contains profound wisdom about the cosmos, deities, nature, and human existence.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This explorer features complete English translations by Ralph T.H. Griffith, making ancient Vedic knowledge accessible to modern seekers and scholars worldwide.
              </p>
            </div>
            
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <div className="font-semibold">10 Mandalas</div>
                    <div className="text-sm text-muted-foreground">Sacred books of wisdom</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🕉️</span>
                  </div>
                  <div>
                    <div className="font-semibold">1,028 Suktas</div>
                    <div className="text-sm text-muted-foreground">Hymns to various deities</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✨</span>
                  </div>
                  <div>
                    <div className="font-semibold">10,552 Richas</div>
                    <div className="text-sm text-muted-foreground">Individual verses of power</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
