import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { NikuRecord } from "../types";

const CURVATURE_LABELS: Record<string, string> = {
  上反り: "⬆️ 上反り",
  まっすぐ: "↕️ まっすぐ",
  下反り: "⬇️ 下反り",
  左反り: "⬅️ 左反り",
  右反り: "➡️ 右反り",
};

const GLANS_LABELS: Record<string, string> = {
  小: "小さめ",
  普通: "普通",
  大: "大きめ",
};

const FORESKIN_LABELS: Record<string, string> = {
  なし: "なし",
  仮性: "仮性",
  真性: "真性",
};

const HAIR_LABELS: Record<string, string> = {
  なし: "なし",
  少し: "少し",
  普通: "普通",
  濃い: "濃い",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-ie-gold text-lg">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= rating ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-ie-cream/10">
      <span className="text-ie-cream/60 text-sm">{label}</span>
      <span className="text-ie-cream font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<NikuRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchRecord = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("records")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        setError("記録が見つかりませんでした");
      } else {
        setRecord(data);
      }
      setLoading(false);
    };

    fetchRecord();
  }, [id]);

  const handleDelete = async () => {
    if (!record || !confirm("この記録を削除しますか？")) return;

    setDeleting(true);
    const { error: deleteError } = await supabase
      .from("records")
      .delete()
      .eq("id", record.id);

    if (deleteError) {
      alert("削除に失敗しました: " + deleteError.message);
      setDeleting(false);
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ie-black">
        <div className="w-12 h-12 border-4 border-ie-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ie-black px-4">
        <p className="text-red-400 text-xl mb-4">{error ?? "記録が見つかりません"}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-ie-red hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
        >
          ダッシュボードへ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ie-black px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b-2 border-ie-red pb-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-ie-cream hover:text-ie-gold transition-colors text-sm border border-ie-cream/30 rounded px-3 py-1"
          >
            ← 一覧へ戻る
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/record/${record.id}/edit`)}
              className="bg-ie-gold/20 hover:bg-ie-gold/30 text-ie-gold border border-ie-gold/40 py-2 px-4 rounded text-sm font-bold transition-colors"
            >
              ✏️ 編集
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-500/40 py-2 px-4 rounded text-sm font-bold transition-colors disabled:opacity-50"
            >
              {deleting ? "削除中..." : "🗑️ 削除"}
            </button>
          </div>
        </div>

        {/* メインカード */}
        <div className="bg-ie-black border-2 border-ie-red rounded-lg p-6 shadow-lg">
          {/* タイトルエリア */}
          <div className="text-center border-b border-ie-red/50 pb-4 mb-4">
            <h2 className="text-2xl font-bold text-ie-cream tracking-wider">
              🍜 {record.nickname}
            </h2>
            <p className="text-ie-gold text-sm mt-1">{record.date}</p>
            {record.overall_rating && <StarRating rating={record.overall_rating} />}
          </div>

          {/* サイズセクション */}
          <div className="mb-6">
            <h3 className="text-ie-red font-bold text-sm mb-2 border-l-2 border-ie-red pl-2">
              サイズ
            </h3>
            <div className="bg-ie-black/50 border border-ie-cream/10 rounded p-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-ie-cream/50 text-xs">長さ</p>
                <p className="text-ie-cream text-xl font-bold">
                  {record.length_cm ? `${record.length_cm} cm` : "—"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-ie-cream/50 text-xs">太さ</p>
                <p className="text-ie-cream text-xl font-bold">
                  {record.girth_cm ? `${record.girth_cm} cm` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* 詳細セクション */}
          <div className="mb-6">
            <h3 className="text-ie-red font-bold text-sm mb-2 border-l-2 border-ie-red pl-2">
              詳細
            </h3>
            <div className="bg-ie-black/50 border border-ie-cream/10 rounded p-4">
              <DetailRow
                label="反り"
                value={record.curvature ? CURVATURE_LABELS[record.curvature] : null}
              />
              <DetailRow
                label="カリサイズ"
                value={record.glans_size ? GLANS_LABELS[record.glans_size] : null}
              />
              <DetailRow
                label="包皮"
                value={record.foreskin ? FORESKIN_LABELS[record.foreskin] : null}
              />
              <DetailRow label="色" value={record.color} />
              <DetailRow
                label="毛量"
                value={record.hair_care ? HAIR_LABELS[record.hair_care] : null}
              />
            </div>
          </div>

          {/* ノートセクション */}
          {record.texture_notes && (
            <div className="mb-6">
              <h3 className="text-ie-red font-bold text-sm mb-2 border-l-2 border-ie-red pl-2">
                食感メモ
              </h3>
              <div className="bg-ie-black/50 border border-ie-cream/10 rounded p-4">
                <p className="text-ie-cream/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {record.texture_notes}
                </p>
              </div>
            </div>
          )}

          {record.memory_notes && (
            <div className="mb-6">
              <h3 className="text-ie-red font-bold text-sm mb-2 border-l-2 border-ie-red pl-2">
                想い出
              </h3>
              <div className="bg-ie-black/50 border border-ie-cream/10 rounded p-4">
                <p className="text-ie-cream/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {record.memory_notes}
                </p>
              </div>
            </div>
          )}

          {/* フッター */}
          <div className="text-center text-ie-cream/30 text-xs mt-4 pt-4 border-t border-ie-cream/10">
            作成: {new Date(record.created_at).toLocaleString("ja-JP")}
            {record.updated_at !== record.created_at && (
              <> | 更新: {new Date(record.updated_at).toLocaleString("ja-JP")}</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
