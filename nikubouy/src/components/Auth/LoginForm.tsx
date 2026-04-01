import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div className="border border-ie-red/50 bg-ie-red/10 px-4 py-3 text-sm text-ie-red">
          {error}
        </div>
      )}

      {/* メールアドレス */}
      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm tracking-wider text-ie-cream/80"
        >
          メールアドレス
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="email@example.com"
          className="w-full border border-ie-cream/20 bg-ie-black px-4 py-3 text-ie-cream placeholder:text-ie-cream/30 focus:border-ie-red focus:outline-none focus:ring-1 focus:ring-ie-red"
        />
      </div>

      {/* パスワード */}
      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm tracking-wider text-ie-cream/80"
        >
          パスワード
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="パスワードを入力"
          className="w-full border border-ie-cream/20 bg-ie-black px-4 py-3 text-ie-cream placeholder:text-ie-cream/30 focus:border-ie-red focus:outline-none focus:ring-1 focus:ring-ie-red"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full border-2 border-ie-red bg-ie-red py-4 text-lg font-bold tracking-widest text-white transition-all duration-300 hover:bg-transparent hover:text-ie-red disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </button>

      {/* 新規登録リンク */}
      <p className="text-center text-sm text-ie-cream/60">
        アカウントをお持ちでない方は{' '}
        <Link
          to="/signup"
          className="text-ie-red underline decoration-ie-red/50 transition-colors hover:text-ie-red/80"
        >
          新規登録
        </Link>
      </p>
    </form>
  );
}
