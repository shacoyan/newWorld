import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(signUpError.message || '登録に失敗しました');
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch {
      setError('予期せぬエラーが発生しました');
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

      {/* 成功表示 */}
      {success && (
        <div className="border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          登録完了！確認メールをご確認ください。ダッシュボードへ遷移します...
        </div>
      )}

      {/* メールアドレス */}
      <div>
        <label
          htmlFor="signup-email"
          className="mb-2 block text-sm tracking-wider text-ie-cream/80"
        >
          メールアドレス
        </label>
        <input
          id="signup-email"
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
          htmlFor="signup-password"
          className="mb-2 block text-sm tracking-wider text-ie-cream/80"
        >
          パスワード
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="6文字以上"
          className="w-full border border-ie-cream/20 bg-ie-black px-4 py-3 text-ie-cream placeholder:text-ie-cream/30 focus:border-ie-red focus:outline-none focus:ring-1 focus:ring-ie-red"
        />
      </div>

      {/* パスワード確認 */}
      <div>
        <label
          htmlFor="signup-confirm-password"
          className="mb-2 block text-sm tracking-wider text-ie-cream/80"
        >
          パスワード（確認）
        </label>
        <input
          id="signup-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="パスワードを再入力"
          className="w-full border border-ie-cream/20 bg-ie-black px-4 py-3 text-ie-cream placeholder:text-ie-cream/30 focus:border-ie-red focus:outline-none focus:ring-1 focus:ring-ie-red"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full border-2 border-ie-red bg-ie-red py-4 text-lg font-bold tracking-widest text-white transition-all duration-300 hover:bg-transparent hover:text-ie-red disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? '登録中...' : '新規登録'}
      </button>

      {/* ログインリンク */}
      <p className="text-center text-sm text-ie-cream/60">
        すでにアカウントをお持ちの方は{' '}
        <Link
          to="/login"
          className="text-ie-red underline decoration-ie-red/50 transition-colors hover:text-ie-red/80"
        >
          ログイン
        </Link>
      </p>
    </form>
  );
}
