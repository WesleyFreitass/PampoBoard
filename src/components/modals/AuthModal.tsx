import React, { useState } from 'react';
import { api, AuthUser } from '../../services/api';
import { X, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser, defaultWsId?: string) => void;
  theme: 'dark' | 'light';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  theme,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (tab === 'register') {
        if (!name.trim()) {
          throw new Error('Informe o seu nome');
        }
        const res = await api.auth.register(name.trim(), email.trim(), password);
        sound.playConnect();
        onSuccess(res.user, res.defaultWorkspaceId);
      } else {
        const res = await api.auth.login(email.trim(), password);
        sound.playConnect();
        onSuccess(res.user, res.defaultWorkspaceId);
      }
      onClose();
    } catch (err: any) {
      sound.playDelete();
      setErrorMessage(err.message || 'Erro ao autenticar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 overflow-hidden transition-all ${
          theme === 'dark'
            ? 'bg-[#15161b] border-[#262833] text-neutral-100 shadow-emerald-500/5'
            : 'bg-white border-neutral-200 text-neutral-800 shadow-neutral-900/10'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'text-neutral-400 hover:text-white hover:bg-white/10'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <span className="font-black text-2xl text-black tracking-tighter">P</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Pampo Board Cloud</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Seus quadros infinitos, mídias e conexões sincronizados no MongoDB
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          className={`flex rounded-xl p-1 mb-5 border ${
            theme === 'dark' ? 'bg-[#0c0d12] border-[#262833]' : 'bg-neutral-100 border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'login'
                ? theme === 'dark'
                  ? 'bg-neutral-800 text-white shadow'
                  : 'bg-white text-neutral-900 shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'register'
                ? theme === 'dark'
                  ? 'bg-neutral-800 text-white shadow'
                  : 'bg-white text-neutral-900 shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                Seu Nome Completo
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Wesley Freitas"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-[#0c0d12] border-[#262833] text-white focus:border-emerald-500'
                      : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email@pampo.tech"
                className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-[#0c0d12] border-[#262833] text-white focus:border-emerald-500'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              Senha {tab === 'register' && <span className="text-neutral-500 font-normal">(mínimo 6 caracteres)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition-all ${
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
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>{tab === 'login' ? 'Entrar no PampoBoard' : 'Criar Conta e Iniciar'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest fallback option */}
        <div className="mt-5 pt-4 border-t border-neutral-500/10 text-center">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-[11px] text-neutral-400 hover:text-emerald-400 transition-colors"
          >
            Continuar sem login (Modo Convidado Offline) →
          </button>
        </div>
      </div>
    </div>
  );
};
