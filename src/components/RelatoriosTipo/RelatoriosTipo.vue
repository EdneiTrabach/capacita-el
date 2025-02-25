<!-- src/components/RelatoriosTipo/RelatoriosTipo.vue -->
<template>
  <div class="relatorios-container">
    <header class="relatorios-header">
      <div class="header-content">
        <h1>Relatório por Tipo de Treinamento</h1>
        <p>Análise de treinamentos por modalidade</p>
      </div>
      <button @click="$router.push('/relatorios')" class="btn-voltar">
        <img src="/public/icons/voltar.svg" alt="Voltar" class="icon" />
        Voltar
      </button>
    </header>

    <div class="report-section">
      <div class="filters-grid">
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
          <label>Tipo de Treinamento</label>
          <select v-model="filtros.tipo">
            <option value="">Todos</option>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status</label>
          <select v-model="filtros.status">
            <option value="">Todos</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div class="actions-bar">
        <button @click="buscarDados" class="btn-gerar-pdf">
          <img src="/public/icons/pdf.svg" alt="PDF" class="icon" />
          Gerar PDF
        </button>
        <button @click="exportarExcel" class="btn-export-excel">
          <img src="/public/icons/excel.svg" alt="Excel" class="icon" />
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

<script src="./relatoriosTipo.js"></script>
<style src="./relatoriosTipo.css"></style>
