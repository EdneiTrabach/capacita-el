// src/components/RelatoriosPendentes/RelatoriosPendentes.vue
<template>
  <div class="relatorio-container">
    <div class="content-wrapper">
      <header class="relatorio-header">
        <div class="header-content">
          <h1>Relatório de Certificados Pendentes</h1>
          <p>Visualize e gerencie os certificados pendentes de emissão</p>
        </div>
        <button @click="$router.push('/relatorios')" class="btn-voltar">
          <img src="/public/icons/voltar.svg" alt="Voltar" class="icon" />
          Voltar
        </button>
      </header>

      <div class="filters-section">
        <div class="filter-group">
          <label>Período</label>
          <div class="date-range">
            <input 
              type="date" 
              v-model="filtros.dataInicio"
              :max="filtros.dataFim"
            >
            <span>até</span>
            <input 
              type="date" 
              v-model="filtros.dataFim"
              :min="filtros.dataInicio"
            >
          </div>
        </div>

        <div class="filter-group">
          <label>Curso</label>
          <select v-model="filtros.cursoId">
            <option value="">Todos</option>
            <option v-for="curso in cursos" :key="curso.id" :value="curso.id">
              {{ curso.nome }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status</label>
          <select v-model="filtros.status">
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="em_analise">Em Análise</option>
          </select>
        </div>
      </div>

      <div class="actions-bar">
        <button @click="buscarDados" class="btn-buscar">
          <font-awesome-icon :icon="['fas', 'search']" />
          Buscar
        </button>
        <button @click="exportarPDF" class="btn-export">
          <font-awesome-icon :icon="['fas', 'file-pdf']" />
          Exportar PDF
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
  </div>
</template>

<script src="./relatoriosPendentes.js"></script>
<style src="./relatoriosPendentes.css"></style>