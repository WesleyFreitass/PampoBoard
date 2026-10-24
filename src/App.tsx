import React, { useState, useEffect } from 'react';
import { useBoardStore } from './stores/useBoardStore';
import { InfiniteCanvas } from './components/canvas/InfiniteCanvas';
import { FloatingDock } from './components/navigation/FloatingDock';
import { TopHeader } from './components/navigation/TopHeader';
import { SidebarRail } from './components/navigation/SidebarRail';
import { ProjectsDrawer } from './components/navigation/ProjectsDrawer';
import { SettingsDrawer } from './components/navigation/SettingsDrawer';
import { TrashDrawer } from './components/navigation/TrashDrawer';
import { HistoryDrawer } from './components/navigation/HistoryDrawer';
import { SelectionBar } from './components/navigation/SelectionBar';
import { MiniMap } from './components/navigation/MiniMap';
import { CommandPalette } from './components/modals/CommandPalette';
import { SummaryModal } from './components/modals/SummaryModal';
import { ExportImportModal } from './components/modals/ExportImportModal';
import { MediaExpandModal } from './components/modals/MediaExpandModal';
import { SubBoardModal } from './components/modals/SubBoardModal';
import { AuthModal } from './components/modals/AuthModal';
import { ShareModal } from './components/modals/ShareModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { LandingPage } from './components/landing/LandingPage';
import { BoardCard } from './types/board';
import { ChevronsRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const store = useBoardStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'boards' | 'settings' | 'trash' | 'history'>('boards');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [selectedSubBoardCard, setSelectedSubBoardCard] = useState<BoardCard | null>(null);
  const [publicView, setPublicView] = useState<'landing' | 'auth'>('landing');
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');

  // Check for URL query params (auth intent or OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get('auth');
    if (authParam === 'login' || authParam === 'register') {
      setAuthInitialTab(authParam);
      setPublicView('auth');
    }
  }, []);

  // Check for OAuth callback in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('oauth_token');
    const userJson = params.get('oauth_user');
    const defaultWs = params.get('default_ws');

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        localStorage.setItem('pampo_auth_token', token);
        localStorage.setItem('pampo_auth_user', JSON.stringify(user));
        window.history.replaceState({}, document.title, window.location.pathname);
        store.login(user, defaultWs || undefined);
      } catch (err) {
        console.error('Failed to parse OAuth response:', err);
      }
    }
  }, [store]);

  const handleOpenExecutiveSummary = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.2 },
    });
    setIsSummaryModalOpen(true);
  };

  const expandedCard = store.cards.find((c) => c.id === expandedCardId) || null;
  const currentWorkspace = store.workspaces.find((w) => w.id === store.activeWorkspaceId) || store.workspaces[0];

  const sidebarOffset = isDrawerOpen ? 300 : 80;

  // If user is not authenticated, show Landing Page or Auth Screen
  if (!store.isAuthenticated) {
    if (publicView === 'auth') {
      return (
        <AuthScreen
          theme={store.theme}
          initialTab={authInitialTab}
          onToggleTheme={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
          onBackToLanding={() => setPublicView('landing')}
          onSuccess={(user, defaultWsId) => {
            store.login(user, defaultWsId);
          }}
        />
      );
    }

    return (
      <LandingPage
        theme={store.theme}
        onToggleTheme={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
        onOpenLogin={() => {
          setAuthInitialTab('login');
          setPublicView('auth');
        }}
        onOpenRegister={() => {
          setAuthInitialTab('register');
          setPublicView('auth');
        }}
        onExploreGuest={() => {
          store.login({
            id: 'guest',
            name: 'Visitante',
            email: 'guest@pampoboard.local',
            avatar: '/pampo-logo.png',
            role: 'guest',
          });
        }}
      />
    );
  }

  return (
    <div
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none ${
        store.theme === 'dark' ? 'dark text-neutral-100 bg-[#0c0d12]' : 'text-neutral-900 bg-[#f8fafc]'
      }`}
    >
      {/* 64px Leftmost Icon Rail */}
      <SidebarRail
        activeTab={activeSidebarTab}
        onSelectTab={setActiveSidebarTab}
        theme={store.theme}
        onToggleTheme={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        user={store.user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={store.logout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        itemsCount={store.currentCards.length}
      />

      {/* 220px Dynamic Sidebar Drawer according to activeSidebarTab */}
      {activeSidebarTab === 'boards' && (
        <ProjectsDrawer
          workspaces={store.workspaces}
          activeWorkspaceId={store.activeWorkspaceId}
          onSelectWorkspace={store.switchWorkspace}
          onCreateWorkspace={store.createWorkspace}
          onDeleteWorkspace={store.deleteWorkspace}
          isOpen={isDrawerOpen}
          onToggle={() => setIsDrawerOpen(false)}
          theme={store.theme}
          cardsCount={store.currentCards.length}
          connectionsCount={store.currentConnections.length}
        />
      )}

      {activeSidebarTab === 'settings' && (
        <SettingsDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          theme={store.theme}
          isSnappingEnabled={store.isSnappingEnabled}
          onToggleSnapping={() => store.setIsSnappingEnabled(!store.isSnappingEnabled)}
          onResetDefault={store.resetToDefault}
        />
      )}

      {activeSidebarTab === 'trash' && (
        <TrashDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          archivedCards={store.cards.filter((c) => c.status === 'archived')}
          onRestoreCard={(id) => store.restoreCard(id)}
          onPermanentlyDeleteCard={(id) => store.permanentlyDeleteCard(id)}
          onEmptyTrash={store.emptyTrash}
          theme={store.theme}
        />
      )}

      {activeSidebarTab === 'history' && (
        <HistoryDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          canUndo={store.canUndo}
          canRedo={store.canRedo}
          onUndo={store.undo}
          onRedo={store.redo}
          lastSavedTimestamp={store.lastSavedTimestamp}
          theme={store.theme}
        />
      )}

      {/* Re-expand pill when drawer is collapsed */}
      {!isDrawerOpen && (
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          title="Expandir lista de Projetos (>>)"
          className="fixed top-4 left-20 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-800 shadow-xl backdrop-blur-xl text-xs font-mono transition-transform hover:scale-105"
        >
          <ChevronsRight className="w-4 h-4 text-emerald-400" />
          <span>Projetos</span>
        </button>
      )}

      {/* Top Navigation & Brand Header */}
      <TopHeader
        store={store}
        leftOffset={sidebarOffset}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Infinite Canvas Engine */}
      <InfiniteCanvas
        store={store}
        onOpenExpandMedia={(id) => setExpandedCardId(id)}
        onOpenSubBoard={(card) => store.navigateToBoard(card.id, card.title)}
      />

      {/* Assistant Selection Action Bar (Appears when 2+ cards selected) */}
      <SelectionBar
        store={store}
        onOpenExecutiveSummary={handleOpenExecutiveSummary}
      />

      {/* Floating Bottom Toolbar Dock */}
      <FloatingDock store={store} />

      {/* Canvas Radar Minimap */}
      <MiniMap store={store} />

      {/* Modals */}
      <CommandPalette
        store={store}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <SummaryModal
        store={store}
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
      />

      <ExportImportModal
        store={store}
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
      />

      <MediaExpandModal
        card={expandedCard}
        isOpen={expandedCardId !== null}
        onClose={() => setExpandedCardId(null)}
      />

      <SubBoardModal
        card={selectedSubBoardCard}
        isOpen={selectedSubBoardCard !== null}
        onClose={() => setSelectedSubBoardCard(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user, defaultWsId) => {
          store.login(user, defaultWsId);
        }}
        theme={store.theme}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        workspaceId={store.activeWorkspaceId}
        workspaceTitle={currentWorkspace?.title || 'Quadro Pampo'}
        isPublic={currentWorkspace?.isPublic}
        shareToken={currentWorkspace?.shareToken}
        onTogglePublic={(isPub) => store.toggleWorkspacePublic(store.activeWorkspaceId, isPub)}
        theme={store.theme}
      />

      {store.user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={store.user}
          onUpdateProfile={store.updateUserProfile}
          theme={store.theme}
        />
      )}
    </div>
  );
}

export default App;
