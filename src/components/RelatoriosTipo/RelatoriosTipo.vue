<!-- src/components/RelatoriosTipo/RelatoriosTipo.vue -->
<template>
  <div class="relatorio-container">
    <header class="relatorio-header">
      <h1>Relatório por Tipo de Treinamento</h1>
      <p>Análise de treinamentos por modalidade</p>
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
      <button @click="buscarDados" class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'search']" />
        Buscar
      </button>
      <button @click="exportarPDF" class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'file-pdf']" />
        Exportar PDF
      </button>
      <button @click="exportarExcel" class="btn btn-secondary">
        <font-awesome-icon :icon="['fas', 'file-excel']" />
        Exportar Excel
      </button>
    </div>

    <div v-if="dados.length" class="data-table">
      <table>
        <thead>
          <tr>
            <th v-for="coluna in colunas" :key="coluna.field">
              {{ coluna.header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dados" :key="item.id">
            <td v-for="coluna in colunas" :key="coluna.field">
              {{ item[coluna.field] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script src="./relatoriosTipo.js"></script>
<style src="./relatoriosTipo.css"></style>
