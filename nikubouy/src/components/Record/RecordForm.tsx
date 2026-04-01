import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import type { NikuRecord } from "../../types";

interface RecordFormProps {
  id?: string;
  onSuccess: () => void;
}

const CURVATURE_OPTIONS = ["上反り", "まっすぐ", "下反り", "左反り", "右反り"] as const;
const GLANS_OPTIONS = ["小", "普通", "大"] as const;
const FORESKIN_OPTIONS = ["なし", "仮性", "真性"] as const;
const HAIR_OPTIONS = ["なし", "少し", "普通", "濃い"] as const;

type FormData = Omit<NikuRecord, "id" | "user_id" | "created_at" | "updated_at">;

const initialFormData: FormData = {
  nickname: "",
  date: new Date().toISOString().slice(0, 10),
  length_cm: undefined,
  girth_cm: undefined,
  curvature: undefined,
  glans_size: undefined,
  foreskin: undefined,
  color: "",
  hair_care: undefined,
  texture_notes: "",
  overall_rating: undefined,
  memory_notes: "",
};

export default function RecordForm({ id, onSuccess }: RecordFormProps) {
  const { user } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  // 編集モード: 既存データを取得
  useEffect(() => {
    if (!id) return;

    const fetchRecord = async () => {
      setFetching(true);
      const { data, error: fetchError } = await supabase
        .from("records")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError("記録の取得に失敗しました");
      } else {
        setFormData({
          nickname: data.nickname ?? "",
          date: data.date ?? "",
          length_cm: data.length_cm ?? null,
          girth_cm: data.girth_cm ?? null,
          curvature: data.curvature ?? null,
          glans_size: data.glans_size ?? null,
          foreskin: data.foreskin ?? null,
          color: data.color ?? "",
          hair_care: data.hair_care ?? null,
          texture_notes: data.texture_notes ?? "",
          overall_rating: data.overall_rating ?? null,
          memory_notes: data.memory_notes ?? "",
        });
      }
      setFetching(false);
    };

    fetchRecord();
  }, [id]);

  const handleChange = (
    field: keyof FormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("ログインが必要です");
      return;
    }

    if (!formData.nickname.trim()) {
      setError("ニックネームは必須です");
      return;
    }

    if (!formData.date) {
      setError("日付は必須です");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      nickname: formData.nickname.trim(),
      date: formData.date,
      length_cm: formData.length_cm || null,
      girth_cm: formData.girth_cm || null,
      curvature: formData.curvature || null,
      glans_size: formData.glans_size || null,
      foreskin: formData.foreskin || null,
      color: formData.color?.trim() || null,
      hair_care: formData.hair_care || null,
      texture_notes: formData.texture_notes?.trim() || null,
      overall_rating: formData.overall_rating || null,
      memory_notes: formData.memory_notes?.trim() || null,
    };

    let submitError;

    if (isEdit) {
      // UPDATE
      const { error: updateError } = await supabase
        .from("records")
        .update(payload)
        .eq("id", id!);
      submitError = updateError;
    } else {
      // INSERT
      const { error: insertError } = await supabase
        .from("records")
        .insert({ ...payload, user_id: user.id });
      submitError = insertError;
    }

    if (submitError) {
      setError(
        (isEdit ? "更新" : "作成") + "に失敗しました: " + submitError.message
      );
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-ie-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-900/40 border border-ie-red rounded p-3 text-red-300 text-sm">
          ❌ {error}
        </div>
      )}

      {/* ニックネーム */}
      <FormField label="ニックネーム" required>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => handleChange("nickname", e.target.value)}
          placeholder="例: 太麺太郎"
          className="w-full bg-ie-black border border-ie-cream/20 rounded px-3 py-2 
            text-ie-cream placeholder-ie-cream/30 focus:border-ie-gold focus:outline-none transition-colors"
        />
      </FormField>

      {/* 日付 */}
      <FormField label="日付" required>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="w-full bg-ie-black border border-ie-cream/20 rounded px-3 py-2 
            text-ie-cream focus:border-ie-gold focus:outline-none transition-colors"
        />
      </FormField>

      {/* サイズセクション */}
      <SectionTitle label="サイズ" />

      <div className="grid grid-cols-2 gap-4">
        <FormField label="長さ (cm)">
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.length_cm ?? ""}
            onChange={(e) =>
              handleChange(
                "length_cm",
                e.target.value === "" ? null : parseFloat(e.target.value)
              )
            }
            placeholder="0.0"
            className="w-full bg-ie-black border border-ie-cream/20 rounded px-3 py-2 
              text-ie-cream placeholder-ie-cream/30 focus:border-ie-gold focus:outline-none transition-colors"
          />
        </FormField>

        <FormField label="太さ (cm)">
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.girth_cm ?? ""}
            onChange={(e) =>
              handleChange(
                "girth_cm",
                e.target.value === "" ? null : parseFloat(e.target.value)
              )
            }
            placeholder="0.0"
            className="w-full bg-ie-black border border-ie-cream/20 rounded px-3 py-2 
              text-ie-cream placeholder-ie-cream/30 focus:border-ie-gold focus:outline-none transition-colors"
          />
        </FormField>
      </div>

      {/* 詳細セクション */}
      <SectionTitle label="詳細" />

      {/* 反り */}
      <FormField label="反り">
        <RadioGroup
          name="curvature"
          options={CURVATURE_OPTIONS}
          value={formData.curvature ?? null}
          onChange={(val) => handleChange("curvature", val)}
        />
      </FormField>

      {/* カリサイズ */}
      <FormField label="カリサイズ">
        <RadioGroup
          name="glans_size"
          options={GLANS_OPTIONS}
          value={formData.glans_size ?? null}
          onChange={(val) => handleChange("glans_size", val)}
        />
      </FormField>

      {/* 包皮 */}
      <FormField label="包皮">
        <RadioGroup
          name="foreskin"
          options={FORESKIN_OPTIONS}
          value={formData.foreskin ?? null}
          onChange={(val) => handleChange("foreskin", val)}
        />
      </FormField>

      {/* 色 */}
      <FormField label="色">
        <input
          type="text"
          value={formData.color ?? ""}
          onChange={(e) => handleChange("color", e.target.value)}
          placeholder="例: ピンク、薄茶色など"
          className="w-full bg-ie-black border border-ie-cream/20 rounded px-3 py-2 
            text-ie-cream placeholder-ie-cream/30 focus:border-ie-gold focus:outline-none transition-colors"
        />
      </FormField>

      {/* 毛量 */}
      <FormField label="毛量">
        <RadioGroup
          name="hair_care"
          options={HAIR_OPTIONS}
          value={formData.hair_care ?? null}
          onChange={(val) => handleChange("hair_care", val)}
        />
      </FormField>

      {/* 評価セクション */}
      <SectionTitle label="評価" />

      <FormField label="総合評価">
        <StarRatingInput
          value={formData.overall_rating ?? null}
          onChange={(val) => handleChange("overall_rating", val)}
        />
      </FormField>

      {/* メモセクション */}
      <SectionTitle label="メモ" />

      <FormField label="食感メモ">
        <textarea
          value={formData.texture_notes ?? ""}
          onChange={(e) => handleChange("texture_notes", e.target.value)}
          placeholder="硬さ、弾力など..."
          rows={3}
          className="w-full bg-ie-black border border-ie-cream/20 rounded px-3 py-2 
            text-ie-cream placeholder-ie-cream/30 focus:border-ie-gold focus:outline-none 
            transition-colors resize-none"
        />
      </FormField>

      <FormField label="想い出">
        <textarea
          value={formData.memory_notes ?? ""}
          onChange={(e) => handleChange("memory_notes", e.target.value)}
          placeholder="自由に記録してください..."
          rows={4}
          className="w-full bg-ie-black border border-ie-cream/20 rounded px-3 py-2 
            text-ie-cream placeholder-ie-cream/30 focus:border-ie-gold focus:outline-none 
            transition-colors resize-none"
        />
      </FormField>

      {/* 送信ボタン */}
      <div className="pt-4 border-t border-ie-cream/10">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ie-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-bold py-3 px-6 rounded transition-colors text-lg tracking-wider"
        >
          {loading
            ? "処理中..."
            : isEdit
            ? "🍜 記録を更新する"
            : "🍜 記録を作成する"}
        </button>
      </div>
    </form>
  );
}

/* ===== サブコンポーネント ===== */

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-ie-cream/70 text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-ie-red ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="pt-2">
      <h3 className="text-ie-red font-bold text-sm border-l-2 border-ie-red pl-2">
        {label}
      </h3>
    </div>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly string[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label
          key={option}
          className={`
            cursor-pointer px-3 py-1.5 rounded text-sm border transition-colors
            ${
              value === option
                ? "bg-ie-red/30 border-ie-red text-ie-cream"
                : "bg-ie-black border-ie-cream/20 text-ie-cream/50 hover:border-ie-cream/40"
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="sr-only"
          />
          {option}
        </label>
      ))}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-ie-cream/30 text-xs underline self-center ml-1 hover:text-ie-cream/50"
        >
          クリア
        </button>
      )}
    </div>
  );
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(value === star ? null : star)}
          className="text-2xl transition-colors focus:outline-none"
        >
          <span
            className={
              (hover ?? value ?? 0) >= star
                ? "text-ie-gold"
                : "text-ie-cream/20"
            }
          >
            {(hover ?? value ?? 0) >= star ? "★" : "☆"}
          </span>
        </button>
      ))}
      {value && (
        <span className="text-ie-cream/40 text-sm ml-2">{value}/5</span>
      )}
    </div>
  );
}
