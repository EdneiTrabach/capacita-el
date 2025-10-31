<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Sistema de Treinamentos</h1>
        <p>Login para demonstração</p>
      </div>

      <form @submit.prevent="handleDemoLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email (qualquer email)</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@demo.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Senha (qualquer senha)</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="123456"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          <span v-if="loading">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <!-- Seção de demonstração -->
      <div class="demo-info">
        <h3>🚀 Modo Demonstração</h3>
        <p>Digite qualquer email e senha para acessar o sistema</p>
        <div class="demo-credentials">
          <strong>Exemplos:</strong><br>
          Email: admin@demo.com<br>
          Senha: 123456
        </div>
      </div>

      <!-- Toast de mensagem -->
      <div v-if="toast.show" :class="['toast', toast.type]">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authDemo } from '@/services/authDemo'

const router = useRouter()
const email = ref('admin@demo.com')
const password = ref('123456')
const loading = ref(false)
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const handleDemoLogin = async () => {
  try {
    loading.value = true
    
    const result = await authDemo.login(email.value, password.value)
    
    if (result.success) {
      showToast('Login realizado com sucesso!', 'success')
      
      // Aguarda um pouco para mostrar a mensagem de sucesso
      setTimeout(() => {
        // Verifica se há uma URL que o usuário tentou acessar antes
        const intendedUrl = sessionStorage.getItem('intendedUrl')
        sessionStorage.removeItem('intendedUrl')
        
        // Redireciona para a URL original ou para a home
        router.push(intendedUrl || '/')
      }, 1000)
    }
  } catch (error) {
    showToast('Erro ao fazer login', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #193155;
  margin: 0 0 0.5rem 0;
}

.login-header p {
  color: #666;
  margin: 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #193155;
  box-shadow: 0 0 0 2px rgba(25, 49, 85, 0.1);
}

.login-btn {
  width: 100%;
  background: #193155;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #254677;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.demo-info h3 {
  margin: 0 0 0.5rem 0;
  color: #193155;
}

.demo-info p {
  margin: 0 0 1rem 0;
  color: #666;
}

.demo-credentials {
  background: #e9ecef;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #495057;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  color: white;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: #28a745;
}

.toast.error {
  background: #dc3545;
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
</style>