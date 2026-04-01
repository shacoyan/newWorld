export interface NikuRecord {
  id: string
  user_id: string
  nickname: string
  date: string
  length_cm?: number
  girth_cm?: number
  curvature?: '上反り' | 'まっすぐ' | '下反り' | '左反り' | '右反り'
  glans_size?: '小' | '普通' | '大'
  foreskin?: 'なし' | '仮性' | '真性'
  color?: string
  hair_care?: 'なし' | '少し' | '普通' | '濃い'
  texture_notes?: string
  overall_rating?: 1 | 2 | 3 | 4 | 5
  memory_notes?: string
  created_at: string
  updated_at: string
}

export type NikuRecordInput = Omit<NikuRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>
