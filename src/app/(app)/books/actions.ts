"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBook(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("books").insert({
    title: formData.get("title") as string,
    author: formData.get("author") as string,
    publisher: (formData.get("publisher") as string) || null,
    isbn: (formData.get("isbn") as string) || null,
    category: (formData.get("category") as string) || null,
    language: (formData.get("language") as string) || "Türkçe",
    shelf_id: (formData.get("shelf_id") as string) || null,
    shelf_row: formData.get("shelf_row") ? Number(formData.get("shelf_row")) : null,
    page_count: formData.get("page_count") ? Number(formData.get("page_count")) : null,
    cover_url: (formData.get("cover_url") as string) || null,
    added_by: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/books");
}

export async function updateBook(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("books")
    .update({
      title: formData.get("title") as string,
      author: formData.get("author") as string,
      publisher: (formData.get("publisher") as string) || null,
      isbn: (formData.get("isbn") as string) || null,
      category: (formData.get("category") as string) || null,
      language: (formData.get("language") as string) || "Türkçe",
      shelf_id: (formData.get("shelf_id") as string) || null,
      shelf_row: formData.get("shelf_row") ? Number(formData.get("shelf_row")) : null,
      page_count: formData.get("page_count") ? Number(formData.get("page_count")) : null,
      cover_url: (formData.get("cover_url") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/books");
  revalidatePath(`/books/${id}`);
}

export async function deleteBook(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/books");
}

export async function upsertUserBook(bookId: string, data: {
  status: string;
  rating?: number | null;
  notes?: string | null;
  is_favorite?: boolean;
  start_date?: string | null;
  finish_date?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("user_books").upsert(
    {
      user_id: user.id,
      book_id: bookId,
      status: data.status as "unread" | "reading" | "read" | "wishlist" | "to_read",
      rating: data.rating ?? null,
      notes: data.notes ?? null,
      is_favorite: data.is_favorite ?? false,
      start_date: data.start_date ?? null,
      finish_date: data.finish_date ?? null,
    },
    { onConflict: "user_id,book_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/reading-list");
  revalidatePath("/dashboard");
}

export async function removeUserBook(bookId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("user_books")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId);

  if (error) throw new Error(error.message);
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/reading-list");
  revalidatePath("/dashboard");
}
