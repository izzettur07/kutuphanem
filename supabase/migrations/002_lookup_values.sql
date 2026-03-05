-- Lookup values table for predefined categories and languages
CREATE TABLE lookup_values (
  id serial PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('category', 'language')),
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(type, value)
);

ALTER TABLE lookup_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lookup values"
  ON lookup_values FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert lookup values"
  ON lookup_values FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete lookup values"
  ON lookup_values FOR DELETE TO authenticated USING (true);

-- Seed with initial values
INSERT INTO lookup_values (type, value) VALUES
  ('language', 'Türkçe'),
  ('language', 'İngilizce'),
  ('language', 'Almanca'),
  ('language', 'Fransızca'),
  ('language', 'İspanyolca'),
  ('language', 'Rusça'),
  ('language', 'Arapça'),
  ('category', 'Roman'),
  ('category', 'Öykü'),
  ('category', 'Şiir'),
  ('category', 'Tarih'),
  ('category', 'Biyografi'),
  ('category', 'Felsefe'),
  ('category', 'Psikoloji'),
  ('category', 'Bilim'),
  ('category', 'Teknoloji'),
  ('category', 'Ekonomi'),
  ('category', 'Kişisel Gelişim'),
  ('category', 'Çocuk'),
  ('category', 'Mizah');
