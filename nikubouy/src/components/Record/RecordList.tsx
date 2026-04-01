import type { NikuRecord } from "../../types";
import RecordCard from "./RecordCard";

interface RecordListProps {
  records: NikuRecord[];
}

export default function RecordList({ records }: RecordListProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🍜</div>
        <p className="text-ie-cream text-xl font-bold mb-2">
          まだ記録がありません
        </p>
        <p className="text-ie-cream/50 text-sm">
          「新しく記録する」ボタンから最初の記録を作成しましょう
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-ie-cream font-bold text-sm">
          📋 記録一覧
          <span className="text-ie-gold ml-2">({records.length}件)</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
}
