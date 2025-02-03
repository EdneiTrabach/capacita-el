<template>
  <div class="login-container">
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
      <div class="logo-container" @click="handleLogoClick">
        <img src="/public/icons/logo-itilh.svg" alt="Logo Itilh" class="logo" />
        <h1>Cenecte-se</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <div class="input-container">
            <span class="input-icon">👤</span>
            <input 
              type="text" 
              v-model="email"
              placeholder=" "
              :class="{ error: error }"
            />
            <label>Email</label>
          </div>
          <span class="error-message" v-if="error">{{ error }}</span>
        </div>
        
        <div class="form-group">
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input 
              type="password" 
              v-model="password"
              placeholder=" "
              :class="{ error: error }"
            />
            <label>Senha</label>
          </div>
          <span class="error-message" v-if="error">{{ error }}</span>
        </div>

        <div class="forgot-password">
          <a href="#" class="forgot-link">Esqueci minha senha</a>
        </div>

        <button type="submit" class="login-button">Entrar</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../config/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const showMatrix = ref(false)

const handleLogoClick = () => {
  showMatrix.value = !showMatrix.value
}

const generateRandomChars = () => {
  return Array(20).fill(0)
    .map(() => String.fromCharCode(33 + Math.floor(Math.random() * 94)))
    .join('')
}

const handleLogin = async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    
    if (authError) throw authError

    // Check if user has a profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: email.value,
          status: 'ativo',
          nome: email.value.split('@')[0],
          updated_at: new Date().toISOString()
        })

      if (updateError) throw updateError
    }

    // Redirect to home page instead of dashboard
    router.push('/')
  } catch (e) {
    console.error('Login error:', e)
    error.value = 'Erro ao fazer login. Verifique suas credenciais.'
  }
}

// Updated registration function
const handleRegister = async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    
    if (authError) throw authError

    // Profile will be created automatically by the database trigger
    // Show success message
    alert('Registro realizado com sucesso! Verifique seu email para confirmar a conta.')
    
  } catch (e) {
    console.error('Registration error:', e)
    error.value = 'Erro ao registrar usuário. Tente novamente.'
  }
}
</script>

<style scoped>
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
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  pointer-events: none; /* Permite clicar através da camada */
  z-index: 1; /* Garante que fique abaixo do card */
}

/* Efeito de pulso tecnológico */
.login-container::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, 
    rgba(255,255,255,0.1) 0%,
    transparent 60%
  );
  animation: techPulse 4s ease-in-out infinite;
  pointer-events: none; /* Permite clicar através da camada */
  z-index: 1; /* Garante que fique abaixo do card */
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
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

@keyframes backgroundPulse {
}

@keyframes digitalMove {

}

@keyframes glowPulse {

}

/* Card de login com efeito de vidro */
.login-card {
  position: relative;
  z-index: 2; /* Garante que o card fique acima dos efeitos */
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
  width: 120px;
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
}

/* Efeito de flutuação da label */
input:focus + label,
input:not(:placeholder-shown) + label {
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
</style>