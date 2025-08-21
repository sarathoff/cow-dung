
import React from 'react';

interface RoleSelectorProps {
  setRole: (role: string) => void;
  t: any;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ setRole, t }) => {
  return (
    <div className="container">
      <div className="header">
        <h1 className="title">🐮 {t.title}</h1>
      </div>
      <div className="role-selector">
        <button className="role-button" onClick={() => setRole('farmer')}>
          {t.farmer}
        </button>
        <button className="role-button" onClick={() => setRole('collector')}>
          {t.collector}
        </button>
        <button className="role-button" onClick={() => setRole('owner')}>
          {t.owner}
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;
