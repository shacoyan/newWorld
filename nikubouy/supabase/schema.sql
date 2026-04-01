-- 肉棒家 データベーススキーマ

CREATE TABLE IF NOT EXISTS records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT NOT NULL,
  date DATE NOT NULL,
  length_cm DECIMAL(4,1),
  girth_cm DECIMAL(4,1),
  curvature TEXT CHECK (curvature IN ('上反り','まっすぐ','下反り','左反り','右反り')),
  glans_size TEXT CHECK (glans_size IN ('小','普通','大')),
  foreskin TEXT CHECK (foreskin IN ('なし','仮性','真性')),
  color TEXT,
  hair_care TEXT CHECK (hair_care IN ('なし','少し','普通','濃い')),
  texture_notes TEXT,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  memory_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_records_only" ON records
  FOR ALL USING (auth.uid() = user_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER records_updated_at
  BEFORE UPDATE ON records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
