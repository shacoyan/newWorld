import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ type = 'main', title }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '';

  return (
    <header className="header">
      {type === 'main' ? (
        <>
          <div className="header-left">
            <a href="/" className="logo-link">Logo</a>
          </div>
          <div className="header-right">
            <div className="user-chip">
              <span className="user-chip-initial">{initial}</span>
              <span className="user-chip-name">{displayName}</span>
            </div>
            <button className="btn-icon btn-stats" onClick={() => navigate('/stats')} aria-label="統計">統計</button>
            <button className="btn-icon btn-settings" onClick={() => navigate('/settings')} aria-label="設定">設定</button>
          </div>
        </>
      ) : (
        <>
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate(-1)}>← 戻る</button>
          </div>
          <h1 className="header-title">{title}</h1>
          <div className="header-right">
            <div className="user-chip-small">
              <span className="user-chip-initial">{initial}</span>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
