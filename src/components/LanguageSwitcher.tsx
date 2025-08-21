
import React from 'react';

interface LanguageSwitcherProps {
  lang: string;
  setLang: (lang: 'en' | 'ta' | 'hi' | 'te' | 'kn') => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ lang, setLang }) => {
  return (
    <select
      className="lang-select"
      value={lang}
      onChange={(e) => setLang(e.target.value as any)}
    >
      <option value="en">English</option>
      <option value="ta">தமிழ் (Tamil)</option>
      <option value="hi">हिन्दी (Hindi)</option>
      <option value="te">తెలుగు (Telugu)</option>
      <option value="kn">ಕನ್ನಡ (Kannada)</option>
    </select>
  );
};

export default LanguageSwitcher;
