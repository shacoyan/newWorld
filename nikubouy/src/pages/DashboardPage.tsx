import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { NikuRecord } from "../types";
import RecordList from "../components/Record/RecordList";

export default function DashboardPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<NikuRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchRecords = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (fetchError) {
        setError("記録の取得に失敗しました: " + fetchError.message);
      } else {
        setRecords(data ?? []);
      }
      setLoading(false);
    };

    fetchRecords();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ie-black">
        <p className="text-ie-cream text-lg">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ie-black px-4 py-8">
      {/* ヘッダー */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between border-b-2 border-ie-red pb-4">
          <div>
            <h1 className="text-3xl font-bold text-ie-cream tracking-wider">
              🍜 肉棒家
            </h1>
            <p className="text-ie-gold text-sm mt-1">自家製麺の記録帳</p>
          </div>
          <Link
            to="/new"
            className="bg-ie-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition-colors shadow-lg"
          >
            ＋ 新しく記録する
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-ie-red border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-ie-cream text-lg">麺を茹でています...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-ie-red rounded-lg p-6 text-center">
            <p className="text-red-300 text-lg mb-2">❌ エラーが発生しました</p>
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-ie-red hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
            >
              再読み込み
            </button>
          </div>
        )}

        {!loading && !error && <RecordList records={records} />}
      </main>
    </div>
  );
}
