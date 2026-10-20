import React, { useState } from 'react';
import { X, Camera, Upload, Check, Sparkles, User, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { GithubIcon } from '../common/SocialIcons';
import { sound } from '../../utils/sound';
import { AuthUser } from '../../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onUpdateProfile: (data: { name?: string; avatar?: string }) => Promise<any>;
  theme: 'dark' | 'light';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  theme,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [githubUser, setGithubUser] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presets = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name || 'Pampo')}`,
    'https://api.dicebear.com/7.x/bottts/svg?seed=CyberPampo',
    'https://api.dicebear.com/7.x/bottts/svg?seed=GamerPro',
    'https://api.dicebear.com/7.x/bottts/svg?seed=ArchitectNova',
    'https://api.dicebear.com/7.x/bottts/svg?seed=NeonMatrix',
  ];

  const handleFetchGithub = async () => {
    if (!githubUser.trim()) {
      setErrorMessage('Digite seu nome de usuário do GitHub');
      return;
    }
    setErrorMessage(null);
    setIsFetchingGithub(true);
    try {
      sound.playClick();
      const clean = githubUser.trim();
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        setAvatar(data.avatar_url);
        if (!name.trim() && data.name) setName(data.name);
        sound.playConnect();
      } else {
        // Direct github cdn fallback
        setAvatar(`https://github.com/${encodeURIComponent(clean)}.png`);
        sound.playConnect();
      }
    } catch {
      setAvatar(`https://github.com/${encodeURIComponent(githubUser.trim())}.png`);
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        sound.playConnect();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      await onUpdateProfile({
        name: name.trim() || user.name,
        avatar: avatar.trim() || user.avatar,
      });
      sound.playConnect();
      setSuccessMessage('Perfil atualizado com sucesso!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      sound.playDelete();
      setErrorMessage(err.message || 'Erro ao salvar alterações de perfil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-[#15161b] border-[#262833] text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight m-0">Editar Perfil & Foto</h2>
            <p className="text-xs text-neutral-400 m-0">Personalize sua foto de exibição no PampoBoard</p>
          </div>
        </div>

        {/* Avatar Preview */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-xl shadow-indigo-500/20 bg-neutral-800 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-neutral-400" />
              )}
            </div>
            <label
              htmlFor="avatar-file-input"
              title="Carregar foto do computador"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer transition-all hover:scale-110"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <span className="text-[11px] text-neutral-400 mt-2 font-mono">
            {user.email}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-300">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-neutral-700 text-white focus:border-indigo-500'
                  : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* GitHub Photo Pull */}
          <div className="p-3 rounded-xl border border-white/5 bg-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
              <GithubIcon className="w-3.5 h-3.5 text-neutral-300" />
              <span>Puxar Foto do GitHub</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                placeholder="Ex: WesleyFreitass"
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs border outline-none font-mono ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-700 text-white focus:border-purple-500'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-purple-500'
                }`}
              />
              <button
                type="button"
                onClick={handleFetchGithub}
                disabled={isFetchingGithub}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-1.5"
              >
                {isFetchingGithub ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <span>Puxar</span>
                )}
              </button>
            </div>
          </div>

          {/* Direct URL input */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-300">
              Ou Link Direto da Foto (URL)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none font-mono ${
                    theme === 'dark'
                      ? 'bg-neutral-900 border-neutral-700 text-white focus:border-indigo-500'
                      : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Presets */}
          <div>
            <span className="block text-[11px] font-semibold mb-1.5 text-neutral-400">
              Modelos Rápidos de Avatar
            </span>
            <div className="flex items-center gap-2">
              {presets.map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAvatar(presetUrl);
                  }}
                  className={`w-9 h-9 rounded-full overflow-hidden border transition-transform hover:scale-110 ${
                    avatar === presetUrl ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-white/10'
                  }`}
                >
                  <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <span>Salvando...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Foto & Perfil</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
