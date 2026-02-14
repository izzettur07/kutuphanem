-- =============================================
-- KÜTÜPHANEM — Seed Data
-- =============================================

-- Shelves
INSERT INTO public.shelves (name, position, shelf_count) VALUES
('Sol Dolap', 1, 5),
('Sol Orta Dolap', 2, 5),
('Orta Köşe Dolap', 3, 6),
('Sağ Orta Dolap', 4, 5),
('Sağ Dolap', 5, 5);

-- Books (reference shelves by position via CTE)
WITH s AS (
  SELECT id, position FROM public.shelves
)
INSERT INTO public.books (title, author, publisher, category, language, shelf_id, shelf_row, page_count) VALUES
('Karantina', 'Beyza Alkoç', 'İndigo', 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 1, NULL),
('Karantina 2 - İkinci Perde', 'Beyza Alkoç', 'İndigo', 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 1, NULL),
('Karantina 3 - Üçüncü Perde', 'Beyza Alkoç', 'İndigo', 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 1, NULL),
('Karantina 4', 'Beyza Alkoç', 'İndigo', 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 1, NULL),
('Okul Yangını', 'Beyza Alkoç', 'İndigo', 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 1, NULL),
('Asansör', 'Beyza Alkoç', 'İndigo', 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 2), 1, NULL),
('Deliler ve Cellatlar', 'N.G. Kabal', 'DEX', 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 1, NULL),
('Denizması', 'Binnur Şafak Nigiz', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 2, NULL),
('Floresi', 'Binnur Şafak Nigiz', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 2, NULL),
('Tünel', 'Binnur Şafak Nigiz', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 2, NULL),
('Kuşatma', 'Binnur Şafak Nigiz', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 2, NULL),
('Gizember', 'Binnur Şafak Nigiz', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 2, NULL),
('Nehir', 'Binnur Şafak Nigiz', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 2, NULL),
('Kül - I', 'Beyza Aksoy', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 1, NULL),
('Kül - II', 'Beyza Aksoy', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 1, NULL),
('Kül - III', 'Beyza Aksoy', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 1, NULL),
('Aşk Nöbetçileri', 'Emre Gül', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 2), 2, NULL),
('Günlü Gündüzlerin', 'Emre Gül', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 2), 2, NULL),
('Sokak Nöbetçileri', 'Aslı Arslan', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 2, NULL),
('Mahkş', 'Gamze Çelik', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 2), 2, NULL),
('M. Rişe - 1', 'Sepin Poyraz', 'Epsilon', 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 4), 1, NULL),
('1984', 'George Orwell', NULL, 'Roman', 'İngilizce', (SELECT id FROM s WHERE position = 4), 1, 328),
('Decameron', 'Giovanni Boccaccio', NULL, 'Klasik', 'Türkçe', (SELECT id FROM s WHERE position = 3), 1, NULL),
('The Norton Anthology of English Literature', 'Various', 'Norton', 'Edebiyat', 'İngilizce', (SELECT id FROM s WHERE position = 4), 1, NULL),
('İsyan', 'Marie Lu', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 2, NULL),
('Warcross', 'Marie Lu', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 2, NULL),
('İslam Tarihi (Cilt 1-10)', 'Çeşitli', NULL, 'Tarih', 'Türkçe', (SELECT id FROM s WHERE position = 5), 1, NULL),
('Nutuk', 'Mustafa Kemal Atatürk', NULL, 'Tarih', 'Türkçe', (SELECT id FROM s WHERE position = 3), 3, NULL),
('Elon Musk', 'Walter Isaacson', NULL, 'Biyografi', 'Türkçe', (SELECT id FROM s WHERE position = 3), 3, NULL),
('Tesla', 'W. Bernard Carlson', NULL, 'Biyografi', 'Türkçe', (SELECT id FROM s WHERE position = 3), 3, NULL),
('Neksus', 'Yuval Noah Harari', NULL, 'Bilim', 'Türkçe', (SELECT id FROM s WHERE position = 5), 3, NULL),
('Acı', 'Zeynep Sey', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 3, NULL),
('Veda', 'Zeynep Sey', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 3, NULL),
('Mutlu', 'Zeynep Sey', NULL, 'Roman', 'Türkçe', (SELECT id FROM s WHERE position = 1), 3, NULL);
