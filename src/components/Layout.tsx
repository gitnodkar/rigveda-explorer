import { Link, useLocation } from "react-router-dom";
import { Home, Search, BarChart3, MessageCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/search", label: "Search & Explore", icon: Search },
    { path: "/visualize", label: "Visualize", icon: BarChart3 },
    { path: "/ai", label: "Ask AI Scholar", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-[#F7931E] to-[#FF6B35] text-white shadow-lg relative">
        <div className="container mx-auto px-4 py-8 text-center">
          {/* Help Icon */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-help hover:bg-white/30 transition-all hover:scale-110">
                  <HelpCircle className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-[700px] p-4 bg-white text-gray-900 border-gray-200 shadow-xl">
                <div className="space-y-3 text-sm leading-relaxed">
                  <div>
                    <strong className="text-[#FF6B35]">Quick Guide:</strong>
                  </div>
                  <div>• <strong>Search:</strong> Find verses based on Deity/Rishi/Meter/Mandala/Keywords</div>
                  <div>• <strong>Ask AI:</strong> Get answers with verse citations</div>
                  <div>• <strong>Diacritics:</strong> Vedic chantings use 4 tones – Udātta (उदात्त - middle tone), Anudātta (अनुदात्त - lower tone), Svarita (स्वरित - higher tone) and Dīrgha Svarita (दीर्घस्वरित - high tone extended). These are usually marked with intuitive svara marks – No mark for Udātta, an underline for Anudātta (अ॒), a small vertical line above the letter for Svarita (अ॑) and two vertical lines for Dīrgha svarita (आ᳚)</div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <strong className="text-[#FF6B35]">Sanskrit Terms:</strong>
                  </div>
                  <div>• <strong>मण्डल (Mandala)</strong>: Book/Circle - Major division</div>
                  <div>• <strong>सूक्त (Sukta)</strong>: Hymn - Collection of verses</div>
                  <div>• <strong>ऋचा (Richa)</strong>: Verse - Individual stanza</div>
                  <div>• <strong>देवता (Devata)</strong>: Deity - God/Goddess addressed</div>
                  <div>• <strong>ऋषि/कुल (Rishi/Kula)</strong>: Sage/Clan - Author or family</div>
                  <div>• <strong>छन्द (Chhanda)</strong>: Meter - Poetic rhythm pattern</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <h1 className="text-5xl font-bold mb-3 drop-shadow-md">🕉️ Rig Veda Explorer</h1>
          <p className="text-xl opacity-95">10,552 Sacred Verses • 100% Translated • 5 Languages</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-1 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#F7931E] to-[#FF6B35] text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            🕉️ Rig Veda Explorer • AI Powered • Sanskrit verses sourced from bhavykhatri/DharmicData repository on Github • English translations by Ralph T.H. Griffith
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with ❤️ in Bhārat for Vedic scholars and spiritual seekers, By Vedant Bamnodkar
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
