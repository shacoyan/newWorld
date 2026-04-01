import React, { useState, useEffect } from 'react';
import { addDoc, updateDoc, doc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { StarRating } from './StarRating';
import { RadioGroup } from './RadioGroup';

interface RecordFormProps {
  id?: string;
  initialData?: any;
  onSuccess: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({ id, initialData, onSuccess }) => {
  const { user } = useAuth();
  
  const getInitialFormData = () => ({
    nickname: initialData?.nickname || '',
    date: initialData?.date || '',
    length: initialData?.length ?? undefined,
    thickness: initialData?.thickness ?? undefined,
    curve: initialData?.curve ?? null,
    glansSize: initialData?.glansSize ?? null,
    foreskin: initialData?.foreskin ?? null,
    color: initialData?.color || '',
    hairAmount: initialData?.hairAmount ?? null,
    textureMemo: initialData?.textureMemo || '',
    rating: initialData?.rating ?? 0,
    memoryMemo: initialData?.memoryMemo || ''
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
  };

  const handleRadioChange = (name: string, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const recordsRef = collection(db, "users", user!.uid, "records");
      
      if (id) {
        // Update existing record
        const docRef = doc(db, "users", user!.uid, "records", id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new record
        await addDoc(recordsRef, {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      onSuccess();
    } catch (err) {
      console.error("Error saving record:", err);
      setError("保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full p-2 border-2 border-ie-red bg-transparent text-ie-cream rounded focus:outline-none focus:border-ie-gold";
  const labelClass = "block text-ie-gold mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-ie-black border-2 border-ie-red p-6 rounded shadow-lg space-y-6">
      {error && <div className="text-ie-red text-center mb-4">{error}</div>}
      
      <div>
        <label className={labelClass}>ニックネーム (必須)</label>
        <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>日付 (必須)</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>長さ</label>
          <input type="number" name="length" value={formData.length ?? ''} onChange={handleNumberChange} step="0.1" placeholder="cm" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>太さ</label>
          <input type="number" name="thickness" value={formData.thickness ?? ''} onChange={handleNumberChange} step="0.1" placeholder="cm" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>反り</label>
        <RadioGroup name="curve" value={formData.curve ?? null} onChange={(val) => handleRadioChange('curve', val)} options={['なし', '上', '下', '左', '右']} />
      </div>

      <div>
        <label className={labelClass}>カリサイズ</label>
        <RadioGroup name="glansSize" value={formData.glansSize ?? null} onChange={(val) => handleRadioChange('glansSize', val)} options={['小', '普通', '大']} />
      </div>

      <div>
        <label className={labelClass}>包皮</label>
        <RadioGroup name="foreskin" value={formData.foreskin ?? null} onChange={(val) => handleRadioChange('foreskin', val)} options={['剥き', '半剥き', '被り']} />
      </div>

      <div>
        <label className={labelClass}>色</label>
        <input type="text" name="color" value={formData.color} onChange={handleChange} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>毛量</label>
        <RadioGroup name="hairAmount" value={formData.hairAmount ?? null} onChange={(val) => handleRadioChange('hairAmount', val)} options={['少ない', '普通', '多い']} />
      </div>

      <div>
        <label className={labelClass}>食感メモ</label>
        <textarea name="textureMemo" value={formData.textureMemo} onChange={handleChange} className={`${inputClass} h-24`} />
      </div>

      <div>
        <label className={labelClass}>評価 ★</label>
        <StarRating rating={formData.rating} onRatingChange={handleRatingChange} />
      </div>

      <div>
        <label className={labelClass}>思い出メモ</label>
        <textarea name="memoryMemo" value={formData.memoryMemo} onChange={handleChange} className={`${inputClass} h-32`} />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full bg-ie-red text-white py-3 rounded font-bold hover:opacity-80 transition disabled:opacity-50"
      >
        {isSubmitting ? '保存中...' : (id ? '更新する' : '記録する')}
      </button>
    </form>
  );
};
