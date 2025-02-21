<template>
  <div class="home">
    <header class="home-header">
      <h1>Bem-vindo ao Sistema de Gestão de Treinamentos do Grupo EL</h1>
      <!-- <div class="signature">
        Desenvolvido por Ednei Trabach
      </div> -->
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

      <div class="nav-card info-card">
        <div class="card-icon">
          <img src="/public/icons/informacao.svg" alt="Info" class="icon-home" />
        </div>
        <h2 class="about">Sobre o Sistema</h2>
        <p>Sistema desenvolvido por Ednei Trabach</p>
        <p class="version">Versão 1.0</p>
      </div>

    </div>
  </div>
</template>

<script>
import { supabase } from '../config/supabase'

export default {
  name: 'Home',
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
    }
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
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

.home-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  color: white;
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
  border-radius: 8px;
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
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.nav-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(25, 49, 85, 0.1);
}

.nav-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #193155, #254677);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.nav-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: #f8f9fa;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.nav-card:hover .card-icon {
  transform: scale(1.1);
}

.nav-card h2 {
  color: #193155;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

h2.about {
  color: white ! important;
}

.nav-card p {
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.card-action {
  margin-top: 1.5rem;
  color: #193155;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.nav-card:hover .card-action {
  opacity: 1;
  transform: translateX(5px);
}

.signature {
  margin-top: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.info-card {
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
}

.info-card p {
  color: rgba(255, 255, 255, 0.8);
}

.info-card h2,
.info-card p {
  color: white;
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

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .home-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .home-header h1 {
    font-size: 1.5rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .nav-card {
    padding: 1.5rem;
  }
}
</style>