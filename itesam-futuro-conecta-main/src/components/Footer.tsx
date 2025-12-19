import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { TikTokIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-primary/10 via-background to-background border-t border-border">
      <div className="container mx-auto px-4 py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 items-center rounded-3xl bg-primary text-primary-foreground p-8 lg:p-12 shadow-[0_30px_80px_-40px_rgba(24,64,149,0.6)]">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-primary-foreground/70">
              Rede solidária
            </span>
            <h2 className="text-2xl lg:text-3xl font-semibold">Acolha o futuro com a gente</h2>
            <p className="text-primary-foreground/80">
              Faça parte das iniciativas que ampliam o acesso à saúde, educação e tecnologia na Amazônia. Sua participação transforma histórias.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
            <Link
              to="/voluntariado"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white/15 px-6 text-sm font-semibold uppercase tracking-[0.2em] transition hover:bg-white/25"
            >
              Seja voluntário
            </Link>
            <Link
              to="/contato"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white text-primary px-6 text-sm font-semibold uppercase tracking-[0.2em] shadow-lg shadow-primary/30 transition hover:shadow-xl"
            >
              Fale com a equipe
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Instituto ITESAM</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Promovemos acesso a cuidados e oportunidades que fortalecem famílias e comunidades em toda a Amazônia.
            </p>
            <div className="footer-social-card">
              <a
                href="https://www.facebook.com/profile.php?id=61581223787205"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-container footer-container-facebook"
                aria-label="Facebook"
              >
                <Facebook size={18} className="footer-social-svg" />
              </a>

              <a
                href="https://www.instagram.com/instituto_itesam?igsh=amh0ZHVveXA1bG04&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-container footer-container-instagram"
                aria-label="Instagram"
              >
                <Instagram size={18} className="footer-social-svg" />
              </a>

              <a
                href="https://www.tiktok.com/@instituto_itesam?_t=ZM-90MJQmzhrVz&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-container footer-container-tiktok"
                aria-label="TikTok"
              >
                <TikTokIcon className="footer-social-svg" />
              </a>

              <a
                href="https://wa.me/559292729631"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-container footer-container-whatsapp"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="footer-social-svg" />
              </a>
            </div>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://bvsms.saude.gov.br/bvs/publicacoes/guia_cuidados_pessoa_idosa.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Manual da Pessoa Idosa - Direitos e Serviços
                </a>
              </li>
              <li>
                <a
                  href="https://www.planalto.gov.br/ccivil_03/leis/L8069.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Lei nº 8.069/1990 - Estatuto da Criança e do Adolescente
                </a>
              </li>
              <li>
                <a
                  href="https://www.acessibilidade.unb.br/images/PDF/NORMA_NBR-9050.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  NBR 9050 - Normas de Acessibilidade Nacionais
                </a>
              </li>
            </ul>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/quem-somos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link
                  to="/galeria"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Galeria
                </Link>
              </li>
              <li>
                <Link
                  to="/noticias"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Notícias
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  Rua Marechal Junot, 300, Prq 10 de Novembro – Manaus/AM – 69055-747, Brasil
                </span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone size={16} className="flex-shrink-0" />
                <a href="tel:+559292729631" className="hover:text-primary transition-colors">
                  +55 (92) 99272-9631
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <WhatsAppIcon className="h-4 w-4 flex-shrink-0" />
                <a href="https://wa.me/559292729631" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  WhatsApp: +55 (92) 99272-9631
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail size={16} className="flex-shrink-0" />
                <span>contato@itesam.org.br</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/60">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Instituto de Tecnologia, Ensino e Saúde da Amazônia - ITESAM
            </p>
            <p className="text-xs text-muted-foreground">
              CNPJ: 10.730.796/0001-91 | Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
