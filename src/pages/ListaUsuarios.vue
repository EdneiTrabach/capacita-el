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
    <header class="usuarios-header">
      <div class="header-content">
        <h1>Gestão de pessoas</h1>
        <button @click="$router.push('/usuarios')" class="btn-novo">
          <img src="/public/icons/adicao.svg" alt="Novo" class="icon-black" />
          Nova Pessoa
        </button>
      </div>
    </header>

    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="Buscar por nome, email ou setor..."
      >
      <select v-model="setorFilter">
        <option value="">Todos os setores</option>
        <option v-for="setor in setoresUnicos" :key="setor" :value="setor">
          {{ setor }}
        </option>
      </select>
      <select v-model="statusFilter">
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="cursando">Cursando</option>
        <option value="inativo">Inativo</option>
      </select>
      <select v-model="sortBy">
        <option value="recent">Mais recentes</option>
        <option value="oldest">Mais antigos</option>
        <option value="alpha">Ordem alfabética</option>
      </select>
    </div>

    <!-- Lista de usuários -->
    <div v-if="usuarios.length" class="usuarios-grid">
      <div v-for="usuario in usuariosFiltrados" :key="usuario.id" class="usuario-card">
        <div class="usuario-header">
          <span class="usuario-avatar">{{ getInitials(usuario.nome) }}</span>
          <div class="actions">
            <button 
              @click="editarUsuario(usuario)" 
              class="btn-edit"
              :disabled="usuario.tem_certificado"
              :title="usuario.tem_certificado ? 'Não é possível editar um usuário que possui certificados emitidos' : ''"
            >
              <img src="/public/icons/edicao.svg" alt="Editar" class="icon" />
              <!-- Editar -->
            </button>
            <button 
              @click="deletarUsuario(usuario.id)" 
              class="btn-delete"
              :disabled="usuario.tem_certificado"
              :title="usuario.tem_certificado ? 'Não é possível excluir um aluno que possui certificados emitidos' : ''"
            >
              <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon" />
              <!-- Excluir -->
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
          <div class="status-toggle">
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
  </div>
</template>

<script>
import ListaUsuarios from './ListaUsuarios.js'
export default ListaUsuarios
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

/* Ajuste para evitar sobreposição do conteúdo */
.usuarios-header {
  position: relative;
  z-index: 2;
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