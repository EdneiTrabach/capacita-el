<template>
  <div class="usuarios-container">
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
    <header class="usuarios-header">
      <h1>Gestão de pessoas</h1>
      <button @click="$router.push('/usuarios')" class="btn-novo">
        <img src="/public/icons/adicao.svg" alt="Novo" class="icon-black" />
        Nova Pessoa
      </button>
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

    <div class="usuarios-grid">
      <div v-for="usuario in usuariosFiltrados" :key="usuario.id" class="usuario-card">
        <!-- ... resto do template original ... -->
      </div>
    </div>
    
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <!-- ... resto do template do modal ... -->
      </div>
    </div>
  </div>
</template>

<script src="./ListaUsuarios.js"></script>
<style src="./ListaUsuarios.css" scoped></style>
