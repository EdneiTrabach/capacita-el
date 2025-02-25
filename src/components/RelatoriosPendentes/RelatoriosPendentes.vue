<template>
  <div class="relatorios-container">
    <header class="relatorios-header">
      <div class="header-content">
        <h1>Relatório de Certificados Pendentes</h1>
        <p>Visualize e gerencie os certificados pendentes de emissão</p>
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

<script src="./relatoriosPendentes.js"></script>
<style src="./relatoriosPendentes.css"></style>