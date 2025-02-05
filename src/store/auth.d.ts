import type { User } from '@supabase/supabase-js';
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", {
    user: User | null;
    loading: boolean;
    error: null;
}, {}, {
    login(email: string, password: string): Promise<void>;
    logout(): Promise<void>;
}>;
