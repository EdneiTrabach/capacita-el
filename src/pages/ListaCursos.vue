<template>
  <div class="cursos-container">
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
    
    <header class="cursos-header">
      <img src="/treina_cadastrado.svg" alt="Treinamentos" class="header-icon" />
      <h1>Treinamentos Cadastrados</h1>
      <button @click="$router.push('/cursos')" class="btn-novo">
        <img src="/public/icons/adicao.svg" alt="Novo" class="icon-black" />
        Novo Treinamento
      </button>
    </header>

    <SearchBar
      v-model:search="searchTerm"
      v-model:status="statusFilter"
    />

    <CursosList 
      :cursos="cursos"
      :hasCertificado="false"
      @edit="editarCurso"
      @delete="deletarCurso"
      @status-change="toggleStatus"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useListaCursosLogic } from './ListaCursosLogic'
import SearchBar from '../components/SearchBar.vue'
import CursosList from '../components/CursosList.vue'

export default defineComponent({
  name: 'ListaCursos',
  components: {
    SearchBar,
    CursosList
  },
  setup() {
    const { 
      cursos,
      searchTerm,
      statusFilter,
      editarCurso,
      deletarCurso,
      toggleStatus,
      toast
    } = useListaCursosLogic()

    return {
      cursos,
      searchTerm,
      statusFilter,
      editarCurso,
      deletarCurso,
      toggleStatus,
      toast
    }
  }
})
</script>

<style>
@import '../pages/ListaCursos.css';
</style>