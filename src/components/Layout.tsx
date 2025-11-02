// layout.tsx (updated)
import { Link, useLocation } from "react-router-dom";
import { Home, Search, BarChart3, MessageCircle, HelpCircle, Map, Sun, Moon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "../theme-context"; // Adjust path as needed

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/search", label: "Search & Explore", icon: Search },
    { path: "/visualize", label: "Visualize", icon: BarChart3 },
    { path: "/ai", label: "Ask AI Scholar", icon: MessageCircle },
    { path: "/places", label: "Places Map", icon: Map },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-950/20 font-inter">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-4 py-12 text-center">
          {/* Help Icon */}
          <TooltipProvider delayDuration={10}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center cursor-help hover:bg-white/30 transition-all duration-300 hover:scale-110">
                  <HelpCircle className="h-5 w-5" />
                </div>
              </TooltipTrigger>

              <TooltipContent side="bottom" align="start" className="max-w-[700px] p-4 bg-white text-gray-900 border-gray-200 shadow-xl z-[900]">
                <div className="space-y-3 text-sm leading-relaxed">
                  <div>
                    <strong className="text-[#FF6B35]">Quick Guide:</strong>
                  </div>
                  <div>• <strong>Search:</strong> Find verses based on Deity/Rishi/Meter/Mandala/Keywords</div>
                  <div>• <strong>Ask AI:</strong> Get answers with verse citations</div>
                  <div>• <strong>Listen in real-time:</strong> Audio playback for immersive chanting experience </div>
                  <div>• <strong>Sanskrit Diacritics:</strong> Vedic chantings use 4 tones – Udātta (उदात्त - middle tone), Anudātta (अनुदात्त - lower tone), Svarita (स्वरित - higher tone) and Dīrgha Svarita (दीर्घस्वरित - high tone extended). These are usually marked with intuitive svara marks – No mark for Udātta, an underline for Anudātta (अ॒), a small vertical line above the letter for Svarita (अ॑) and two vertical lines for Dīrgha svarita (आ᳚)</div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <strong className="text-[#FF6B35]">Sanskrit Terms:</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>• <strong>मण्डल (Mandala)</strong>: Book - Major division</div>
                    <div>• <strong>सूक्त (Sukta)</strong>: Hymn - Collection of verses</div>
                    <div>• <strong>ऋचा (Richa)</strong>: Verse - Individual verse</div>
                    <div>• <strong>देवता (Devata)</strong>: Deity - God/Goddess addressed</div>
                    <div>• <strong>ऋषि/कुल (Rishi/Kula)</strong>: Sage/Clan - Author or family</div>
                    <div>• <strong>छन्द (Chhanda)</strong>: Meter - Poetic rhythm pattern</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Dark Mode Toggle */}
          <TooltipProvider delayDuration={10}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300 hover:scale-110"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                Toggle {theme === 'light' ? 'dark' : 'light'} mode
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <h1 className="text-6xl md:text-7xl font-serif font-family:Times New Roman font-bold mb-4 drop-shadow-2xl tracking-tight">
            Rig Veda Explorer
          </h1>
          <p className="text-2xl opacity-90 font-inter font-light">
            10,552 Sacred Verses • 100% Translated • 6 Languages
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-[800] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-2 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 px-5 py-3 rounded-xl font-inter font-medium transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-[#ffbf80] to-[#ff7733] text-white shadow-md"
                      : "text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform ${isActive ? 'text-white' : 'group-hover:scale-110'}`} />
                  <span>{item.label}</span>
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-orange-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto text-center space-y-2">
            <p className="font-playfair text-lg font-semibold leading-relaxed">
              Rig Veda Explorer • AI Powered
            </p>
            <div className="space-y-1 text-sm text-slate-300">
              <p className="font-inter"><strong>Sources:</strong></p>
              <p className="font-inter">Sanskrit verses sourced from bhavykhatri/DharmicData repository on Github • English translations by Ralph T.H. Griffith</p>
            </div>
            <p className="font-inter text-sm text-slate-300 italic">
              Built with ❤️ in Bhārat for Vedic scholars and spiritual seekers, By Vedant Bamnodkar
            </p>
          </div>
          <div className="border-t border-slate-800 mt-4 pt-3 text-center text-xs text-slate-400">
            <p className="font-inter">🕉️ Glory to Sanatana Dharma!</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;