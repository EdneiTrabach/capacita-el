<template>
  <div class="relatorio-section">
    <h3>Relatório por Tipo de Treinamento</h3>
    
    <div class="filtros">
      <select v-model="filtros.tipo" @change="buscarDados">
        <option value="">Todos os tipos</option>
        <option value="presencial">Presencial</option>
        <option value="online">Online</option>
        <option value="hibrido">Híbrido</option>
      </select>

      <button @click="gerarRelatorio" class="btn-gerar">
        <img src="/public/icons/pdf.svg" alt="PDF" class="icon"/>
        Gerar Relatório
      </button>
    </div>

    <div class="resultados" v-if="dados.length">
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Total Cursos</th>
            <th>Total Participantes</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dados" :key="item.tipo">
            <td>{{ item.tipo }}</td>
            <td>{{ item.total_cursos }}</td>
            <td>{{ item.total_participantes }}</td>
            <td>{{ item.status }}</td>
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
  tipo: ''
})

const dados = ref([])

const buscarDados = async () => {
  // Implementar busca por tipo
}
</script>