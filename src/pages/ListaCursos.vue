<template>
  <div class="cursos-container">
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
    
    <header class="cursos-header" data-intro="Esta é a página de listagem de treinamentos cadastrados no sistema">
      <img src="/treina_cadastrado.svg" alt="Treinamentos" class="header-icon" />
      <h1>Treinamentos Cadastrados</h1>
      <button @click="$router.push('/cursos')" class="btn-novo" data-intro="Clique aqui para cadastrar um novo treinamento">
        <img src="/public/icons/adicao.svg" alt="Novo" class="icon-black" />
        Novo Treinamento
      </button>
    </header>

    <SearchBar
      v-model:search="searchTerm"
      v-model:status="statusFilter"
      data-intro="Utilize esta barra para pesquisar e filtrar os treinamentos"
    />

    <CursosList 
      :cursos="cursos"
      :hasCertificado="false"
      @edit="editarCurso"
      @delete="deletarCurso"
      @status-change="toggleStatus"
      data-intro="Aqui você pode visualizar todos os treinamentos cadastrados, editar, excluir ou alterar seu status"
    />

    <!-- Componente IntroJS -->
    <IntroJS 
      :steps="introSteps"
      :options="introOptions"
      ref="introJs"
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
import { defineComponent, ref } from 'vue'
import { useListaCursosLogic } from './ListaCursosLogic'
import SearchBar from '../components/SearchBar.vue'
import CursosList from '../components/CursosList.vue'
import IntroJS from '../components/IntroJS.vue'

export default defineComponent({
  name: 'ListaCursos',
  components: {
    SearchBar,
    CursosList,
    IntroJS
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

    // Referência para o componente IntroJS
    const introJs = ref(null);

    // Configuração dos passos do tutorial
    const introSteps = [
      {
        intro: "Bem-vindo à tela de listagem de treinamentos! Vamos conhecer as funcionalidades disponíveis."
      },
      {
        element: '.cursos-header',
        title: 'Treinamentos Cadastrados',
        intro: "Esta é a página onde você pode visualizar e gerenciar todos os treinamentos cadastrados no sistema."
      },
      {
        element: '.btn-novo',
        title: 'Novo Treinamento',
        intro: "Clique aqui para cadastrar um novo treinamento no sistema.",
        position: 'left'
      },
      {
        element: 'div:has(> .search-bar)',
        title: 'Filtros de Busca',
        intro: "Utilize esta barra para pesquisar treinamentos por nome ou filtrar por status.",
        position: 'bottom'
      },
      {
        element: '.cursos-list',
        title: 'Lista de Treinamentos',
        intro: "Aqui você pode visualizar todos os treinamentos cadastrados, além de poder editá-los, excluí-los ou alterar seu status."
      }
    ];

    // Opções personalizadas para o IntroJS
    const introOptions = {
      showStepNumbers: true,
      exitOnOverlayClick: false,
      showBullets: true,
      showProgress: true,
      doneLabel: "Finalizar",
      nextLabel: "Próximo",
      prevLabel: "Anterior"
    };

    // Função para iniciar o tutorial
    const startTutorial = () => {
      if (introJs.value) {
        introJs.value.startIntro();
      }
    };

    // Inicia o tutorial automaticamente na primeira visita
    // Descomente o código abaixo se quiser que o tutorial inicie automaticamente
    /* 
    onMounted(() => {
      const tutorialVisto = localStorage.getItem('listaCursosTutorialVisto');
      if (!tutorialVisto) {
        setTimeout(() => {
          startTutorial();
          localStorage.setItem('listaCursosTutorialVisto', 'true');
        }, 1000);
      }
    });
    */

    return {
      cursos,
      searchTerm,
      statusFilter,
      editarCurso,
      deletarCurso,
      toggleStatus,
      toast,
      introJs,
      introSteps,
      introOptions,
      startTutorial,
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