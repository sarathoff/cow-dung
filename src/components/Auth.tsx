
import React, { useState } from 'react';

interface AuthProps {
  role: string;
  handleAuth: (password: string) => void;
  t: any;
}

const Auth: React.FC<AuthProps> = ({ role, handleAuth, t }) => {
  const [password, setPassword] = useState('');

  return (
    <div className="container">
      <h2>
        {t.enter} {role} {t.password}
      </h2>
      <input
        type="password"
        placeholder={t.password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-field"
      />
      <button onClick={() => handleAuth(password)} className="submit-button">
        {t.enter}
      </button>
    </div>
  );
};

export default Auth;
