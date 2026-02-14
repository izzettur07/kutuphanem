# KÜTÜPHANEM

Supabase + Next.js 16 (App Router) ile çok kullanıcılı kütüphane yönetimi.

## Kurulum

```bash
npm install
cp .env.local.example .env.local
# .env.local dosyasına Supabase URL ve anon key ekleyin
```

## Supabase

1. Supabase projesi oluşturun (Europe - Frankfurt)
2. SQL Editor'da `supabase/migrations/001_initial_schema.sql` çalıştırın
3. Seed data: `supabase/seed.sql` çalıştırın
4. Auth > Email aktif edin
5. Settings > API > URL + anon key kopyalayıp `.env.local` dosyasına yapıştırın

## Geliştirme

```bash
npm run dev
```

## Derleme

```bash
npm run build
npm run start
```
