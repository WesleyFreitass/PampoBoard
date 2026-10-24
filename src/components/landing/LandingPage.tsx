import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Layers,
  Zap,
  Share2,
  CheckCircle2,
  Image as ImageIcon,
  Maximize2,
  Sun,
  Moon,
  FolderKanban,
  Palette,
  ShieldCheck,
  Cpu,
  ChevronRight,
  Play,
  Flame,
  LayoutGrid,
  FileText,
  CheckSquare,
  Globe,
} from 'lucide-react';
import { PampoLogo } from '../common/PampoLogo';
import { sound } from '../../utils/sound';

interface LandingPageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onExploreGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  onToggleTheme,
  onOpenLogin,
  onOpenRegister,
  onExploreGuest,
}) => {
  return (
    <div
      className={`min-h-screen w-full transition-colors overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-300 font-sans ${
        theme === 'dark' ? 'bg-[#0a0b0e] text-neutral-100' : 'bg-[#fafafa] text-neutral-900'
      }`}
    >
      {/* Background Subtle Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            theme === 'dark'
              ? 'radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)'
              : 'radial-gradient(rgba(0, 0, 0, 0.06) 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Ambient Glow Orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-cyan-500/15 via-indigo-500/10 to-transparent blur-[120px] pointer-events-none rounded-full -z-10" />

      {/* =========================================
          1. NAVBAR
      ========================================== */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-colors bg-black/40 border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <PampoLogo size="md" withText={true} textSubtitle="Bancada Visual" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-neutral-400">
            <a href="#recursos" className="hover:text-cyan-400 transition-colors">
              Recursos
            </a>
            <a href="#milanote" className="hover:text-cyan-400 transition-colors">
              Colunas Milanote
            </a>
            <a href="#conexoes" className="hover:text-cyan-400 transition-colors">
              Conexões
            </a>
            <a href="#beneficios" className="hover:text-cyan-400 transition-colors">
              Vantagens
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onToggleTheme();
              }}
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Login Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenLogin();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Entrar
            </button>

            {/* Register CTA Button */}
            <button
              type="button"
              onClick={() => {
                sound.playConnect();
                onOpenRegister();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-black hover:opacity-95 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Começar Grátis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================
          2. HERO SECTION
      ========================================== */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 max-w-6xl mx-auto text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold mb-8 animate-fade-in shadow-lg shadow-cyan-500/10">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>A Nova Era do Canvas Infinito & Colunas Visuais</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6 max-w-4xl mx-auto">
          Dê asas às suas ideias em um{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            canvas infinito
          </span>
          .
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Conecte pensamentos, anotações, colunas no estilo Milanote, imagens, checklists e fluxos com extrema
          liberdade espacial. Feito para mentes visuais.
        </p>

        {/* Hero Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
          <button
            type="button"
            onClick={() => {
              sound.playConnect();
              onOpenRegister();
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-black hover:shadow-cyan-500/30 shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Criar Conta Gratuita</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onExploreGuest();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-semibold border border-white/10 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08] text-white transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Experimentar sem Cadastro</span>
          </button>
        </div>

        {/* Social Badges / Micro-proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Gratuito
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sem cartão de crédito
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sincronização na nuvem
          </span>
        </div>

        {/* =========================================
            3. INTERACTIVE HERO CANVAS MOCKUP
        ========================================== */}
        <div className="mt-16 relative rounded-3xl p-3 border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.01] shadow-2xl shadow-cyan-500/10">
          <div className="relative rounded-2xl overflow-hidden bg-[#0e0f14] border border-white/5 min-h-[460px] md:min-h-[540px] flex items-center justify-center select-none">
            {/* Canvas Grid Background in Mockup */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Glowing Bezier Wire inside Mockup */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <path
                d="M 220 220 C 350 220, 320 180, 480 180"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="6,6"
                className="opacity-70 animate-pulse"
              />
              <path
                d="M 480 230 C 580 230, 620 320, 720 320"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                className="opacity-70"
              />
            </svg>

            {/* Mock Card 1: Post-it */}
            <div className="absolute left-8 top-16 md:left-24 md:top-24 w-52 p-4 rounded-2xl bg-[#fef08a] text-neutral-900 shadow-2xl shadow-yellow-950/40 rotate-[-3deg] transition-transform hover:rotate-0 hover:scale-105 z-20">
              <div className="w-8 h-2 rounded-full bg-black/15 mx-auto mb-3" />
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">💡 Ideia Principal</div>
              <p className="text-xs font-semibold leading-relaxed">
                Construir uma bancada visual fluida para organizar nosso lançamento de produto.
              </p>
            </div>

            {/* Mock Card 2: Milanote Column */}
            <div className="absolute left-1/2 -translate-x-1/2 top-10 md:top-14 w-72 rounded-2xl p-4 bg-[#181a24] border border-[#2e3140] shadow-2xl z-20 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 text-xs">
                <span className="font-bold flex items-center gap-1.5 text-purple-400">
                  <Layers className="w-3.5 h-3.5" /> Coluna Milanote
                </span>
                <span className="text-[10px] font-mono text-purple-300 font-semibold">3 itens</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div className="font-semibold text-neutral-200 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" /> Escopo do Projeto
                  </div>
                  <div className="text-[11px] text-neutral-400">Estrutura visual com nós inteligentes e suporte a mídias.</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div className="font-semibold text-neutral-200 flex items-center gap-1.5 mb-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Tarefas Principais
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">✓ Canvas Infinito Livre</div>
                  <div className="text-[10px] text-emerald-400 font-mono">✓ Conexões com Arrasto</div>
                </div>
              </div>
            </div>

            {/* Mock Card 3: Free Text & Media */}
            <div className="absolute right-8 bottom-16 md:right-20 md:bottom-20 w-56 p-4 rounded-2xl bg-[#1e2029] border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 rotate-[2deg] transition-transform hover:rotate-0 hover:scale-105 z-20 text-left">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-2">
                <ImageIcon className="w-3.5 h-3.5" /> Inspiração Visual
              </div>
              <div className="w-full h-24 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-600 overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                Design System 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          4. FEATURES SECTION (RECURSOS)
      ========================================== */}
      <section id="recursos" className="py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3">
            Ferramentas Poderosas
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Tudo o que você precisa para pensar sem limites.
          </h2>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            Elimine a frustração de pastas engessadas e documentos lineares. Veja o panorama geral e os detalhes em uma
            única tela infinita.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-7 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-cyan-500/30 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Maximize2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Canvas Infinito Livre</h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Navegue, faça zoom de 10% a 300% e distribua suas ideias em um espaço sem barreiras, com fluidez de 60 FPS.
            </p>
          </div>

          {/* Feature 2: Milanote Columns */}
          <div id="milanote" className="p-7 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-purple-500/30 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Colunas no Estilo Milanote</h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Agrupe notas, tarefas, checklists e imagens verticalmente. Arraste cards para dentro ou extraia de volta para o
              quadro livre.
            </p>
          </div>

          {/* Feature 3: Smart Connections */}
          <div id="conexoes" className="p-7 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-emerald-500/30 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Conexões Magnéticas Fluídas</h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Conecte qualquer card a outro com setas dinâmicas e curvas suaves, rótulos de texto e pulsos de fluxo visual em tempo real.
            </p>
          </div>

          {/* Feature 4: Media & Image Support */}
          <div className="p-7 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-pink-500/30 group">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-5 border border-pink-500/20 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Imagens & Mídias Visuais</h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Arraste e solte fotos direto do computador ou cole via Ctrl+V. Mantenha moodboards e referências sempre à vista.
            </p>
          </div>

          {/* Feature 5: Sub-Boards */}
          <div className="p-7 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-amber-500/30 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Sub-Quadros Aninhados</h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Crie quadros dentro de quadros para projetos complexos. Mantenha tudo limpo e navegue facilmente via breadcrumbs.
            </p>
          </div>

          {/* Feature 6: Cloud Sync & Security */}
          <div className="p-7 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-blue-500/30 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Sincronização em Nuvem</h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Seus dados salvos com MongoDB em alta disponibilidade na VPS. Faça login com Google ou GitHub com um clique.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          5. COMPARISON / BENEFITS SECTION
      ========================================== */}
      <section id="beneficios" className="py-20 px-6 max-w-5xl mx-auto border-t border-white/5 text-center">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
          Por que profissionais escolhem o PampoBoard?
        </h2>
        <p className="text-neutral-400 text-sm max-w-xl mx-auto mb-12">
          A perfeita união entre a liberdade do Miro e a organização vertical elegante do Milanote.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800">
            <h4 className="text-base font-bold text-neutral-300 mb-4 flex items-center gap-2">
              <span className="text-rose-400">✕</span> Outras ferramentas
            </h4>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">•</span> Planos pagos caros com limite de quadros no plano gratuito.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">•</span> Falta de agrupamento em colunas organizadas (tudo fica bagunçado).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">•</span> Interfaces pesadas e lentas com excesso de menus e popups.
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-neutral-900 to-emerald-950/30 border border-cyan-500/30 shadow-xl shadow-cyan-500/5">
            <h4 className="text-base font-bold text-cyan-300 mb-4 flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Com o PampoBoard
            </h4>
            <ul className="space-y-3 text-xs text-neutral-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Bancada infinita livre + Colunas Milanote integradas harmoniosamente.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Totalmente gratuito para você criar, conectar e produzir sem restrições.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Login simplificado com Google ou GitHub e sincronização imediata.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================
          6. FINAL CTA BANNER
      ========================================== */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="relative rounded-3xl p-10 md:p-16 border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 via-neutral-950 to-neutral-950 text-center overflow-hidden shadow-2xl shadow-cyan-500/10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-cyan-400/20 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center justify-center">
              <PampoLogo size="xl" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Pronto para transformar a sua produtividade visual?
            </h2>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mb-8">
              Crie seu primeiro quadro em segundos. Liberte seus projetos da desordem e veja suas ideias ganharem vida.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  sound.playConnect();
                  onOpenRegister();
                }}
                className="px-8 py-4 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/25 flex items-center gap-2"
              >
                <span>Acessar o PampoBoard Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          7. FOOTER
      ========================================== */}
      <footer className="py-10 border-t border-white/5 px-6 select-none">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <PampoLogo size="xs" />
            <span className="font-bold text-neutral-200">PampoBoard</span>
            <span className="text-neutral-500">—</span>
            <span className="text-neutral-400">
              Bancada visual infinita para organizar projetos, notas e ideias com fluxo livre
            </span>
          </div>

          <div className="w-full border-t border-white/5 my-1" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-cyan-400 font-medium">PampoBoard</span>
            <span className="text-neutral-600">•</span>
            <a
              href="https://pampoboard.pampo.tech"
              className="text-cyan-400 font-medium hover:underline hover:text-cyan-300 transition-colors"
            >
              pampoboard.pampo.tech
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
