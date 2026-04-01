import { useNavigate } from "react-router-dom";
import { RecordForm } from "../components/Record/RecordForm";

export default function NewRecordPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ie-black px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b-2 border-ie-red pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ie-cream tracking-wider">
              🍜 新しい記録
            </h1>
            <p className="text-ie-gold text-sm mt-1">新品種を登録する</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-ie-cream hover:text-ie-gold transition-colors text-sm border border-ie-cream/30 rounded px-3 py-1"
          >
            ← 戻る
          </button>
        </div>

        {/* フォーム */}
        <RecordForm onSuccess={() => navigate("/dashboard")} />
      </div>
    </div>
  );
}
