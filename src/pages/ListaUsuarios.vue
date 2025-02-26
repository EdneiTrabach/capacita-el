<template>
  <div class="usuarios-container">
    <div class="hero-image">
      <img src="/gestao_pessoas.svg" alt="Gestão de Pessoas" />
    </div>

    <!-- Loader enquanto carrega -->
    <div v-if="loading" class="loading">Carregando...</div>

    <!-- Mensagem de erro -->
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
    <header class="usuarios-header" data-intro="Bem-vindo à página de Gestão de Pessoas! Aqui você pode gerenciar todos os alunos cadastrados." data-step="1">
      <div class="header-content">
        <h1>Gestão de pessoas</h1>
        <button @click="$router.push('/usuarios')" class="btn-novo" data-intro="Clique aqui para cadastrar uma nova pessoa no sistema" data-step="2">
          <img src="/public/icons/adicao.svg" alt="Novo" class="icon-black" />
          Nova Pessoa
        </button>
      </div>
    </header>

    <div class="search-bar" data-intro="Use estas opções para filtrar e buscar pessoas específicas" data-step="3">
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="Buscar por nome, email ou setor..."
        data-intro="Digite aqui para buscar por nome, email ou setor" 
        data-step="4"
      >
      <select 
        v-model="setorFilter"
        data-intro="Filtre as pessoas por setor" 
        data-step="5"
      >
        <option value="">Todos os setores</option>
        <option v-for="setor in setoresUnicos" :key="setor" :value="setor">
          {{ setor }}
        </option>
      </select>
      <select 
        v-model="statusFilter"
        data-intro="Filtre por status: Ativo, Cursando ou Inativo" 
        data-step="6"
      >
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="cursando">Cursando</option>
        <option value="inativo">Inativo</option>
      </select>
      <select v-model="sortBy" data-intro="Organize a visualização na ordem desejada" data-step="7">
        <option value="recent">Mais recentes</option>
        <option value="oldest">Mais antigos</option>
        <option value="alpha">Ordem alfabética</option>
      </select>
    </div>

    <!-- Lista de usuários -->
    <div v-if="usuariosFiltrados.length" class="usuarios-grid" data-intro="Aqui estão listados todos os alunos cadastrados no sistema" data-step="8">
      <!-- Card demonstrativo para o tutorial quando não houver usuários -->
      <div v-if="usuariosFiltrados.length === 0" class="usuario-card" data-intro="Cada card representa uma pessoa cadastrada com suas informações e opções de gerenciamento" data-step="9">
        <div class="usuario-header">
          <span class="usuario-avatar">AA</span>
          <div class="actions" data-intro="Utilize estes botões para editar ou excluir o cadastro da pessoa" data-step="10">
            <button class="btn-edit">
              <img src="/public/icons/edicao.svg" alt="Editar" class="icon" />
            </button>
            <button class="btn-delete">
              <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon" />
            </button>
          </div>
        </div>
        <div class="usuario-body">
          <h3>Nome de Demonstração</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Email:</span>
              <span>email@exemplo.com</span>
            </div>
            <div class="info-item">
              <span class="label">Telefone:</span>
              <span>(00) 00000-0000</span>
            </div>
            <div class="info-item">
              <span class="label">Setor:</span>
              <span>Exemplo</span>
            </div>
            <div class="info-item">
              <span class="label">Cidade:</span>
              <span>Cidade/UF</span>
            </div>
            <div class="info-item">
              <span class="label">Data de Nascimento:</span>
              <span>01/01/2000</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <span class="status-ativo">ativo</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <div class="status-toggle" data-intro="Gerencie o status do aluno facilmente clicando em um destes botões" data-step="11">
            <button class="status-btn">
              <img src="/public/icons/check.svg" alt="Ativo" class="icon-black"/>
              Ativo
            </button>
            <button class="status-btn">
              <img src="/public/icons/cursando.svg" alt="Cursando" class="icon-black"/>
              Cursando
            </button>
            <button class="status-btn">
              <img src="/public/icons/fechar.svg" alt="Editar" class="icon-black"/>
              Inativo
            </button>
          </div>
        </div>
      </div>

      <!-- Cards reais de usuários -->
      <div 
        v-for="usuario in usuariosFiltrados" 
        :key="usuario.id" 
        class="usuario-card"
        :data-intro="usuario === usuariosFiltrados[0] ? 'Cada card representa uma pessoa cadastrada com suas informações e opções de gerenciamento' : null"
        :data-step="usuario === usuariosFiltrados[0] ? 9 : null"
      >
        <div class="usuario-header">
          <span class="usuario-avatar">{{ getInitials(usuario.nome) }}</span>
          <div class="actions"
               :data-intro="usuario === usuariosFiltrados[0] ? 'Utilize estes botões para editar ou excluir o cadastro da pessoa' : null"
               :data-step="usuario === usuariosFiltrados[0] ? 10 : null">
            <button 
              @click="editarUsuario(usuario)" 
              class="btn-edit"
              :disabled="usuario.tem_certificado"
              :title="usuario.tem_certificado ? 'Não é possível editar um usuário que possui certificados emitidos' : ''"
            >
              <img src="/public/icons/edicao.svg" alt="Editar" class="icon" />
            </button>
            <button 
              @click="deletarUsuario(usuario.id)" 
              class="btn-delete"
              :disabled="usuario.tem_certificado"
              :title="usuario.tem_certificado ? 'Não é possível excluir um aluno que possui certificados emitidos' : ''"
            >
              <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon" />
            </button>
          </div>
        </div>

        <div class="usuario-body">
          <h3>{{ sanitizeHTML(usuario.nome) }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Email:</span>
              <span>{{ sanitizeHTML(usuario.email) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Telefone:</span>
              <span>{{ usuario.telefone }}</span>
            </div>
            <div class="info-item">
              <span class="label">Setor:</span>
              <span>{{ usuario.setor }}</span>
            </div>
            <div class="info-item">
              <span class="label">Cidade:</span>
              <span>{{ usuario.cidade }}/{{ usuario.estado }}</span>
            </div>
            <div class="info-item">
              <span class="label">Data de Nascimento:</span>
              <span>{{ formatDate(usuario.data_nascimento) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <span :class="'status-' + usuario.status">{{ usuario.status }}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <div class="status-toggle"
               :data-intro="usuario === usuariosFiltrados[0] ? 'Gerencie o status do aluno facilmente clicando em um destes botões' : null"
               :data-step="usuario === usuariosFiltrados[0] ? 11 : null">
            <button 
              @click="toggleStatus(usuario, 'ativo')" 
              :class="['status-btn', { active: usuario.status === 'ativo' }]">
            <img src="/public/icons/check.svg" alt="Ativo" class="icon-black"/>
            Ativo
          </button>
            <button 
              @click="toggleStatus(usuario, 'cursando')" 
              :class="['status-btn', { active: usuario.status === 'cursando' }]"
            >
            <img src="/public/icons/cursando.svg" alt="Cursando" class="icon-black"/>
            Cursando
            </button>
            <button 
              @click="toggleStatus(usuario, 'inativo')" 
              :class="['status-btn', { active: usuario.status === 'inativo' }]"
            >
            <img src="/public/icons/fechar.svg" alt="Editar" class="icon-black"/>
            Inativo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensagem quando não há usuários -->
    <div v-else-if="!loading" class="no-data">
      Nenhum usuário encontrado
    </div>

    <!-- Adicione o modal após o grid de usuários -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Editar Aluno</h2>
        <form @submit.prevent="handleEditSubmit" class="edit-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome Completo*</label>
              <input 
                type="text" 
                v-model="editingUser.nome"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                v-model="editingUser.email"
                placeholder="Digite o email"
              />
            </div>

            <div class="form-group">
              <label>Data de Nascimento</label>
              <input 
                type="date" 
                v-model="editingUser.data_nascimento"
              />
            </div>

            <div class="form-group">
              <label>Telefone</label>
              <input 
                type="tel" 
                v-model="editingUser.telefone"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div class="form-group">
              <label>Estado</label>
              <select 
                v-model="editingUser.estado" 
                @change="buscarMunicipios(editingUser.estado)"
              >
                <option value="">Selecione um estado</option>
                <option v-for="estado in estados" :key="estado.uf" :value="estado.uf">
                  {{ estado.nome }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Cidade</label>
              <select 
                v-model="editingUser.cidade"
                :disabled="!editingUser.estado"
              >
                <option value="">Selecione uma cidade</option>
                <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.nome">
                  {{ municipio.nome }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Origem*</label>
              <div class="setor-input-group">
                <select v-model="editingUser.setor" required>
                  <option value="">Selecione uma origem</option>
                  <option v-for="setor in setores" :key="setor.id" :value="setor.nome">
                    {{ setor.nome }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn-cancelar">
              <img src="/icons/fechar.svg" alt="Cancelar" class="icon"/>
              Cancelar
            </button>
            <button type="submit" class="btn-salvar" :disabled="loading">
              <img src="/icons/save-fill.svg" alt="Salvar" class="icon"/>
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Componente IntroJS -->
    <IntroJS 
      ref="introJs"
      :steps="introSteps"
      :options="introOptions" 
    />
  </div>
</template>

<script>
import ListaUsuarios from './ListaUsuarios.js'
import IntroJS from '../components/IntroJS.vue'

export default {
  components: {
    IntroJS
  },
  setup() {
    try {
      const {
        loading,
        error, 
        toast,
        usuarios,
        searchTerm,
        setorFilter,
        statusFilter,
        sortBy,
        setores,
        showEditModal,
        editingUser,
        municipios,
        setoresUnicos,
        usuariosFiltrados,
        formatDate,
        getInitials,
        sanitizeHTML,
        toggleStatus,
        deletarUsuario,
        editarUsuario,
        handleEditSubmit,
        closeEditModal
      } = ListaUsuarios.setup()
      
      // Configurações do IntroJS
      const introSteps = [
        {
          element: '.usuarios-header',
          intro: 'Bem-vindo à página de Gestão de Pessoas! Aqui você pode gerenciar todos os alunos cadastrados.',
          position: 'bottom'
        },
        {
          element: '.btn-novo',
          intro: 'Clique aqui para cadastrar uma nova pessoa no sistema',
          position: 'left'
        },
        {
          element: '.search-bar',
          intro: 'Use estas opções para filtrar e buscar pessoas específicas',
          position: 'bottom'
        },
        {
          element: '.search-bar input',
          intro: 'Digite aqui para buscar por nome, email ou setor',
          position: 'bottom'
        },
        {
          element: '.search-bar select:nth-child(2)',
          intro: 'Filtre as pessoas por setor',
          position: 'bottom'
        },
        {
          element: '.search-bar select:nth-child(3)',
          intro: 'Filtre por status: Ativo, Cursando ou Inativo',
          position: 'bottom'
        },
        {
          element: '.search-bar select:nth-child(4)',
          intro: 'Organize a visualização na ordem desejada',
          position: 'bottom'
        },
        {
          element: '.usuarios-grid',
          intro: 'Aqui estão listados todos os alunos cadastrados no sistema',
          position: 'top'
        },
        {
          element: '.usuario-card',
          intro: 'Cada card representa uma pessoa cadastrada com suas informações e opções de gerenciamento',
          position: 'right'
        },
        {
          element: '.actions',
          intro: 'Utilize estes botões para editar ou excluir o cadastro da pessoa',
          position: 'left'
        },
        {
          element: '.status-toggle',
          intro: 'Gerencie o status do aluno facilmente clicando em um destes botões',
          position: 'top'
        }
      ];
      
      const introOptions = {
        showStepNumbers: true,
        showBullets: true,
        showProgress: true,
        exitOnOverlayClick: false,
        nextLabel: 'Próximo',
        prevLabel: 'Anterior',
        doneLabel: 'Concluir'
      };

      return {
        loading,
        error,
        toast,
        usuarios,
        searchTerm, 
        setorFilter,
        statusFilter,
        sortBy,
        setores,
        showEditModal,
        editingUser,
        municipios,
        setoresUnicos,
        usuariosFiltrados,
        formatDate,
        getInitials,
        sanitizeHTML,
        toggleStatus,
        deletarUsuario,
        editarUsuario,
        handleEditSubmit,
        closeEditModal,
        // Propriedades do IntroJS
        introSteps,
        introOptions
      }

    } catch (error) {
      console.error('Erro no setup:', error)
      return {
        error: error.message
      }
    }
  },
  mounted() {
    // Iniciar o tutorial automaticamente na primeira visita
    // Você pode adicionar uma lógica para verificar se é a primeira visita
    // this.$refs.introJs.startIntro();
  },
  methods: {
    startTutorial() {
      if (this.$refs.introJs) {
        this.$refs.introJs.startIntro();
      }
    }
  }
}
</script>

<style>
@import '../styles/usuarios.css';

.hero-image {
  position: absolute;
  top: 5px;
  left: 50px;
  width: 200px;
  z-index: 3;
}

.hero-image img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2)); /* Added shadow */
}

.header-content h1 {
  flex: 1;
  text-align: center;
  margin: 0;
}

.btn-novo {
  position: absolute;
  right: 20px;
}
</style>