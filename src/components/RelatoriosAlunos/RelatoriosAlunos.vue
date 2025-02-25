<!-- src/components/RelatoriosAlunos/RelatoriosAlunos.vue -->
<template>
  <div class="content-wrapper">
    <header class="relatorio-header">
      <div class="header-content">
        <h1>Relatório de Alunos por Curso</h1>
        <p>Visualize e gerencie os alunos matriculados nos cursos</p>
      </div>
      <button @click="$router.push('/relatorios')" class="btn-voltar">
        <img src="/public/icons/voltar.svg" alt="Voltar" class="icon" />
        Voltar
      </button>
    </header>

    <div class="filters-section">
      <div class="filter-group">
        <label>Curso</label>
        <select v-model="filtros.cursoId">
          <option value="">Todos os cursos</option>
          <option v-for="curso in cursos" :key="curso.id" :value="curso.id">
            {{ curso.nome }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Status da Pessoa</label>
        <select v-model="filtros.status">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="cursando">Cursando</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Período de Matrícula</label>
        <div class="date-range">
          <input type="date" v-model="filtros.dataInicio">
          <span>até</span>
          <input type="date" v-model="filtros.dataFim">
        </div>
      </div>

      <div class="filter-group">
        <label>Conclusão</label>
        <select v-model="filtros.conclusao">
          <option value="">Todos</option>
          <option value="concluido">Concluído</option>
          <option value="emAndamento">Em andamento</option>
        </select>
      </div>
    </div>

    <div class="actions-bar">
      <button @click="gerarPDF" class="btn-buscar">
        <font-awesome-icon :icon="['fas', 'file-pdf']" />
        Gerar PDF
      </button>
      <button @click="exportarExcel" class="btn-export">
        <font-awesome-icon :icon="['fas', 'file-excel']" />
        Exportar Excel
      </button>
    </div>

    <DataTable 
      v-if="dados.length" 
      :dados="dados"
      :colunas="colunas"
    />
  </div>
</template>

<script src="./relatoriosAlunos.js"></script>
<style src="./relatoriosAlunos.css"></style>