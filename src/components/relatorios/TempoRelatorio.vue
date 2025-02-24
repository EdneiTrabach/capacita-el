<template>
  <div class="relatorio-section">
    <h3>Relatório por Tempo de Treinamento</h3>
    
    <div class="filtros">
      <div class="range-filter">
        <label>Carga Horária:</label>
        <select v-model="filtros.faixa" @change="buscarDados">
          <option value="">Todas</option>
          <option value="1-4">1-4 horas</option>
          <option value="5-8">5-8 horas</option>
          <option value="9-16">9-16 horas</option>
          <option value="17+">17+ horas</option>
        </select>
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
            <th>Faixa de Tempo</th>
            <th>Total Cursos</th>
            <th>Total Participantes</th>
            <th>Média Conclusão</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dados" :key="item.faixa">
            <td>{{ item.faixa }}</td>
            <td>{{ item.total_cursos }}</td>
            <td>{{ item.total_participantes }}</td>
            <td>{{ item.media_conclusao }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/config/supabase'

const filtros = ref({
  faixa: ''
})

const dados = ref([])

const buscarDados = async () => {
  // Implementar busca de dados por tempo
}
</script>