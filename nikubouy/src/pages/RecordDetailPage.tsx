import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

export const RecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;

    const fetchRecord = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "users", user!.uid, "records", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRecord({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("記録が見つかりませんでした。");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("記録の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [user, id]);

  const handleDelete = async () => {
    if (!user || !id || !window.confirm("この記録を削除しますか？")) return;
    
    try {
      const docRef = doc(db, "users", user!.uid, "records", id);
      await deleteDoc(docRef);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("削除に失敗しました。");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    return timestamp.toDate().toLocaleDateString("ja-JP");
  };

  if (loading) return <div className="text-center p-8 text-ie-cream">読み込み中...</div>;
  if (error) return <div className="text-center p-8 text-ie-red">{error}</div>;
  if (!record) return <div className="text-center p-8 text-ie-cream">データがありません。</div>;

  return (
    <div className="min-h-screen bg-ie-black text-ie-cream p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-ie-black border-2 border-ie-red p-6 rounded shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b border-ie-red pb-4">
          <h2 className="text-2xl font-bold text-ie-gold">{record.nickname} の記録</h2>
          <div className="flex gap-2">
            <Link 
              to={`/records/${id}/edit`} 
              className="bg-ie-cream text-ie-black px-4 py-2 rounded hover:opacity-80 transition"
            >
              編集
            </Link>
            <button 
              onClick={handleDelete} 
              className="bg-ie-red text-white px-4 py-2 rounded hover:opacity-80 transition"
            >
              削除
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div><span className="font-bold text-ie-gold">日付: </span>{formatDate(record.date)}</div>
          <div><span className="font-bold text-ie-gold">長さ: </span>{record.length ? `${record.length} cm` : "-"}</div>
          <div><span className="font-bold text-ie-gold">太さ: </span>{record.thickness ? `${record.thickness} cm` : "-"}</div>
          <div><span className="font-bold text-ie-gold">反り: </span>{record.curve || "-"}</div>
          <div><span className="font-bold text-ie-gold">カリサイズ: </span>{record.glansSize || "-"}</div>
          <div><span className="font-bold text-ie-gold">包皮: </span>{record.foreskin || "-"}</div>
          <div><span className="font-bold text-ie-gold">色: </span>{record.color || "-"}</div>
          <div><span className="font-bold text-ie-gold">毛量: </span>{record.hairAmount || "-"}</div>
          <div><span className="font-bold text-ie-gold">食感メモ: </span>{record.textureMemo || "-"}</div>
          <div><span className="font-bold text-ie-gold">評価: </span>{'★'.repeat(record.rating || 0)}{'☆'.repeat(5 - (record.rating || 0))}</div>
          <div><span className="font-bold text-ie-gold">思い出メモ: </span>{record.memoryMemo || "-"}</div>
          
          <div className="text-right text-sm opacity-60 pt-4">
            <div>作成日: {formatDate(record.createdAt)}</div>
            <div>更新日: {formatDate(record.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
