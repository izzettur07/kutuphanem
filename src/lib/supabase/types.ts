export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "admin" | "member";
          reading_goal: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "member";
          reading_goal?: number | null;
        };
        Update: {
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "member";
          reading_goal?: number | null;
        };
        Relationships: [];
      };
      shelves: {
        Row: {
          id: number;
          name: string;
          position: number;
          shelf_count: number;
          created_at: string;
        };
        Insert: {
          name: string;
          position: number;
          shelf_count?: number;
        };
        Update: {
          name?: string;
          position?: number;
          shelf_count?: number;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: number;
          title: string;
          author: string;
          publisher: string | null;
          isbn: string | null;
          category: string | null;
          language: string;
          shelf_id: number | null;
          shelf_row: number | null;
          cover_image_url: string | null;
          page_count: number | null;
          added_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          author: string;
          publisher?: string | null;
          isbn?: string | null;
          category?: string | null;
          language?: string;
          shelf_id?: number | null;
          shelf_row?: number | null;
          cover_image_url?: string | null;
          page_count?: number | null;
          added_by?: string | null;
        };
        Update: {
          title?: string;
          author?: string;
          publisher?: string | null;
          isbn?: string | null;
          category?: string | null;
          language?: string;
          shelf_id?: number | null;
          shelf_row?: number | null;
          cover_image_url?: string | null;
          page_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "books_shelf_id_fkey";
            columns: ["shelf_id"];
            isOneToOne: false;
            referencedRelation: "shelves";
            referencedColumns: ["id"];
          },
        ];
      };
      user_books: {
        Row: {
          id: number;
          user_id: string;
          book_id: number;
          status: "unread" | "reading" | "read" | "wishlist" | "to_read";
          rating: number | null;
          notes: string | null;
          is_favorite: boolean;
          start_date: string | null;
          finish_date: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          book_id: number;
          status?: "unread" | "reading" | "read" | "wishlist" | "to_read";
          rating?: number | null;
          notes?: string | null;
          is_favorite?: boolean;
          start_date?: string | null;
          finish_date?: string | null;
          sort_order?: number;
        };
        Update: {
          status?: "unread" | "reading" | "read" | "wishlist" | "to_read";
          rating?: number | null;
          notes?: string | null;
          is_favorite?: boolean;
          start_date?: string | null;
          finish_date?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "user_books_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      user_book_notes: {
        Row: {
          id: number;
          user_id: string;
          book_id: number;
          note_text: string;
          page_number: number | null;
          note_type: "general" | "quote" | "thought" | "summary";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          book_id: number;
          note_text: string;
          page_number?: number | null;
          note_type?: "general" | "quote" | "thought" | "summary";
        };
        Update: {
          note_text?: string;
          page_number?: number | null;
          note_type?: "general" | "quote" | "thought" | "summary";
        };
        Relationships: [];
      };
    };
    Views: {
      books_with_user_status: {
        Row: {
          id: number;
          title: string;
          author: string;
          publisher: string | null;
          isbn: string | null;
          category: string | null;
          language: string;
          shelf_id: number | null;
          shelf_row: number | null;
          cover_image_url: string | null;
          page_count: number | null;
          added_by: string | null;
          created_at: string;
          updated_at: string;
          shelf_name: string | null;
          user_status: "unread" | "reading" | "read" | "wishlist" | "to_read" | null;
          user_rating: number | null;
          user_notes: string | null;
          is_favorite: boolean | null;
          start_date: string | null;
          finish_date: string | null;
          added_by_username: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
