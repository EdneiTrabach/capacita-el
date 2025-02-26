<template>
  <div class="home">
    <header class="home-header">
      <h1>Bem-vindo ao Sistema de Gestão de Treinamentos do Grupo EL</h1>
    </header>

    <div class="cards-grid">

      <div class="nav-card" @click="$router.push('/dashboard')">
        <div class="card-icon">
          <img src="/public/icons/grafico.svg" alt="Dashboard" class="icon-home" />
        </div>
        <h2>Dashboard</h2>
        <p>Visualizar relatórios e estatísticas</p>
        <div class="card-action">Acessar →</div>
      </div>

      <div class="nav-card" @click="$router.push('/usuarios')">
        <div class="card-icon">
          <img src="/public/icons/add-usuario.svg" alt="Cadastro de pessoas" class="icon-home" />
        </div>
        <h2>Cadastro de pessoas</h2>
        <p>Gerenciar cadastros e edições de pessoas</p>
        <div class="card-action">Acessar →</div>
      </div>

      
      <div class="nav-card" @click="$router.push('/lista-usuarios')">
        <div class="card-icon">
          <img src="/public/icons/config-usuario.svg" alt="Gestao de pessoas" class="icon-home" />
        </div>
        <h2>Gestão de pessoas</h2>
        <p>Visualizar e gerenciar Pessoas cadastradas</p>
        <div class="card-action">Acessar →</div>
      </div>
      
      <div class="nav-card" @click="$router.push('/cursos')">
        <div class="card-icon">
          <img src="/public/icons/novo-curso.svg" alt="Cadastro de cursos" class="icon-home" />
        </div>
        <h2>Novo de Treinamento</h2>
        <p>Gerenciar cadastros e edições de treinamentos</p>
        <div class="card-action">Acessar →</div>
      </div>

      <div class="nav-card" @click="$router.push('/lista-cursos')">
        <div class="card-icon">
          <img src="/public/icons/livros.svg" alt="Cursos" class="icon-home" />
        </div>
        <h2>Treinamentos</h2>
        <p>Explorar Treinamentos</p>
        <div class="card-action">Acessar →</div>
      </div>

      <div class="nav-card" @click="$router.push('/certificados')">
        <div class="card-icon">
          <img src="/public/icons/certificado.svg" alt="Certificados" class="icon-home" />
        </div>
        <h2>Certificados</h2>
        <p>Gerenciar emissão de certificados</p>
        <div class="card-action">Acessar →</div>
      </div>

      <div class="nav-card" @click="$router.push('/relatorios')">
        <div class="card-icon">
          <img src="/public/icons/relatorio.svg" alt="Relatorios" class="icon-home" />
        </div>
        <h2>Relatórios</h2>
        <p>Visualizar relatórios e estatísticas detalhadas</p>
        <div class="card-action">Acessar →</div>
      </div>

      <div class="nav-card" @click="$router.push('/admin')">
        <div class="card-icon">
          <img src="/public/icons/config-usuario.svg" alt="Admin" class="icon-home" />
        </div>
        <h2>Painel Admin</h2>
        <p>Gerenciar usuários e configurações do sistema</p>
        <div class="card-action">Acessar →</div>
      </div>

      <div class="nav-card info-card" @click="handleInfoCardClick">
        <div class="card-icon">
          <img src="/public/icons/informacao.svg" alt="Info" class="icon-home" />
        </div>
        <h2 class="about">Sobre o Sistema</h2>
        <p>Sistema desenvolvido por Ednei Trabach and Gilcimar Schunk</p>
        <p class="version">Versão 1.0</p>
        <p v-if="clickCount > 0 && clickCount < 5" class="easter-hint">{{ 5 - clickCount }} cliques para surpresa...</p>
      </div>

    </div>
    
    <!-- Easter Egg Modal -->
    <div v-if="showEasterEgg" class="easter-egg-overlay" @click.self="closeEasterEgg">
      <div class="easter-egg-modal">
        <button class="close-btn" @click="closeEasterEgg">×</button>
        <h2>🎮 Easter Egg Encontrado! 🎮</h2>
        <easter-egg-game @game-complete="handleGameComplete" />
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../config/supabase'
import EasterEggGame from '../components/EasterEggGame.vue'

export default {
  name: 'Home',
  components: {
    EasterEggGame
  },
  data() {
    return {
      clickCount: 0,
      clickTimer: null,
      showEasterEgg: false,
      easterEggUnlocked: false
    }
  },
  methods: {
    async handleLogout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        // Clear local storage
        localStorage.removeItem('isAuthenticated')
        
        // Redirect to login
        this.$router.push('/login')
      } catch (error) {
        console.error('Erro ao sair:', error)
        alert('Erro ao sair do sistema. Tente novamente.')
      }
    },
    handleInfoCardClick() {
      clearTimeout(this.clickTimer);
      this.clickCount++;
      
      // Se atingir 5 cliques, ativa o Easter Egg
      if (this.clickCount === 5) {
        this.activateEasterEgg();
      }
      
      // Reset do contador após 3 segundos sem cliques
      this.clickTimer = setTimeout(() => {
        this.clickCount = 0;
      }, 3000);
    },
    activateEasterEgg() {
      this.showEasterEgg = true;
      this.easterEggUnlocked = true;
      this.clickCount = 0;
      
      // Salvar no localStorage que o usuário já descobriu o easter egg
      localStorage.setItem('easterEggFound', 'true');
    },
    closeEasterEgg() {
      this.showEasterEgg = false;
    },
    handleGameComplete(score) {
      alert(`Parabéns! Você completou o mini-jogo com pontuação: ${score}`);
      this.closeEasterEgg();
    }
  },
  mounted() {
    // Verificar se o Easter Egg já foi encontrado anteriormente
    this.easterEggUnlocked = localStorage.getItem('easterEggFound') === 'true';
  }
}
</script>

<style scoped>
.icon-home {
  width: 60px;
  height: 60px;
}

.home {
  padding: 2rem;
  background-color: var(--bg-secondary);
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

.home-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  border-radius: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  color: white;
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  position: relative;
}

.home-header:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.home-header:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3f88f5, #5cb8f5);
  opacity: 0.7;
}

.home-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.nav-card {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  padding: 2.2rem;
  border-radius: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.nav-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.nav-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.15);
}

.nav-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  transition: all 0.4s ease;
}

.nav-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.nav-card h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.nav-card:hover h2 {
  transform: translateX(5px);
}

h2.about {
  color: white !important;
}

.nav-card p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  font-size: 0.95rem;
  transition: opacity 0.3s ease;
}

.nav-card:hover p {
  opacity: 0.9;
}

.card-action {
  margin-top: 1.8rem;
  color: var(--accent-color);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.8;
  transition: all 0.3s ease;
  position: relative;
}

.nav-card:hover .card-action {
  opacity: 1;
  transform: translateX(5px);
}

.card-action:after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}

.nav-card:hover .card-action:after {
  width: 100%;
}

.signature {
  margin-top: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.info-card {
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  color: white;
  border: none;
}

.info-card::before {
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent);
}

.info-card p {
  color: rgba(255, 255, 255, 0.8);
}

.info-card h2,
.info-card p {
  color: white;
}

.info-card .card-icon {
  background: rgba(255, 255, 255, 0.15);
}

.info-card:hover .card-icon {
  background: rgba(255, 255, 255, 0.25);
}

.info-card .version {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 1rem;
}

.version {
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.easter-egg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.easter-egg-modal {
  background: linear-gradient(135deg, #192231, #24344d);
  padding: 2.5rem;
  border-radius: 30px;
  max-width: 90%;
  width: 500px;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: modalSlideUp 0.4s ease;
  transform: translateY(0);
}

@keyframes modalSlideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.easter-hint {
  margin-top: 10px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.easter-egg-modal h2 {
  text-align: center;
  color: #2196f3;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(33, 150, 243, 0.3);
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .home-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-radius: 20px;
  }

  .home-header h1 {
    font-size: 1.5rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .nav-card {
    padding: 1.8rem;
    border-radius: 20px;
  }
}
</style>