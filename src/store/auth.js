// src/store/auth.ts
import { defineStore } from 'pinia';
import { supabase } from '@/config/supabase';
export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: false,
        error: null
    }),
    actions: {
        async login(email, password) {
            try {
                this.loading = true;
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error)
                    throw error;
                this.user = data.user;
            }
            catch (error) {
                this.error = error.message;
                throw error;
            }
            finally {
                this.loading = false;
            }
        },
        async logout() {
            await supabase.auth.signOut();
            this.user = null;
        }
    }
});
