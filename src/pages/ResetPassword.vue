<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="header">
        <img src="/icons/logo.png" alt="Logo ITILH" class="logo" />
        <h1>Redefinir Senha</h1>
      </div>

      <form @submit.prevent="handleResetPassword" class="reset-form">
        <div class="form-group">
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Nova Senha"
              :class="{ error: error }" required />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <span class="toggle-password-icon">
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword"
              placeholder="Confirmar Senha" :class="{ error: error }" required />
            <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
              <span class="toggle-password-icon">
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </span>
            </button>
          </div>
          <span class="error-message" v-if="error">{{ error }}</span>
        </div>

        <div class="button-group">
          <button type="button" class="cancel-button" @click="handleCancel">
            <img src="/icons/fechar.svg" alt="Cancelar" class="icon-white" />
            Cancelar
          </button>
          <button type="submit" class="reset-button" :disabled="loading">
            <img v-if="!loading" src="/icons/save-fill.svg" alt="Salvar" class="icon-white" />
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
import { ref, onMounted } from 'vue'
import { supabase } from '../config/supabase'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const handleResetPassword = async () => {
  try {
    loading.value = true
    error.value = ''

    if (password.value !== confirmPassword.value) {
      error.value = 'As senhas não conferem'
      return
    }

    // Obter o token da URL com tratamento mais robusto
    let accessToken = null
    let type = null

    // Verifica se está usando hash ou query params (para compatibilidade)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      accessToken = hashParams.get('access_token')
      type = hashParams.get('type')
    } else if (window.location.search) {
      const queryParams = new URLSearchParams(window.location.search)
      accessToken = queryParams.get('access_token')
      type = queryParams.get('type')
    }

    console.log('Parâmetros da URL:', { hash: window.location.hash, search: window.location.search })
    console.log('Token recuperado:', accessToken)
    console.log('Tipo de operação:', type)

    if (!accessToken) {
      throw new Error('Token de recuperação não encontrado na URL')
    }

    // Use setSession com tratamento melhorado de erros
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: ''
    })

    if (sessionError) {
      console.error('Erro ao definir sessão:', sessionError)
      throw new Error(`Erro ao validar token: ${sessionError.message}`)
    }

    if (!sessionData.session) {
      throw new Error('Sessão inválida após definir token')
    }

    console.log('Sessão estabelecida:', sessionData.session.user.id)

    // Atualizar a senha
    const { data: userData, error: updateError } = await supabase.auth.updateUser({
      password: password.value
    })

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError)
      throw new Error(`Erro ao atualizar senha: ${updateError.message}`)
    }

    if (!userData.user) {
      throw new Error('Usuário não encontrado após atualização de senha')
    }

    console.log('Senha atualizada com sucesso para usuário:', userData.user.id)

    // Atualização do perfil com melhor tratamento de erros
    try {
      // Verificar se o perfil existe
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {  // PGRST116 = not found
        console.error('Erro ao verificar perfil:', fetchError)
      }

      if (!profileData) {
        console.log('Criando perfil para usuário:', userData.user.id)
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userData.user.id,
            email: userData.user.email,
            updated_at: new Date().toISOString(),
            last_password_reset: new Date().toISOString(),
            status: 'ativo',
            role: 'user'
          })

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError)
          // Continue mesmo com erro no perfil
        }
      } else {
        console.log('Atualizando perfil existente:', profileData.id)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            updated_at: new Date().toISOString(),
            last_password_reset: new Date().toISOString()
          })
          .eq('id', userData.user.id)

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError)
          // Continue mesmo com erro no perfil
        }
      }
    } catch (profileError) {
      console.error('Erro ao processar perfil:', profileError)
      // Continue mesmo com erro no perfil
    }

    showToast('Senha alterada com sucesso!', 'success')

    // Logout com verificação
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error('Erro ao fazer logout:', signOutError)
    }

    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (e: any) {
    console.error('Erro detalhado:', e)
    error.value = 'Erro ao redefinir senha. Por favor, solicite um novo link de recuperação.'
    showToast('Erro ao redefinir senha: ' + (e.message || 'Erro desconhecido'), 'error')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/login')
}
const showToast = (message: string, type: string) => {
  toast.value = {
    show: true,
    message,
    type
  }

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
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
  font-family: 'Roboto', sans-serif;
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
  margin-bottom: 4rem;
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
  font-family: 'Roboto', sans-serif;
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

input:focus+label,
input:not(:placeholder-shown)+label {
  top: -1.5rem;
  left: -0.25rem;
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
  font-family: 'Roboto', sans-serif;
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
  font-family: 'Roboto', sans-serif;
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

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-toggle {
  width: 20px;
  height: 20px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.toggle-password:hover .icon-toggle {
  opacity: 1;
}

/* Ajuste o padding do input para acomodar o ícone */
input[type="password"],
input[type="text"] {
  padding-right: 40px;
}
</style>