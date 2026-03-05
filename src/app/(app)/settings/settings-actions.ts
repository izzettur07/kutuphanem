"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addLookupValue(type: "category" | "language", value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { error: "Değer boş olamaz." };
  const supabase = await createClient();
  const { error } = await supabase.from("lookup_values").insert({ type, value: trimmed });
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/books");
  revalidatePath("/books/new");
  return { error: null };
}

export async function deleteLookupValue(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("lookup_values").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/books");
  revalidatePath("/books/new");
  return { error: null };
}

export async function clearBookCategory(category: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .update({ category: null })
    .eq("category", category);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/books");
  revalidatePath("/books/new");
  return { error: null };
}

export async function clearBookLanguage(language: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .update({ language: "Türkçe" })
    .eq("language", language);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/books");
  revalidatePath("/books/new");
  return { error: null };
}

export async function addShelf(name: string, position: number, shelfCount: number) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "İsim boş olamaz." };
  const supabase = await createClient();
  const { error } = await supabase.from("shelves").insert({ name: trimmed, position, shelf_count: shelfCount });
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/shelves");
  return { error: null };
}

export async function deleteShelf(id: string) {
  const supabase = await createClient();
  await supabase.from("books").update({ shelf_id: null, shelf_row: null }).eq("shelf_id", id);
  const { error } = await supabase.from("shelves").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/shelves");
  return { error: null };
}

export async function updateShelf(id: string, name: string, shelfCount: number) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "İsim boş olamaz." };
  const supabase = await createClient();
  const { error } = await supabase.from("shelves").update({ name: trimmed, shelf_count: shelfCount }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/shelves");
  return { error: null };
}
