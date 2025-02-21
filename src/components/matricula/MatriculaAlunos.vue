<template>
  <div class="matricula-container">
    <h1>Matrícula de Alunos</h1>

    <div class="curso-info" v-if="cursos[0]">
      <h2>{{ cursos[0].nome }}</h2>
      <p>Status: {{ cursos[0].status }}</p>
    </div>

    <div v-if="cursoSelecionado" class="matricula-grid">
      <div class="alunos-disponiveis">
        <h3>Alunos Disponíveis</h3>
        <input 
          v-model="searchTerm" 
          placeholder="Buscar alunos..."
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
  toggleAluno,
  matricularAlunos,
  removerMatricula
} = useMatriculaAlunos()
</script>
