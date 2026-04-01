import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="bg-ie-black border-ie-red border-b-2">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-['Noto_Serif_JP'] font-black text-ie-cream text-2xl tracking-wider">
          肉棒家
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-ie-cream hover:text-ie-gold transition-colors text-sm font-medium"
          >
            ダッシュボード
          </Link>
          <button
            onClick={handleSignOut}
            className="bg-transparent border border-ie-red text-ie-cream hover:bg-ie-red hover:text-ie-black transition-colors text-sm px-3 py-1 rounded"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
