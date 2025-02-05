// src/store/auth.ts
import { defineStore } from 'pinia'
import { supabase } from '@/config/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', {
     state: () => ({
          user: null as User | null,
          loading: false,
          error: null
     }),

     actions: {
          async login(email: string, password: string) {
               try {
                    this.loading = true
                    const { data, error } = await supabase.auth.signInWithPassword({
                         email,
                         password
                    })

                    if (error) throw error
                    this.user = data.user

               } catch (error: any) {
                    this.error = error.message
                    throw error
               } finally {
                    this.loading = false
               }
          },

          async logout() {
               await supabase.auth.signOut()
               this.user = null
          }
     }
})