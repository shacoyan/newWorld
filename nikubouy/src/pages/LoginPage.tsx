import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "ログインに失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ie-black px-4">
      <div className="w-full max-w-md p-8 bg-gray-900 border-2 border-ie-red rounded-lg shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ie-cream mb-2 tracking-wider">
            濃厚家系
          </h1>
          <p className="text-ie-red text-lg">千年眠りし古城へようこそ</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-ie-red text-red-300 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-ie-cream mb-2 font-semibold">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 text-ie-cream border border-gray-700 rounded focus:outline-none focus:border-ie-red transition-colors"
              placeholder="example@blood-castle.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-ie-cream mb-2 font-semibold">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 text-ie-cream border border-gray-700 rounded focus:outline-none focus:border-ie-red transition-colors"
              placeholder="****************"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-ie-red text-white font-bold rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "侵入中..." : "城門を開く（ログイン）"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          初めての来訪者は{" "}
          <a href="/signup" className="text-ie-red hover:underline">
            ここから入城（新規登録）
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
