<template>
  <div class="relatorio-card">
    <div class="card-header">
      <h3>Relatório por Período</h3>
      <div class="filtros">
        <div class="date-range">
          <input 
            type="date" 
            v-model="filtros.dataInicio"
            class="date-input"
          >
          <span>até</span>
          <input 
            type="date" 
            v-model="filtros.dataFim"
            class="date-input"
          >
        </div>
        <button @click="gerarRelatorio" class="btn-gerar">
          <img src="/icons/pdf.svg" alt="PDF" class="icon"/>
          Gerar Relatório
        </button>
      </div>
    </div>

    <div class="relatorio-content">
      <!-- Tabela de resultados -->
      <table v-if="dados.length">
        <thead>
          <tr>
            <th>Treinamento</th>
            <th>Data Início</th>
            <th>Data Fim</th>
            <th>Total Alunos</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dados" :key="item.id">
            <td>{{ item.nome }}</td>
            <td>{{ formatDate(item.data_inicio) }}</td>
            <td>{{ formatDate(item.data_fim) }}</td>
            <td>{{ item.total_alunos }}</td>
            <td>{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/date'

export default {
  name: 'PeriodoRelatorio',
  
  setup() {
    const filtros = ref({
      dataInicio: '',
      dataFim: ''
    })

    const dados = ref([])
    const loading = ref(false)

    const buscarDados = async () => {
      try {
        loading.value = true
        
        const { data, error } = await supabase
          .from('cursos')
          .select(`
            *,
            matriculas (count),
            usuarios (count)
          `)
          .gte('data_inicio', filtros.value.dataInicio)
          .lte('data_fim', filtros.value.dataFim)

        if (error) throw error
        dados.value = data
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        loading.value = false
      }
    }

    const gerarRelatorio = async () => {
      // Implementar geração PDF
    }

    onMounted(() => {
      buscarDados()
    })

    return {
      filtros,
      dados,
      loading,
      buscarDados,
      gerarRelatorio
    }
  }
}
</script>

<style scoped>
.relatorio-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filtros {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid #e0e4e8;
  border-radius: 4px;
}

/* ... mais estilos ... */
</style>