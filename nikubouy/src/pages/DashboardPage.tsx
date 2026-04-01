import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import RecordList from '../components/Record/RecordList';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const recordsRef = collection(db, "users", user!.uid, "records");
        const q = query(recordsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedRecords = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setRecords(fetchedRecords);
      } catch (err) {
        console.error("Error fetching records:", err);
        setError("記録の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  if (loading) {
    return <div className="text-center p-8 text-ie-cream">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-ie-red">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-ie-black text-ie-cream p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b-2 border-ie-red pb-4">
          <h1 className="text-3xl font-bold text-ie-gold">記録一覧</h1>
          <button 
            onClick={() => navigate('/records/new')}
            className="bg-ie-red text-white px-4 py-2 rounded hover:opacity-80 transition"
          >
            新しく記録する
          </button>
        </div>

        {records.length === 0 ? (
          <div className="text-center text-ie-cream opacity-70 py-12">
            まだ記録がありません。「新しく記録する」ボタンから追加しましょう。
          </div>
        ) : (
          <RecordList records={records} />
        )}
      </div>
    </div>
  );
};
