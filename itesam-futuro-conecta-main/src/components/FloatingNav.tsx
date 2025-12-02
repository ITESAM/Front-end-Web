import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingNav = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Quem Somos", path: "/quem-somos" },
    { name: "Galeria", path: "/galeria" },
    { name: "Notícias", path: "/noticias" },
    { name: "Contato", path: "/contato" },
    { name: "Seja Voluntário", path: "/voluntariado" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Show floating nav when scrolled down more than 200px
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 animate-fade-in"
        aria-label="Menu de navegação"
      >
        {isMenuOpen ? <X size={20} /> : <MoreVertical size={20} />}
      </Button>

      {/* Floating Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu */}
          <nav className="fixed right-20 top-1/2 -translate-y-1/2 z-50 bg-primary rounded-lg shadow-xl p-2 min-w-[200px] animate-scale-in">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default FloatingNav;
