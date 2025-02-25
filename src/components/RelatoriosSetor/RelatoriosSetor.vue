<template>
  <div class="relatorios-container">
    <TheSidebar />
    
    <div class="content-wrapper">
      <header class="relatorios-header">
        <div class="header-content">
          <h1>Relatório por Setor</h1>
          <p>Distribuição de treinamentos por setor</p>
        </div>
        <button @click="$router.push('/relatorios')" class="btn-voltar">
          <img src="/public/icons/voltar.svg" alt="Voltar" class="icon" />
          Voltar
        </button>
      </header>

      <div class="report-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Setor</label>
            <select v-model="filtros.setor">
              <option value="">Todos os setores</option>
              <option v-for="setor in setores" :key="setor" :value="setor">
                {{ setor }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Período</label>
            <div class="date-range">
              <input type="date" v-model="filtros.dataInicio" :max="filtros.dataFim">
              <span>até</span>
              <input type="date" v-model="filtros.dataFim" :min="filtros.dataInicio">
            </div>
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
  setor: '',
  dataInicio: '',
  dataFim: ''
})

const dados = ref([])
const setores = ref([])

const colunas = [
  { field: 'setor', header: 'Setor' },
  { field: 'total_funcionarios', header: 'Total Funcionários' },
  { field: 'cursos_realizados', header: 'Cursos Realizados' },
  { field: 'em_andamento', header: 'Em Andamento' }
]

const buscarDados = async () => {
  try {
    const response = await fetch('/api/relatorios/setor', {
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

<style src="./relatoriosSetor.css"></style>