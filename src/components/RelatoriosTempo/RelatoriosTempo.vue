<template>
  <div class="relatorios-container">
    <header class="relatorios-header">
      <div class="header-content">
        <h1>Relatório por Tempo de Treinamento</h1>
        <p>Análise da distribuição de carga horária dos treinamentos</p>
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
          <label>Carga Horária</label>
          <select v-model="filtros.cargaHoraria">
            <option value="">Todas</option>
            <option value="0-20">Até 20 horas</option>
            <option value="21-40">21 a 40 horas</option>
            <option value="41-60">41 a 60 horas</option>
            <option value="60+">Acima de 60 horas</option>
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

<script setup>
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import DataTable from '@/components/DataTable.vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

const filtros = ref({
  dataInicio: '',
  dataFim: '',
  cargaHoraria: '',
  status: ''
})

const dados = ref([])

const colunas = [
  { field: 'nome', header: 'Treinamento' },
  { field: 'carga_horaria', header: 'Carga Horária' },
  { field: 'data_inicio', header: 'Data Início' },
  { field: 'data_fim', header: 'Data Fim' },
  { field: 'status', header: 'Status' }
]

const buscarDados = async () => {
  try {
    const response = await supabase
      .from('cursos')
      .select('*')
      .order('carga_horaria', { ascending: false })
    
    dados.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
  }
}

const exportarPDF = () => {
  // Implementar exportação PDF
}

const exportarExcel = () => {
  // Implementar exportação Excel
}
</script>

<style src="./relatoriosTempo.css"></style>