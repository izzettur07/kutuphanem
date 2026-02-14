-- =============================================
-- KÜTÜPHANEM — Initial Schema
-- =============================================

-- 1. Profiles (auto-created on auth signup)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Shelves (physical shelf locations)
CREATE TABLE public.shelves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INT NOT NULL,
  shelf_count INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Books (shared catalog)
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT,
  category TEXT,
  language TEXT DEFAULT 'Türkçe',
  shelf_id UUID REFERENCES public.shelves(id) ON DELETE SET NULL,
  shelf_row INT,
  page_count INT,
  cover_url TEXT,
  isbn TEXT,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. User-book relationship (personal tracking)
CREATE TABLE public.user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('reading', 'read', 'want_to_read', 'dropped')) DEFAULT 'want_to_read',
  rating INT CHECK (rating >= 1 AND rating <= 5),
  current_page INT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- 5. Notes (personal book notes)
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  page_number INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_books_shelf ON public.books(shelf_id);
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_author ON public.books(author);
CREATE INDEX idx_user_books_user ON public.user_books(user_id);
CREATE INDEX idx_user_books_status ON public.user_books(user_id, status);
CREATE INDEX idx_notes_user_book ON public.notes(user_id, book_id);

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Profiles: read all, update own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Shelves: authenticated full access
CREATE POLICY "shelves_select" ON public.shelves FOR SELECT TO authenticated USING (true);
CREATE POLICY "shelves_insert" ON public.shelves FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "shelves_update" ON public.shelves FOR UPDATE TO authenticated USING (true);
CREATE POLICY "shelves_delete" ON public.shelves FOR DELETE TO authenticated USING (true);

-- Books: authenticated full access
CREATE POLICY "books_select" ON public.books FOR SELECT TO authenticated USING (true);
CREATE POLICY "books_insert" ON public.books FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "books_update" ON public.books FOR UPDATE TO authenticated USING (true);
CREATE POLICY "books_delete" ON public.books FOR DELETE TO authenticated USING (true);

-- User books: own records only
CREATE POLICY "user_books_select" ON public.user_books FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_books_insert" ON public.user_books FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_books_update" ON public.user_books FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_books_delete" ON public.user_books FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Notes: own records only
CREATE POLICY "notes_select" ON public.notes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notes_insert" ON public.notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "notes_update" ON public.notes FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notes_delete" ON public.notes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =============================================
-- View: books with current user's status
-- =============================================
CREATE OR REPLACE VIEW public.books_with_user_status AS
SELECT
  b.*,
  s.name AS shelf_name,
  ub.status AS user_status,
  ub.rating AS user_rating,
  ub.current_page,
  ub.start_date,
  ub.end_date
FROM public.books b
LEFT JOIN public.shelves s ON s.id = b.shelf_id
LEFT JOIN public.user_books ub ON ub.book_id = b.id AND ub.user_id = auth.uid();

-- =============================================
-- Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_user_books
  BEFORE UPDATE ON public.user_books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_notes
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
