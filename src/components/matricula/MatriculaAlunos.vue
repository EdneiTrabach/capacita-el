<template>
  <div class="matricula-container">
    <div class="matricula-header">
      <h1>Matrícula de Alunos</h1>
    </div>

    <!-- Mensagens de erro/sucesso -->
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <div class="curso-info" v-if="cursos[0]">
      <h2>{{ cursos[0].nome }}</h2>
      <p>Status: {{ cursos[0].status }}</p>
    </div>

    <div v-if="cursoSelecionado" class="matricula-grid">
      <div class="alunos-disponiveis">
        <h3>Alunos Disponíveis</h3>
        <input 
          v-model="searchTerm" 
          placeholder="Buscar alunos..."q
          type="text"
        />
        <div class="alunos-list">
          <div 
            v-for="aluno in alunosFiltrados" 
            :key="aluno.id"
            class="aluno-item"
            :class="{ selected: alunosSelecionados.includes(aluno.id) }"
            @click="toggleAluno(aluno.id)"
          >
            {{ aluno.nome }}
            <span class="email">{{ aluno.email }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button 
          @click="matricularAlunos" 
          :disabled="loading || !alunosSelecionados.length"
          class="btn-matricular"
        >
          {{ loading ? 'Matriculando...' : 'Matricular Selecionados' }}
        </button>
      </div>

      <div class="alunos-matriculados">
        <h3>Alunos Matriculados</h3>
        <div class="matriculados-list">
          <div 
            v-for="matricula in matriculas" 
            :key="matricula.id" 
            class="matricula-item"
          >
            {{ matricula.aluno.nome }}
            <button 
              @click="removerMatricula(matricula.id)"
              class="btn-remove"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Matrícula Dialog -->
    <div v-if="showDeleteMatriculaDialog" class="modal-overlay">
      <div class="delete-dialog">
        <h2>Confirmar Remoção de Matrícula</h2>
        
        <div class="dialog-content">
          <font-awesome-icon 
            :icon="['fas', 'triangle-exclamation']" 
            class="warning-icon"
          />
          <p>Tem certeza que deseja remover a matrícula de <strong>{{ matriculaToDelete?.aluno?.nome }}</strong>?</p>
          <p class="warning-text">Esta ação não poderá ser desfeita.</p>
        </div>

        <div class="dialog-actions">
          <button type="button" @click="showDeleteMatriculaDialog = false" class="btn-cancelar">
            <img src="/icons/fechar.svg" alt="Cancelar" class="icon"/>
            Cancelar
          </button>
          <button 
            @click="confirmRemoverMatricula" 
            class="btn-deletar"
          >
            <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon"/>
            Remover
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMatriculaAlunos } from './useMatriculaAlunos'
import './MatriculaAlunos.css'

const {
  cursos,
  cursoSelecionado,
  alunosFiltrados,
  matriculas,
  alunosSelecionados,
  searchTerm,
  loading,
  error,
  success,
  toggleAluno,
  matricularAlunos,
  removerMatricula,
  showDeleteMatriculaDialog,
  matriculaToDelete,
  confirmRemoverMatricula
} = useMatriculaAlunos()
</script>
