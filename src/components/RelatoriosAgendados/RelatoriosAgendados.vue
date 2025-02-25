<template>
  <div class="relatorios-container">
    <header class="relatorios-header">
      <div class="header-content">
        <h1>Relatório de Treinamentos Agendados</h1>
        <p>Visualize os próximos treinamentos programados</p>
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

<script src="./relatoriosAgendados.js"></script>
<style src="./relatoriosAgendados.css"></style>