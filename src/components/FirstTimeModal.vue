<template>
  <div v-if="shouldShowModal" class="modal-overlay">
    <div class="modal-container" ref="modalContent">
      <div class="modal-header">
        <h2>Bem-vindo ao Sistema de Gestão de Treinamentos</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="welcome-icon">
          <img src="/public/icons/informacao.svg" alt="Informação" class="info-icon" />
        </div>
        
        <h3>Sobre nossa plataforma</h3>
        
        <p>Este sistema foi desenvolvido para facilitar a gestão completa de treinamentos do Grupo EL, proporcionando uma experiência integrada para administradores e usuários.</p>
        
        <h4>Principais recursos:</h4>
        <ul>
          <li><strong>Dashboard:</strong> Visualize estatísticas e métricas importantes</li>
          <li><strong>Cadastro de pessoas:</strong> Gerencie informações dos participantes</li>
          <li><strong>Gestão de treinamentos:</strong> Crie e administre cursos e sessões</li>
          <li><strong>Certificados:</strong> Emita e gerencie certificados automaticamente</li>
          <li><strong>Relatórios:</strong> Acesse dados detalhados sobre desempenho e participação</li>
        </ul>
        
        <p>Navegue pelo menu lateral para acessar todas as funcionalidades disponíveis.</p>
      </div>
      <div class="modal-footer">
        <label class="dont-show-again">
          <input type="checkbox" v-model="dontShowAgain">
          <span>Não mostrar novamente</span>
        </label>
        <button @click="closeModal" class="primary-btn">Continuar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/config/supabase';

const isVisible = ref(false);
const dontShowAgain = ref(false);
const modalContent = ref<HTMLElement | null>(null);
const route = useRoute();

// Verifica se o usuário está autenticado
const isAuthenticated = computed(() => {
  return !!supabase.auth.getSession();
});

// Verifica se é uma rota de autenticação (login)
const isAuthRoute = computed(() => {
  return route.path === '/login' || !!route.meta.isAuthRoute;
});

// Computed property para controlar se o modal deve ser exibido
const shouldShowModal = computed(() => {
  return isVisible.value && isAuthenticated.value && !isAuthRoute.value;
});

// Verifica se o modal já foi visto antes
const checkFirstTimeVisit = (): boolean => {
  return localStorage.getItem('firstTimeModalSeen') !== 'true';
};

const closeModal = () => {
  if (dontShowAgain.value) {
    localStorage.setItem('firstTimeModalSeen', 'true');
  }
  isVisible.value = false;
};

// Detecta clique fora do modal para fechar
const handleOutsideClick = (event: MouseEvent) => {
  if (isVisible.value && modalContent.value && !modalContent.value.contains(event.target as Node)) {
    closeModal();
  }
};

onMounted(() => {
  // Verifica se é a primeira visita E se o usuário está autenticado E não está na página de login
  if (checkFirstTimeVisit() && isAuthenticated.value && !isAuthRoute.value) {
    isVisible.value = true;
  }
  
  // Adiciona o event listener para detectar cliques fora do modal
  document.addEventListener('mousedown', handleOutsideClick);
  
  // Impede scroll quando o modal está aberto
  if (shouldShowModal.value) {
    document.body.style.overflow = 'hidden';
  }
  
  // Monitora mudanças no estado de autenticação
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' && checkFirstTimeVisit()) {
      // Pequeno timeout para garantir que a navegação termine antes de mostrar o modal
      setTimeout(() => {
        if (!isAuthRoute.value) {
          isVisible.value = true;
        }
      }, 500);
    } else if (event === 'SIGNED_OUT') {
      // Esconder o modal quando o usuário sair
      isVisible.value = false;
    }
  });
});

// Remove o event listener quando o componente é desmontado
onMounted(() => {
  return () => {
    document.removeEventListener('mousedown', handleOutsideClick);
  };
});

// Restaura o scroll quando o modal é fechado
watch(shouldShowModal, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
});

// Monitora mudanças na rota para esconder o modal em rotas de autenticação
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/login' || route.meta.isAuthRoute) {
      isVisible.value = false;
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-container {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modalFadeIn 0.3s ease forwards;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  color: var(--text-primary);
}

.welcome-icon {
  text-align: center;
  margin-bottom: 1.5rem;
}

.info-icon {
  width: 60px;
  height: 60px;
}

h3 {
  margin-top: 0;
  font-size: 1.3rem;
  color: var(--text-primary);
}

h4 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  color: var(--text-primary);
}

p {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

ul {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

strong {
  color: var(--text-primary);
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.dont-show-again {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.dont-show-again input {
  cursor: pointer;
}

.primary-btn {
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

@media (max-width: 600px) {
  .modal-container {
    width: 95%;
    max-height: 80vh;
  }
  
  .modal-header h2 {
    font-size: 1.3rem;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .primary-btn {
    width: 100%;
  }
}
</style>
