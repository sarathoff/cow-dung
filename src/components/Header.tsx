
import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  role: string | null;
  setRole: (role: string) => void;
  lang: string;
  setLang: (lang: 'en' | 'ta' | 'hi' | 'te' | 'kn') => void;
  t: any;
}

const Header: React.FC<HeaderProps> = ({ role, setRole, lang, setLang, t }) => {
  return (
    <div className="header">
      <h1 className="title">🐮 {t.title}</h1>
      <div className="top-bar">
        <div className="nav-buttons">
          <button
            onClick={() => setRole('farmer')}
            className={`nav-button ${role === 'farmer' ? 'active' : ''}`}
          >
            {t.farmer}
          </button>
          <button
            onClick={() => setRole('collector')}
            className={`nav-button ${role === 'collector' ? 'active' : ''}`}
          >
            {t.collector}
          </button>
          <button
            onClick={() => setRole('owner')}
            className={`nav-button ${role === 'owner' ? 'active' : ''}`}
          >
            {t.owner}
          </button>
        </div>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>
    </div>
  );
};

export default Header;
