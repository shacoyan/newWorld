import { useNavigate } from "react-router-dom";
import type { NikuRecord } from "../../types";

interface RecordCardProps {
  record: NikuRecord;
}

export default function RecordCard({ record }: RecordCardProps) {
  const navigate = useNavigate();

  const stars = record.overall_rating
    ? "★".repeat(record.overall_rating) + "☆".repeat(5 - record.overall_rating)
    : "☆☆☆☆☆";

  return (
    <button
      onClick={() => navigate(`/record/${record.id}`)}
      className="w-full text-left bg-ie-black border-2 border-ie-red rounded-lg p-4 
        hover:border-ie-gold hover:shadow-lg hover:shadow-ie-red/20 
        transition-all duration-200 group cursor-pointer"
    >
      {/* 店名風ヘッダー */}
      <div className="border-b border-ie-red/40 pb-2 mb-3">
        <h3 className="text-ie-cream text-lg font-bold tracking-wider group-hover:text-ie-gold transition-colors truncate">
          🍜 {record.nickname}
        </h3>
        <p className="text-ie-cream/40 text-xs mt-0.5">{record.date}</p>
      </div>

      {/* 評価 */}
      <div className="mb-3">
        <span className="text-ie-gold text-sm tracking-wider">{stars}</span>
      </div>

      {/* サイズ表示 */}
      <div className="flex gap-3">
        {record.length_cm != null && (
          <div className="flex-1 bg-ie-cream/5 border border-ie-cream/10 rounded px-3 py-2 text-center">
            <p className="text-ie-cream/40 text-[10px] uppercase tracking-wider">長さ</p>
            <p className="text-ie-cream font-bold text-lg leading-tight">
              {record.length_cm}
              <span className="text-xs font-normal ml-0.5">cm</span>
            </p>
          </div>
        )}
        {record.girth_cm != null && (
          <div className="flex-1 bg-ie-cream/5 border border-ie-cream/10 rounded px-3 py-2 text-center">
            <p className="text-ie-cream/40 text-[10px] uppercase tracking-wider">太さ</p>
            <p className="text-ie-cream font-bold text-lg leading-tight">
              {record.girth_cm}
              <span className="text-xs font-normal ml-0.5">cm</span>
            </p>
          </div>
        )}
        {record.length_cm == null && record.girth_cm == null && (
          <p className="text-ie-cream/30 text-xs">サイズ未記録</p>
        )}
      </div>

      {/* タグ */}
      {(record.curvature || record.glans_size || record.foreskin) && (
        <div className="flex flex-wrap gap-1 mt-3">
          {record.curvature && (
            <span className="bg-ie-red/20 text-ie-cream/70 text-[10px] px-2 py-0.5 rounded-full border border-ie-red/30">
              {record.curvature}
            </span>
          )}
          {record.glans_size && (
            <span className="bg-ie-red/20 text-ie-cream/70 text-[10px] px-2 py-0.5 rounded-full border border-ie-red/30">
              カリ{record.glans_size}
            </span>
          )}
          {record.foreskin && (
            <span className="bg-ie-red/20 text-ie-cream/70 text-[10px] px-2 py-0.5 rounded-full border border-ie-red/30">
              {record.foreskin}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
