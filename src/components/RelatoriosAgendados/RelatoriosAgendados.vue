
<template>
  <div class="relatorio-container">
    <div class="content-wrapper">
      <header class="relatorio-header">
        <h1>Relatório de Treinamentos Agendados</h1>
        <p>Visualize os próximos treinamentos programados</p>
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
          <label>Status</label>
          <select v-model="filtros.status">
            <option value="">Todos</option>
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Professor</label>
          <select v-model="filtros.professorId">
            <option value="">Todos</option>
            <option v-for="professor in professores" :key="professor.id" :value="professor.id">
              {{ professor.nome }}
            </option>
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

<script src="./relatoriosAgendados.js"></script>
<style src="./relatoriosAgendados.css"></style>