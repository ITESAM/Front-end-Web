import { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import type { AccessibilitySettings } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Accessibility, 
  X, 
  Type, 
  Minus, 
  Plus,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  ImageOff,
  Contrast,
  Palette,
  Volume2,
  VolumeX,
  Sparkles,
  Map,
  Square,
  RotateCcw
} from 'lucide-react';

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState<{ text: string; id: number } | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const { toast } = useToast();
  const {
    settings,
    increaseFontSize,
    decreaseFontSize,
    setFontFamily,
    setTextAlign,
    increaseLineHeight,
    decreaseLineHeight,
    increaseLetterSpacing,
    decreaseLetterSpacing,
    toggleHideImages,
    increaseTextContrast,
    decreaseTextContrast,
    increasePageContrast,
    decreasePageContrast,
    increaseColorIntensity,
    decreaseColorIntensity,
    setColorScheme,
    toggleShowStructure,
    toggleStopAnimations,
    toggleMuteAudio,
    toggleHighlightElements,
    resetSettings,
  } = useAccessibility();

  const announce = (message: string) => {
    toast({ description: message });
    setLiveMessage({ text: message, id: Date.now() });
  };

  useEffect(() => {
    if (!liveMessage) return;

    const timeout = setTimeout(() => setLiveMessage(null), 2000);
    return () => clearTimeout(timeout);
  }, [liveMessage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt+A to open accessibility panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsOpen(true);
      }
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      previouslyFocusedElementRef.current?.focus?.();
      previouslyFocusedElementRef.current = null;
      return;
    }

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusPanel = () => {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelectors);
      if (!focusable || focusable.length === 0) return;
      (focusable[0] ?? closeButtonRef.current)?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelectors);
      if (!focusable || focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const focusableElements = Array.from(focusable).filter(
        (element) =>
          !element.hasAttribute('data-focus-guard') && element.getAttribute('aria-hidden') !== 'true'
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    panelRef.current?.focus();
    focusPanel();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleFontSizeIncrease = () => {
    increaseFontSize();
    announce('Tamanho do texto aumentado');
  };

  const handleFontSizeDecrease = () => {
    decreaseFontSize();
    announce('Tamanho do texto reduzido');
  };

  const handleFontFamilyChange = (family: AccessibilitySettings['fontFamily']) => {
    setFontFamily(family);
    announce(`Fonte alterada para ${family}`);
  };

  const handleTextAlignChange = (align: AccessibilitySettings['textAlign']) => {
    setTextAlign(align);
    const labels: Record<AccessibilitySettings['textAlign'], string> = {
      left: 'Texto alinhado à esquerda',
      center: 'Texto centralizado',
      justify: 'Texto justificado',
    };
    announce(labels[align] ?? 'Alinhamento alterado');
  };

  const handleLineHeightIncrease = () => {
    increaseLineHeight();
    announce('Espaço entre linhas aumentado');
  };

  const handleLineHeightDecrease = () => {
    decreaseLineHeight();
    announce('Espaço entre linhas reduzido');
  };

  const handleLetterSpacingIncrease = () => {
    increaseLetterSpacing();
    announce('Espaço entre letras aumentado');
  };

  const handleLetterSpacingDecrease = () => {
    decreaseLetterSpacing();
    announce('Espaço entre letras reduzido');
  };

  const handleToggleHideImages = () => {
    const nextValue = !settings.hideImages;
    toggleHideImages();
    announce(nextValue ? 'Imagens ocultadas' : 'Imagens exibidas');
  };

  const handleColorSchemeChange = (scheme: AccessibilitySettings['colorScheme']) => {
    setColorScheme(scheme);
    const schemeLabels: Record<AccessibilitySettings['colorScheme'], string> = {
      default: 'Esquema de cores padrão ativado',
      dark: 'Esquema de cores escuro ativado',
      sepia: 'Esquema de cores sépia ativado',
      'high-contrast': 'Esquema de alto contraste ativado',
    };
    announce(schemeLabels[scheme] ?? 'Esquema de cores alterado');
  };

  const handleIncreaseTextContrast = () => {
    increaseTextContrast();
    announce('Contraste do texto aumentado');
  };

  const handleDecreaseTextContrast = () => {
    decreaseTextContrast();
    announce('Contraste do texto reduzido');
  };

  const handleIncreasePageContrast = () => {
    increasePageContrast();
    announce('Contraste da página aumentado');
  };

  const handleDecreasePageContrast = () => {
    decreasePageContrast();
    announce('Contraste da página reduzido');
  };

  const handleIncreaseColorIntensity = () => {
    increaseColorIntensity();
    announce('Intensidade das cores aumentada');
  };

  const handleDecreaseColorIntensity = () => {
    decreaseColorIntensity();
    announce('Intensidade das cores reduzida');
  };

  const handleToggleShowStructure = () => {
    const nextValue = !settings.showStructure;
    toggleShowStructure();
    announce(nextValue ? 'Estrutura exibida' : 'Estrutura oculta');
  };

  const handleToggleStopAnimations = () => {
    const nextValue = !settings.stopAnimations;
    toggleStopAnimations();
    announce(nextValue ? 'Animações desativadas' : 'Animações ativadas');
  };

  const handleToggleMuteAudio = () => {
    const nextValue = !settings.muteAudio;
    toggleMuteAudio();
    announce(nextValue ? 'Áudio silenciado' : 'Áudio ativado');
  };

  const handleToggleHighlightElements = () => {
    const nextValue = !settings.highlightElements;
    toggleHighlightElements();
    announce(nextValue ? 'Destaque ativado' : 'Destaque desativado');
  };

  const handleResetSettings = () => {
    resetSettings();
    toast({
      title: "Configurações restauradas",
      description: "Todas as preferências foram resetadas para o padrão"
    });
    setLiveMessage({ text: 'Configurações de acessibilidade restauradas', id: Date.now() });
  };

  return (
    <>
      <div aria-live="polite" role="status" className="sr-only">
        {liveMessage?.text}
      </div>
      {/* Botão flutuante */}
      <Button
        ref={triggerButtonRef}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        aria-label="Abrir painel de acessibilidade (Alt+A)"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        aria-haspopup="dialog"
        title="Acessibilidade (Alt+A)"
      >
        <Accessibility className="h-6 w-6" />
      </Button>

      {/* Overlay e painel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md md:max-w-2xl bg-background shadow-xl z-[70] overflow-y-auto"
            role="dialog"
            aria-labelledby="accessibility-dialog-title"
            aria-describedby="accessibility-dialog-description"
            aria-modal="true"
            id="accessibility-panel"
            ref={panelRef}
            tabIndex={-1}
          >
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 id="accessibility-dialog-title" className="text-xl md:text-2xl font-bold">
                    Acessibilidade
                  </h2>
                  <p id="accessibility-dialog-description" className="text-sm text-muted-foreground">
                    Personalize sua experiência de navegação
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetSettings}
                    aria-label="Restaurar configurações padrão"
                    className="hidden md:flex"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    aria-label="Fechar painel de acessibilidade"
                    ref={closeButtonRef}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="content" className="w-full" aria-label="Categorias de acessibilidade">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="color">Cor e Tela</TabsTrigger>
                  <TabsTrigger value="navigation">Navegação</TabsTrigger>
                </TabsList>

                {/* Conteúdo */}
                <TabsContent value="content" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Type className="h-5 w-5" />
                        Tamanho do texto
                      </CardTitle>
                      <CardDescription>Atual: {settings.fontSize}%</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button 
                        onClick={handleFontSizeDecrease} 
                        variant="outline" 
                        size="icon"
                        aria-label="Diminuir tamanho do texto"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleFontSizeIncrease} 
                        variant="outline" 
                        size="icon"
                        aria-label="Aumentar tamanho do texto"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">Fonte</CardTitle>
                      <CardDescription>Escolha uma fonte mais legível</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleFontFamilyChange('default')}
                        variant={settings.fontFamily === 'default' ? 'default' : 'outline'}
                        aria-pressed={settings.fontFamily === 'default'}
                      >
                        Padrão
                      </Button>
                      <Button
                        onClick={() => handleFontFamilyChange('dyslexic')}
                        variant={settings.fontFamily === 'dyslexic' ? 'default' : 'outline'}
                        aria-pressed={settings.fontFamily === 'dyslexic'}
                      >
                        Dislexia
                      </Button>
                      <Button
                        onClick={() => handleFontFamilyChange('arial')}
                        variant={settings.fontFamily === 'arial' ? 'default' : 'outline'}
                        aria-pressed={settings.fontFamily === 'arial'}
                      >
                        Arial
                      </Button>
                      <Button
                        onClick={() => handleFontFamilyChange('verdana')}
                        variant={settings.fontFamily === 'verdana' ? 'default' : 'outline'}
                        aria-pressed={settings.fontFamily === 'verdana'}
                      >
                        Verdana
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">Alinhamento</CardTitle>
                      <CardDescription>Ajuste o alinhamento do texto</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button
                        onClick={() => handleTextAlignChange('left')}
                        variant={settings.textAlign === 'left' ? 'default' : 'outline'}
                        size="icon"
                        aria-label="Alinhar à esquerda"
                        aria-pressed={settings.textAlign === 'left'}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleTextAlignChange('center')}
                        variant={settings.textAlign === 'center' ? 'default' : 'outline'}
                        size="icon"
                        aria-label="Centralizar"
                        aria-pressed={settings.textAlign === 'center'}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleTextAlignChange('justify')}
                        variant={settings.textAlign === 'justify' ? 'default' : 'outline'}
                        size="icon"
                        aria-label="Justificar"
                        aria-pressed={settings.textAlign === 'justify'}
                      >
                        <AlignJustify className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">Espaço entre linhas</CardTitle>
                      <CardDescription>Atual: {settings.lineHeight}%</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button 
                        onClick={handleLineHeightDecrease} 
                        variant="outline" 
                        size="icon"
                        aria-label="Diminuir espaço entre linhas"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleLineHeightIncrease} 
                        variant="outline" 
                        size="icon"
                        aria-label="Aumentar espaço entre linhas"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">Espaço entre letras</CardTitle>
                      <CardDescription>Atual: {settings.letterSpacing}%</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button 
                        onClick={handleLetterSpacingDecrease} 
                        variant="outline" 
                        size="icon"
                        aria-label="Diminuir espaço entre letras"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleLetterSpacingIncrease} 
                        variant="outline" 
                        size="icon"
                        aria-label="Aumentar espaço entre letras"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <ImageOff className="h-5 w-5" />
                        Sem imagens
                      </CardTitle>
                      <CardDescription>Oculta todas as imagens da página</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleToggleHideImages}
                        variant={settings.hideImages ? 'default' : 'outline'}
                        className="w-full"
                        aria-pressed={settings.hideImages}
                      >
                        {settings.hideImages ? 'Ativado' : 'Desativado'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Cor e Tela */}
                <TabsContent value="color" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Contrast className="h-5 w-5" />
                        Contraste do texto
                      </CardTitle>
                      <CardDescription>Atual: {settings.textContrast}%</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button 
                        onClick={handleDecreaseTextContrast} 
                        variant="outline" 
                        size="icon"
                        aria-label="Diminuir contraste do texto"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleIncreaseTextContrast} 
                        variant="outline" 
                        size="icon"
                        aria-label="Aumentar contraste do texto"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">Contraste da página</CardTitle>
                      <CardDescription>Atual: {settings.pageContrast}%</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button 
                        onClick={handleDecreasePageContrast} 
                        variant="outline" 
                        size="icon"
                        aria-label="Diminuir contraste da página"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleIncreasePageContrast} 
                        variant="outline" 
                        size="icon"
                        aria-label="Aumentar contraste da página"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Palette className="h-5 w-5" />
                        Intensidade das cores
                      </CardTitle>
                      <CardDescription>Atual: {settings.colorIntensity}%</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button 
                        onClick={handleDecreaseColorIntensity} 
                        variant="outline" 
                        size="icon"
                        aria-label="Diminuir intensidade das cores"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleIncreaseColorIntensity} 
                        variant="outline" 
                        size="icon"
                        aria-label="Aumentar intensidade das cores"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">Cores da página</CardTitle>
                      <CardDescription>Escolha um esquema de cores</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleColorSchemeChange('default')}
                        variant={settings.colorScheme === 'default' ? 'default' : 'outline'}
                        aria-pressed={settings.colorScheme === 'default'}
                      >
                        Padrão
                      </Button>
                      <Button
                        onClick={() => handleColorSchemeChange('dark')}
                        variant={settings.colorScheme === 'dark' ? 'default' : 'outline'}
                        aria-pressed={settings.colorScheme === 'dark'}
                      >
                        Escuro
                      </Button>
                      <Button
                        onClick={() => handleColorSchemeChange('sepia')}
                        variant={settings.colorScheme === 'sepia' ? 'default' : 'outline'}
                        aria-pressed={settings.colorScheme === 'sepia'}
                      >
                        Sépia
                      </Button>
                      <Button
                        onClick={() => handleColorSchemeChange('high-contrast')}
                        variant={settings.colorScheme === 'high-contrast' ? 'default' : 'outline'}
                        aria-pressed={settings.colorScheme === 'high-contrast'}
                      >
                        Alto Contraste
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Navegação */}
                <TabsContent value="navigation" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Map className="h-5 w-5" />
                        Estrutura da página
                      </CardTitle>
                      <CardDescription>
                        Destaca a hierarquia dos elementos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleToggleShowStructure}
                        variant={settings.showStructure ? 'default' : 'outline'}
                        className="w-full"
                        aria-pressed={settings.showStructure}
                      >
                        {settings.showStructure ? 'Ativado' : 'Desativado'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Square className="h-5 w-5" />
                        Parar animações
                      </CardTitle>
                      <CardDescription>
                        Desativa todas as animações e transições
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleToggleStopAnimations}
                        variant={settings.stopAnimations ? 'default' : 'outline'}
                        className="w-full"
                        aria-pressed={settings.stopAnimations}
                      >
                        {settings.stopAnimations ? 'Ativado' : 'Desativado'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        {settings.muteAudio ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        Sem som
                      </CardTitle>
                      <CardDescription>
                        Silencia todos os áudios e vídeos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleToggleMuteAudio}
                        variant={settings.muteAudio ? 'default' : 'outline'}
                        className="w-full"
                        aria-pressed={settings.muteAudio}
                      >
                        {settings.muteAudio ? 'Ativado' : 'Desativado'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Sparkles className="h-5 w-5" />
                        Destacar elementos
                      </CardTitle>
                      <CardDescription>
                        Adiciona bordas em links, botões e campos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleToggleHighlightElements}
                        variant={settings.highlightElements ? 'default' : 'outline'}
                        className="w-full"
                        aria-pressed={settings.highlightElements}
                      >
                        {settings.highlightElements ? 'Ativado' : 'Desativado'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Reset button for mobile */}
              <div className="md:hidden">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleResetSettings}
                  aria-label="Resetar todas as configurações de acessibilidade"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar Configurações
                </Button>
              </div>

              {/* Footer - Atalhos de teclado */}
              <div className="text-center pt-4 pb-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Atalhos: <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+A</kbd> para abrir • <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> para fechar
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Feito por <span className="font-semibold">Access Platform</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AccessibilityPanel;
