import React, { useState } from 'react';
import { api, AuthUser } from '../../services/api';
import { Mail, Lock, User, ArrowRight, Sun, Moon, Sparkles, Layers, Box, Cpu, RefreshCw } from 'lucide-react';
import { GithubIcon, GoogleIcon } from '../common/SocialIcons';
import { sound } from '../../utils/sound';

interface AuthScreenProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSuccess: (user: AuthUser, defaultWsId?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  theme,
  onToggleTheme,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showGithubPrompt, setShowGithubPrompt] = useState(false);
  const [githubUsernameInput, setGithubUsernameInput] = useState('');
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (tab === 'register') {
        if (!name.trim()) throw new Error('Por favor, informe o seu nome');
        const res = await api.auth.register(name.trim(), email.trim(), password);
        sound.playConnect();
        onSuccess(res.user, res.defaultWorkspaceId);
      } else {
        const res = await api.auth.login(email.trim(), password);
        sound.playConnect();
        onSuccess(res.user, res.defaultWorkspaceId);
      }
    } catch (err: any) {
      sound.playDelete();
      setErrorMessage(err.message || 'Erro ao realizar login. Verifique seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsernameInput.trim()) {
      setErrorMessage('Digite seu usuário do GitHub');
      return;
    }
    setErrorMessage(null);
    setIsGithubLoading(true);
    try {
      const res = await api.auth.loginWithGithub({
        githubUsername: githubUsernameInput.trim(),
      });
      sound.playConnect();
      onSuccess(res.user, res.defaultWorkspaceId);
    } catch (err: any) {
      sound.playDelete();
      setErrorMessage(err.message || 'Erro ao conectar via GitHub');
    } finally {
      setIsGithubLoading(false);
    }
  };

  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) {
      setErrorMessage('Digite seu e-mail do Google');
      return;
    }
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const res = await api.auth.loginWithGoogle({
        email: googleEmailInput.trim(),
        name: googleNameInput.trim() || undefined,
      });
      sound.playConnect();
      onSuccess(res.user, res.defaultWorkspaceId);
    } catch (err: any) {
      sound.playDelete();
      setErrorMessage(err.message || 'Erro ao conectar via Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen w-screen flex flex-col justify-between overflow-x-hidden transition-colors ${
        theme === 'dark' ? 'bg-[#0c0d12] text-neutral-100' : 'bg-[#f8fafc] text-neutral-900'
      }`}
      style={{
        backgroundImage:
          theme === 'dark'
            ? 'radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)'
            : 'radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Bar with Brand & Theme Switcher */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-black text-lg text-black tracking-tighter">P</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-base font-bold tracking-tight m-0">Pampo Board</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onToggleTheme();
          }}
          title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          className={`p-2.5 rounded-xl border transition-all ${
            theme === 'dark'
              ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:text-white'
              : 'bg-white border-neutral-200 text-neutral-700 hover:text-black shadow-sm'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </header>

      {/* Main Centered Auth Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Box */}
          <div
            className={`rounded-3xl border p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl transition-all ${
              theme === 'dark'
                ? 'bg-[#15161b]/95 border-[#262833] shadow-emerald-500/5'
                : 'bg-white/95 border-neutral-200 shadow-neutral-900/10'
            }`}
          >
            {/* Ambient Top Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full" />

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                {tab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h2>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                {tab === 'login'
                  ? 'Acesse seus quadros infinitos, mídias 3D e fluxos de projeto'
                  : 'Comece a organizar suas ideias com cards visuais, notas e conexões'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div
              className={`flex rounded-xl p-1 mb-6 border ${
                theme === 'dark' ? 'bg-[#0c0d12] border-[#262833]' : 'bg-neutral-100 border-neutral-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'login'
                    ? theme === 'dark'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTab('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'register'
                    ? theme === 'dark'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Cadastrar
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Wesley Freitas"
                      className={`w-full pl-9 pr-3.5 py-3 text-xs rounded-xl border outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-[#0c0d12] border-[#262833] text-white focus:border-emerald-500'
                          : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="wesley@pampo.tech"
                    className={`w-full pl-9 pr-3.5 py-3 text-xs rounded-xl border outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-[#0c0d12] border-[#262833] text-white focus:border-emerald-500'
                        : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Senha {tab === 'register' && <span className="text-neutral-500 font-normal">(mínimo 6 dígitos)</span>}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3.5 py-3 text-xs rounded-xl border outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-[#0c0d12] border-[#262833] text-white focus:border-emerald-500'
                        : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Conectando...</span>
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Entrar no PampoBoard' : 'Criar Conta e Acessar'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span
                className={`relative px-3 text-[10px] uppercase font-mono tracking-wider ${
                  theme === 'dark' ? 'bg-[#15161b] text-neutral-400' : 'bg-white text-neutral-500'
                }`}
              >
                Ou acesse com
              </span>
            </div>

            {/* Social OAuth Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowGithubPrompt((prev) => !prev);
                  setShowGooglePrompt(false);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] ${
                  showGithubPrompt
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                    : theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                }`}
              >
                <GithubIcon className="w-4 h-4 text-purple-400" />
                <span>GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowGooglePrompt((prev) => !prev);
                  setShowGithubPrompt(false);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] ${
                  showGooglePrompt
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                }`}
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Google</span>
              </button>
            </div>

            {/* GitHub Prompt Form */}
            {showGithubPrompt && (
              <form onSubmit={handleGithubLogin} className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-2 mb-2 animate-fade-in">
                <div className="text-[11px] font-semibold text-purple-300">
                  Entre com seu usuário do GitHub (sua foto será puxada automaticamente):
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={githubUsernameInput}
                    onChange={(e) => setGithubUsernameInput(e.target.value)}
                    placeholder="Ex: WesleyFreitass"
                    autoFocus
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs border outline-none font-mono ${
                      theme === 'dark'
                        ? 'bg-neutral-900 border-neutral-700 text-white'
                        : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={isGithubLoading}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1.5"
                  >
                    {isGithubLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Entrar</span>}
                  </button>
                </div>
              </form>
            )}

            {/* Google Prompt Form */}
            {showGooglePrompt && (
              <form onSubmit={handleGoogleLogin} className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-2 mb-2 animate-fade-in">
                <div className="text-[11px] font-semibold text-cyan-300">
                  Informe seu e-mail Google:
                </div>
                <div className="space-y-1.5">
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    autoFocus
                    className={`w-full px-3 py-1.5 rounded-lg text-xs border outline-none font-mono ${
                      theme === 'dark'
                        ? 'bg-neutral-900 border-neutral-700 text-white'
                        : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                  <input
                    type="text"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    placeholder="Seu nome (opcional)"
                    className={`w-full px-3 py-1.5 rounded-lg text-xs border outline-none ${
                      theme === 'dark'
                        ? 'bg-neutral-900 border-neutral-700 text-white'
                        : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={isGoogleLoading}
                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isGoogleLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Acessar via Google</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Feature Badges Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Canvas Infinito com Snapping</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Box className="w-4 h-4 text-cyan-400" />
          <span>Mídias 3D WebGL & Áudio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Auto-save Contínuo & Presets</span>
        </div>
      </footer>
    </div>
  );
};
