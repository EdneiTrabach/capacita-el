<template>
  <div class="relatorio-section">
    <h3>Relatório por Setor</h3>
    
    <div class="filtros">
      <select v-model="filtros.setor" @change="buscarDados">
        <option value="">Todos os setores</option>
        <option v-for="setor in setores" :key="setor.id" :value="setor.nome">
          {{ setor.nome }}
        </option>
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
            <th>Setor</th>
            <th>Total Funcionários</th>
            <th>Cursos Realizados</th>
            <th>Em Andamento</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dados" :key="item.setor">
            <td>{{ item.setor }}</td>
            <td>{{ item.total_funcionarios }}</td>
            <td>{{ item.cursos_realizados }}</td>
            <td>{{ item.em_andamento }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { setorService } from '@/services/api'

const filtros = ref({
  setor: ''
})

const dados = ref([])
const setores = ref([])

const buscarDados = async () => {
  // Implementar busca de dados por setor
}

onMounted(async () => {
  setores.value = await setorService.listarSetores()
  await buscarDados()
})
</script>