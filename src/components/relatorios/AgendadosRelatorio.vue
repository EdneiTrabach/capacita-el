<template>
  <div class="relatorio-section">
    <h3>Relatório de Treinamentos Agendados</h3>
    
    <div class="filtros">
      <div class="date-range">
        <label>Período:</label>
        <input 
          type="date" 
          v-model="filtros.dataInicio" 
          :min="hoje"
          @change="buscarDados"
        >
        <span>até</span>
        <input 
          type="date" 
          v-model="filtros.dataFim"
          :min="filtros.dataInicio"
          @change="buscarDados"
        >
      </div>

      <button @click="gerarRelatorio" class="btn-gerar">
        <img src="/public/icons/pdf.svg" alt="PDF" class="icon"/>
        Gerar Relatório
      </button>
    </div>

    <div class="resultados" v-if="dados.length">
      <table>
        <thead>
          <tr>
            <th>Treinamento</th>
            <th>Data Início</th>
            <th>Tipo</th>
            <th>Inscritos</th>
            <th>Vagas Restantes</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dados" :key="item.id">
            <td>{{ item.nome }}</td>
            <td>{{ formatDate(item.data_inicio) }}</td>
            <td>{{ item.tipo }}</td>
            <td>{{ item.total_inscritos }}</td>
            <td>{{ item.vagas_restantes }}</td>
            <td>
              <span :class="'status-' + item.status.toLowerCase()">
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/date'
import type { AgendadoItem } from '@/types/relatorio'

const hoje = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const filtros = ref({
  dataInicio: hoje.value,
  dataFim: ''
})

const dados = ref<AgendadoItem[]>([])
const loading = ref(false)

const buscarDados = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('cursos')
      .select(`
        id,
        nome,
        data_inicio,
        tipo,
        matriculas,
        vagas,
        status
      `)
      .gte('data_inicio', filtros.value.dataInicio)
      .lte('data_inicio', filtros.value.dataFim || '2099-12-31')
      .order('data_inicio', { ascending: true })

    if (error) throw error

    dados.value = data?.map(curso => ({
      ...curso,
      total_inscritos: curso.matriculas || 0,
      vagas_restantes: (curso.vagas || 0) - (curso.matriculas || 0)
    })) || []

  } catch (err) {
    console.error('Erro ao buscar dados:', err)
  } finally {
    loading.value = false
  }
}

const gerarRelatorio = async () => {
  // Implementar geração PDF
  console.log('Gerando relatório...')
}
</script>

<style scoped>
.status-agendado { color: #2196f3; }
.status-confirmado { color: #4caf50; }
.status-cancelado { color: #f44336; }
</style>
