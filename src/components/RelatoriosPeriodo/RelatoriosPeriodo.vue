<template>
  <div class="relatorios-container">
    <TheSidebar />
    
    <div class="content-wrapper">
      <header class="relatorios-header">
        <div class="header-content">
          <h1>Relatório por Período</h1>
          <p>Análise de treinamentos por período específico</p>
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
              <input type="date" v-model="filtros.dataInicio" :max="filtros.dataFim">
              <span>até</span>
              <input type="date" v-model="filtros.dataFim" :min="filtros.dataInicio">
            </div>
          </div>

          <div class="filter-group">
            <label>Status</label>
            <select v-model="filtros.status">
              <option value="">Todos</option>
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Tipo</label>
            <select v-model="filtros.tipo">
              <option value="">Todos</option>
              <option v-for="tipo in tiposOptions" :key="tipo" :value="tipo">
                {{ tipo }}
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import { exportarParaPDF, exportarParaExcel } from '@/utils/exportadores'

const filtros = ref({
  dataInicio: '',
  dataFim: '',
  status: '',
  tipo: ''
})

const dados = ref([])

const statusOptions = [
  'Em andamento',
  'Concluído',
  'Cancelado'
]

const tiposOptions = [
  'Online',
  'Presencial',
  'Híbrido'
]

const colunas = [
  { field: 'nome', header: 'Treinamento' },
  { field: 'tipo', header: 'Tipo' },
  { field: 'status', header: 'Status' },
  { field: 'participantes', header: 'Participantes' }
]

const buscarDados = async () => {
  try {
    const response = await fetch('/api/relatorios/periodo', {
      method: 'POST',
      body: JSON.stringify(filtros.value)
    })
    dados.value = await response.json()
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
  }
}

const exportarPDF = () => exportarParaPDF(dados.value)
const exportarExcel = () => exportarParaExcel(dados.value)
</script>

<style src="./relatoriosPeriodo.css"></style>