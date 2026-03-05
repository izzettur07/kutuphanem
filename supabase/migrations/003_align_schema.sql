-- =============================================
-- Migration 003: Align schema with application code
-- =============================================

-- 1. Fix user_books table
-- Add missing columns
ALTER TABLE public.user_books ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.user_books ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE public.user_books ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Rename end_date to finish_date
ALTER TABLE public.user_books RENAME COLUMN end_date TO finish_date;

-- Update status constraint to match app code values
ALTER TABLE public.user_books DROP CONSTRAINT IF EXISTS user_books_status_check;
ALTER TABLE public.user_books ADD CONSTRAINT user_books_status_check 
  CHECK (status IN ('unread', 'reading', 'read', 'wishlist', 'to_read'));

-- Migrate old status values to new ones
UPDATE public.user_books SET status = 'to_read' WHERE status = 'want_to_read';
UPDATE public.user_books SET status = 'unread' WHERE status = 'dropped';

-- 2. Rename notes table to user_book_notes and align columns
ALTER TABLE public.notes RENAME TO user_book_notes;

-- Rename content to note_text
ALTER TABLE public.user_book_notes RENAME COLUMN content TO note_text;

-- Add note_type column
ALTER TABLE public.user_book_notes ADD COLUMN IF NOT EXISTS note_type TEXT DEFAULT 'general'
  CHECK (note_type IN ('general', 'quote', 'thought', 'summary'));

-- 3. Update RLS policies for renamed table
-- Drop old policies
DROP POLICY IF EXISTS "notes_select" ON public.user_book_notes;
DROP POLICY IF EXISTS "notes_insert" ON public.user_book_notes;
DROP POLICY IF EXISTS "notes_update" ON public.user_book_notes;
DROP POLICY IF EXISTS "notes_delete" ON public.user_book_notes;

-- Recreate policies
CREATE POLICY "user_book_notes_select" ON public.user_book_notes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_book_notes_insert" ON public.user_book_notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_book_notes_update" ON public.user_book_notes FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_book_notes_delete" ON public.user_book_notes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 4. Update indexes for renamed table
DROP INDEX IF EXISTS idx_notes_user_book;
CREATE INDEX idx_user_book_notes_user_book ON public.user_book_notes(user_id, book_id);

-- 5. Update the view to use new column names
DROP VIEW IF EXISTS public.books_with_user_status;
CREATE OR REPLACE VIEW public.books_with_user_status AS
SELECT
  b.*,
  s.name AS shelf_name,
  ub.status AS user_status,
  ub.rating AS user_rating,
  ub.notes AS user_notes,
  ub.is_favorite,
  ub.current_page,
  ub.start_date,
  ub.finish_date
FROM public.books b
LEFT JOIN public.shelves s ON s.id = b.shelf_id
LEFT JOIN public.user_books ub ON ub.book_id = b.id AND ub.user_id = auth.uid();

-- 6. Recreate trigger for renamed table
DROP TRIGGER IF EXISTS set_updated_at_notes ON public.user_book_notes;
CREATE TRIGGER set_updated_at_user_book_notes
  BEFORE UPDATE ON public.user_book_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
