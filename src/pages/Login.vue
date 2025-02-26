<template>
  <div class="login-container">
    <!-- Toast notification -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>

    <!-- Matrix Effect -->
    <div class="matrix-effect" v-if="showMatrix">
      <div v-for="i in 50" :key="i" class="matrix-column" :style="{
        left: `${Math.random() * 100}%`,
        animationDuration: `${2 + Math.random() * 3}s`,
        animationDelay: `${Math.random() * 2}s`
      }">
        {{ generateRandomChars() }}
      </div>
    </div>

    <!-- Existing Login Card -->
    <div class="login-card">
      <div class="logo-container">
        <img src="/public/icons/logo.png" alt="Logo Itilh" class="logo" />
        <!-- <h1>Capacita.EL</h1> -->
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <div class="input-container">
            <span class="input-icon">👤</span>
            <input type="text" v-model="email" placeholder=" " :class="{ error: error }" />
            <label>Email</label>
          </div>
          <span class="error-message" v-if="error">{{ error }}</span>
        </div>

        <div class="form-group">
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input type="password" v-model="password" placeholder=" " :class="{ error: error }" />
            <label>Senha</label>
          </div>
          <span class="error-message" v-if="error">{{ error }}</span>
        </div>

        <div class="forgot-password">
          <a href="#" class="forgot-link" @click="handleForgotClick">Esqueci minha senha</a>
        </div>

        <button type="submit" class="login-button">
          <span v-if="!loading">Entrar</span>
          <div v-else class="spinner-container">
            <div class="spinner"></div>
            <span>Conectando...</span>
          </div>
        </button>
      </form>
    </div>

    <!-- Modal de Recuperação de Senha -->
    <div v-if="showForgotModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Recuperação de Senha</h2>
        <form @submit.prevent="handleResetPassword" class="reset-form">
          <div class="form-group">
            <div class="input-container">
              <span class="input-icon">📧</span>
              <input type="email" v-model="resetEmail" placeholder=" " required />
              <label>Email</label>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showForgotModal = false" class="btn-cancelar">
              <img src="/public/icons/fechar.svg" alt="Cancelar" class="icon-black" />
              Cancelar
            </button>
            <button type="submit" class="btn-enviar" :disabled="loading">
              <img v-if="!loading" src="/public/icons/save-fill.svg" alt="Enviar" class="icon-black" />
              <span v-else>...</span>
              {{ loading ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
declare global {
  interface Window {
    grecaptcha: any;
  }
}

import { ref, onMounted } from 'vue'
import { supabase } from '../config/supabase'
import { useRouter } from 'vue-router'
import { AuthTokenResponse } from '@supabase/supabase-js'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const showMatrix = ref(false)
const loading = ref(false)
const showForgotModal = ref(false)
const resetEmail = ref('')
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// Função para mostrar mensagem toast
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

const handleLogoClick = () => {
  showMatrix.value = !showMatrix.value
}

const generateRandomChars = () => {
  return Array(20).fill(0)
    .map(() => String.fromCharCode(33 + Math.floor(Math.random() * 94)))
    .join('')
}

// Função para verificar conectividade
const checkConnectivity = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Tenta fazer uma requisição simples para verificar conexão
    const testImage = new Image();
    const timeout = setTimeout(() => {
      testImage.onerror = testImage.onload = null;
      resolve(false);
    }, 3000);

    testImage.onerror = () => {
      clearTimeout(timeout);
      testImage.onerror = testImage.onload = null;
      resolve(false);
    };

    testImage.onload = () => {
      clearTimeout(timeout);
      testImage.onerror = testImage.onload = null;
      resolve(true);
    };

    // Usa o CDN do Google como teste, geralmente é confiável
    testImage.src = "https://www.google.com/favicon.ico?" + new Date().getTime();
  });
}

// Modifique o handleLogin para verificar conectividade
const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }
  
  try {
    loading.value = true
    error.value = ''
    
    // Verifica conectividade antes
    const isOnline = await checkConnectivity();
    if (!isOnline) {
      throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
    }
    
    // Tente conectar-se com o Supabase com timeout
    const authPromise = supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    
    // Adicione um timeout para a requisição
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: O servidor não respondeu em tempo hábil')), 10000)
    })
    
    // Race entre a autenticação e o timeout
    const { data: authData, error: authError } = await Promise.race([
      authPromise,
      timeoutPromise
    ]) as AuthTokenResponse

    if (authError) throw authError

    // Verificar se o usuário tem acesso
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profileData) {
      await supabase.auth.signOut()
      throw new Error('Usuário não autorizado')
    }

    // Redirecionar para a página inicial ou a URL pretendida
    const intendedUrl = sessionStorage.getItem('intendedUrl')
    router.push(intendedUrl || '/')
    sessionStorage.removeItem('intendedUrl')
    
    showToast('Login realizado com sucesso!', 'success')
  } catch (e) {
    console.error('Login error:', e)
    
    // Tratamento específico para diferentes erros
    if (e instanceof TypeError && e.message.includes('Failed to fetch')) {
      error.value = 'Erro de conexão com o servidor. Verifique sua conexão com a internet.'
      showToast('Erro de conexão com o servidor', 'error')
    } else if (e instanceof Error && e.message.includes('Timeout')) {
      error.value = 'O servidor está demorando para responder. Tente novamente mais tarde.'
      showToast('Tempo limite excedido', 'error')
    } else {
      error.value = 'Erro ao fazer login. Verifique suas credenciais.'
      showToast('Falha na autenticação', 'error')
    }
  } finally {
    loading.value = false
  }
}
const handleRegister = async () => {
  try {
    // Implementation goes here
  } catch (error) {
    console.error('Registration error:', error)
  }
}

// Modifique o link para abrir o modal
const handleForgotClick = (e: Event) => {
  e.preventDefault()
  showForgotModal.value = true
}

// Função de recuperação de senha atualizada
interface AuthError {
  message: string;
  status?: number;
}

const handleResetPassword = async () => {
  try {
    loading.value = true

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
      redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL ||
        'https://cursos-itilh.vercel.app/reset-password'
    })

    if (error) throw error
    showForgotModal.value = false
    showToast('Email de recuperação enviado com sucesso!', 'success')
  } catch (err) {
    const error = err as AuthError
    showToast('Erro ao enviar email: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.icon-black {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  filter: invert(1);
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  position: relative;
  overflow: hidden;
}

/* Efeito de grade digital */
.login-container::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  pointer-events: none;
  /* Permite clicar através da camada */
  z-index: 1;
  /* Garante que fique abaixo do card */
}

/* Efeito de pulso tecnológico */
.login-container::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 60%);
  animation: techPulse 4s ease-in-out infinite;
  pointer-events: none;
  /* Permite clicar através da camada */
  z-index: 1;
  /* Garante que fique abaixo do card */
}

@keyframes gridMove {
  0% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-25px) scale(1.1);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes techPulse {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

@keyframes backgroundPulse {}

@keyframes digitalMove {}

@keyframes glowPulse {}

/* Card de login com efeito de vidro */
.login-card {
  position: relative;
  z-index: 2;
  /* Garante que o card fique acima dos efeitos */
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
}

/* Efeito de gradiente nos botões */
.login-button {
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 49, 85, 0.2);
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 200px;
  height: auto;
  margin-bottom: 1rem;
  animation: fadeIn 1s ease;
}

.logo-container h1 {
  color: #193155;
  font-size: 1.8rem;
  margin: 0;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-bottom: 1.5rem;
}

label {
  position: absolute;
  left: 3rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: transparent;
  padding: 0 0.5rem;
  pointer-events: none;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #193155;
  opacity: 0.8;
  z-index: 1;
}

input {
  width: 100%;
  padding: 0.75rem;
  padding-left: 3rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
  background: white;
  color: black;
}

/* Efeito de flutuação da label */
input:focus+label,
input:not(:placeholder-shown)+label {
  top: -2rem;
  transform: translateX(-55px);
  font-size: 0.8rem;
  color: #193155;
  /* background: white; */
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
}

.forgot-password {
  text-align: right;
}

.forgot-link {
  color: #193155;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #254677;
  text-decoration: underline;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .login-card {
    padding: 1.5rem;
  }
}

/* Matrix effect styling */
.matrix-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
  animation: matrixFade 0.5s ease-in;
}

.matrix-container::before {
  content: '01';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #00ff00;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  text-shadow: 0 0 5px #00ff00;
  animation: matrixRain 2s linear infinite;
  pointer-events: none;
}

@keyframes matrixFade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes matrixRain {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(100%);
  }
}

.matrix-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 999;
  overflow: hidden;
}

.matrix-column {
  position: absolute;
  top: -100%;
  color: rgb(0, 255, 0);
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  line-height: 2em;
  white-space: pre;
  text-shadow: 0 0 8px rgba(125, 129, 125, 0.8);
  animation: matrix-rain linear infinite;
}

@keyframes matrix-rain {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }

  to {
    transform: translateY(100vh);
    opacity: 0;
  }
}

/* Adicione estes estilos */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.recaptcha-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancelar,
.btn-enviar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar {
  background-color: #6c757d;
  color: white;
}

.btn-enviar {
  background-color: #193155;
  color: white;
}

.btn-enviar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

/* Modal Content */
.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.modal-content h2 {
  color: #193155;
  font-size: 1.5rem;
  margin-bottom: 3rem;
  font-weight: 600;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e4e8;
}

/* Form Styling */
.form-group {
  margin-bottom: 1.5rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #193155;
  opacity: 0.8;
  z-index: 1;
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

input:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 3px rgba(25, 49, 85, 0.1);
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e4e8;
}

.btn-cancelar,
.btn-enviar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar {
  background-color: #6c757d;
  color: white;
}

.btn-enviar {
  background-color: #193155;
  color: white;
}

.btn-cancelar:hover,
.btn-enviar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-cancelar:hover {
  background-color: #5a6268;
}

.btn-enviar:hover {
  background-color: #254677;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

/* Responsiveness */
@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-cancelar,
  .btn-enviar {
    width: 100%;
    justify-content: center;
  }
}


.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.retry-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 4px;
  color: #495057;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background-color: #e9ecef;
}


</style>