import React, { useState } from 'react';
import { X, Camera, Upload, Trash2, Check, User, Mail, RotateCcw } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        sound.playConnect();
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = () => {
    sound.playClick();
    setAvatar(user.avatar || '');
  };

  const handleRemovePhoto = () => {
    sound.playDelete();
    setAvatar('');
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
            <p className="text-xs text-neutral-400 m-0">Personalize seu nome e foto de exibição no PampoBoard</p>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-xl shadow-indigo-500/15 bg-neutral-800 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-neutral-400" />
              )}
            </div>

            <label
              htmlFor="avatar-file-input"
              title="Carregar foto do computador"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-95"
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

          {/* Action buttons below avatar */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="avatar-file-input"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/30 cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Carregar foto</span>
            </label>

            {avatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover</span>
              </button>
            )}

            {avatar !== user.avatar && user.avatar && (
              <button
                type="button"
                onClick={handleResetToDefault}
                title="Voltar para a foto do login"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Foto original</span>
              </button>
            )}
          </div>
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

          {/* Email (Read-only) */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-400">
              E-mail da Conta
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-white/5 bg-white/[0.03] text-neutral-400 font-mono">
              <Mail className="w-3.5 h-3.5 text-neutral-500" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>

          {/* Hint */}
          <div className="p-3 rounded-xl border border-indigo-500/15 bg-indigo-500/5 text-[11px] text-neutral-400 leading-relaxed flex items-start gap-2">
            <span className="text-indigo-400 font-bold shrink-0">💡</span>
            <span>
              Sua foto do Google ou GitHub é puxada automaticamente por padrão. Se desejar, você pode enviar qualquer foto do seu computador acima.
            </span>
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
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
