// src/App.tsx — Root application component with page routing

import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import InputPage from './pages/InputPage';
import ChatbotPage from './pages/ChatbotPage';
import SettingsPage from './pages/SettingsPage';

type Page = 'dashboard' | 'input' | 'chatbot' | 'config';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#0f0f1a',
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 60%)
        `,
      }}
    >
      <Sidebar activePage={activePage} onNavigate={(page) => setActivePage(page as Page)} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'input' && <InputPage />}
        {activePage === 'chatbot' && <ChatbotPage />}
        {activePage === 'config' && <SettingsPage />}
      </main>
    </div>
  );
}
