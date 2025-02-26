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

    <!-- Modal de confirmação de exclusão -->
    <div v-if="showDeleteDialog" class="modal-overlay">
      <div class="delete-dialog">
        <h2>Confirmar Exclusão</h2>
        
        <div class="dialog-content">
          <font-awesome-icon 
            :icon="['fas', 'triangle-exclamation']" 
            class="warning-icon"
          />
          <p>Tem certeza que deseja excluir o curso <strong>{{ cursoToDelete?.nome }}</strong>?</p>
          <p class="warning-text">Esta ação excluirá permanentemente o curso e todos os dados relacionados. Esta ação não poderá ser desfeita.</p>
        </div>

        <div class="dialog-actions">
          <button 
            @click="cancelDeleteCurso" 
            class="btn-cancelar"
          >
            <img src="/public/icons/fechar.svg" alt="Cancelar" class="icon"/>
            Cancelar
          </button>
          <button 
            @click="confirmDeleteCurso" 
            class="btn-deletar"
          >
            <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon"/>
            Excluir
          </button>
        </div>
      </div>
    </div>
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
      toast,
      // Adicionar estas propriedades para o modal de confirmação
      showDeleteDialog,
      cursoToDelete,
      confirmDeleteCurso,
      cancelDeleteCurso
    } = useListaCursosLogic()

    return {
      cursos,
      searchTerm,
      statusFilter,
      editarCurso,
      deletarCurso,
      toggleStatus,
      toast,
      // Retornar também estas propriedades
      showDeleteDialog,
      cursoToDelete,
      confirmDeleteCurso,
      cancelDeleteCurso
    }
  }
})
</script>

<style>
@import '../pages/ListaCursos.css';
</style>