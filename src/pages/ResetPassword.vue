<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="header">
        <img src="/icons/logo-itilh.svg" alt="Logo ITILH" class="logo" />
        <h1>Redefinir Senha</h1>
      </div>

      <form @submit.prevent="handleResetPassword" class="reset-form">
        <div class="form-group">
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input 
              type="password"
              v-model="password"
              placeholder=" "
              :class="{ error: error }"
              required
            />
            <label>Nova Senha</label>
          </div>
        </div>

        <div class="form-group">
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input 
              type="password"
              v-model="confirmPassword"
              placeholder=" "
              :class="{ error: error }"
              required
            />
            <label>Confirmar Senha</label>
          </div>
          <span class="error-message" v-if="error">{{ error }}</span>
        </div>

        <div class="button-group">
          <button type="button" class="cancel-button" @click="handleCancel">
            <img src="/icons/fechar.svg" alt="Cancelar" class="icon-white" />
            Cancelar
          </button>
          <button type="submit" class="reset-button" :disabled="loading">
            <img 
              v-if="!loading"
              src="/icons/save-fill.svg"
              alt="Salvar"
              class="icon-white"
            />
            <span v-else>...</span>
            {{ loading ? 'Alterando...' : 'Alterar Senha' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Toast notification -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../config/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const handleResetPassword = async () => {
  try {
    loading.value = true
    error.value = ''

    if (password.value !== confirmPassword.value) {
      error.value = 'As senhas não conferem'
      return
    }

    const { error: resetError } = await supabase.auth.updateUser({
      password: password.value
    })

    if (resetError) throw resetError

    showToast('Senha alterada com sucesso!', 'success')

    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (e: any) {
    console.error('Erro ao redefinir senha:', e)
    error.value = e.message || 'Erro ao redefinir senha'
    showToast('Erro ao redefinir senha', 'error')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/login')
}
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
}

.reset-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header img {
  width: 120px;
  margin-bottom: 1rem;
}

.header h1 {
  color: #193155;
  font-size: 1.8rem;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-container {
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  opacity: 0.8;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

input {
  width: 100%;
  padding: 0.75rem;
  padding-left: 3rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
}

label {
  position: absolute;
  left: 3rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  transition: all 0.3s ease;
  pointer-events: none;
  font-size: 0.9rem;
}

input:focus + label,
input:not(:placeholder-shown) + label {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  background: white;
  padding: 0 0.5rem;
}

input:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: block;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button {
  width: 100%;
  padding: 0.75rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cancel-button:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.reset-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.reset-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reset-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.icon-white {
  width: 24px;
  filter: brightness(0) invert(1);
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 2rem;
  border-radius: 8px;
  color: white;
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
}

.toast.error {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .reset-card {
    padding: 1.5rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }
}
</style>