import React, { useState, useEffect } from 'react';
import { api, AuthUser } from '../../services/api';
import { Mail, Lock, User, ArrowRight, Sun, Moon, Sparkles, Layers, Box, Cpu, X, ArrowLeft } from 'lucide-react';
import { GithubIcon, GoogleIcon } from '../common/SocialIcons';
import { PampoLogo } from '../common/PampoLogo';
import { sound } from '../../utils/sound';

interface AuthScreenProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSuccess: (user: AuthUser, defaultWsId?: string) => void;
  initialTab?: 'login' | 'register';
  onBackToLanding?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  theme,
  onToggleTheme,
  onSuccess,
  initialTab = 'login',
  onBackToLanding,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [oauthConfigModalProvider, setOauthConfigModalProvider] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    const provider = params.get('provider');
    if (err === 'oauth_missing_config') {
      setOauthConfigModalProvider(provider || 'github');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (err) {
      setErrorMessage(`Aviso de login (${provider || 'OAuth'}): ${err}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOfficialGithubOAuth = () => {
    sound.playClick();
    window.location.href = '/api/auth/github';
  };

  const handleOfficialGoogleOAuth = () => {
    sound.playClick();
    window.location.href = '/api/auth/google';
  };

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
        <div className="flex items-center gap-4">
          {onBackToLanding && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onBackToLanding();
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-cyan-400 transition-colors pr-2"
              title="Voltar para a Página Inicial"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>
          )}
          <PampoLogo
            size="sm"
            withText={true}
            textSubtitle="Bancada Visual"
            onClick={onBackToLanding}
          />
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
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={handleOfficialGithubOAuth}
                title="Entrar com a sua conta oficial do GitHub na página do GitHub.com"
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white hover:border-purple-500'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:border-purple-500'
                }`}
              >
                <GithubIcon className="w-4 h-4 text-purple-400" />
                <span>GitHub</span>
              </button>

              <button
                type="button"
                onClick={handleOfficialGoogleOAuth}
                title="Entrar com a sua conta oficial do Google na página do Google.com"
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white hover:border-cyan-500'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:border-cyan-500'
                }`}
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Google</span>
              </button>
            </div>
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
      {/* OAuth Provider Configuration Instructions Modal */}
      {oauthConfigModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl border ${
              theme === 'dark'
                ? 'bg-[#15161b] border-[#262833] text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <button
              type="button"
              onClick={() => setOauthConfigModalProvider(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {oauthConfigModalProvider === 'github' ? (
                  <GithubIcon className="w-5 h-5 text-purple-400" />
                ) : (
                  <GoogleIcon className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold m-0">
                  Login Oficial via {oauthConfigModalProvider === 'github' ? 'GitHub.com' : 'Google.com'}
                </h3>
                <p className="text-xs text-neutral-400 m-0">
                  Configuração de chaves OAuth 2.0 no servidor
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <p className="m-0 leading-relaxed">
                Para que o <strong>{oauthConfigModalProvider === 'github' ? 'GitHub' : 'Google'}</strong> abra a página de autorização oficial dele com segurança, o PampoBoard precisa de um <strong>Client ID</strong> e <strong>Client Secret</strong> cadastrados nas variáveis de ambiente da VPS.
              </p>

              {oauthConfigModalProvider === 'github' ? (
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 font-mono text-[11px]">
                  <div className="text-purple-400 font-bold">
                    Passo a passo no GitHub:
                  </div>
                  <div>1. Abra: <a href="https://github.com/settings/applications/new" target="_blank" rel="noreferrer" className="underline text-indigo-400 hover:text-indigo-300">github.com/settings/applications/new</a></div>
                  <div><strong>Application name:</strong> PampoBoard</div>
                  <div><strong>Homepage URL:</strong> https://pampoboard.pampo.tech</div>
                  <div><strong>Authorization callback URL:</strong> https://pampoboard.pampo.tech/api/auth/github/callback</div>
                  <div className="text-neutral-400 text-[10px] pt-1">
                    2. Gere o Client Secret e adicione <code>GITHUB_CLIENT_ID</code> e <code>GITHUB_CLIENT_SECRET</code> no Docker.
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 font-mono text-[11px]">
                  <div className="text-cyan-400 font-bold">
                    Passo a passo no Google Cloud Console:
                  </div>
                  <div>1. Abra: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="underline text-cyan-400 hover:text-cyan-300">console.cloud.google.com/apis/credentials</a></div>
                  <div><strong>Origens JavaScript:</strong> https://pampoboard.pampo.tech</div>
                  <div><strong>URIs de redirecionamento autorizados:</strong> https://pampoboard.pampo.tech/api/auth/google/callback</div>
                </div>
              )}

              <div className="pt-2 border-t border-white/10 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setOauthConfigModalProvider(null)}
                  className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
