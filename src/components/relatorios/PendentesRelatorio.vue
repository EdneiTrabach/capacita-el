<template>
  <div class="relatorio-section">
    <h3>Relatório de Certificados Pendentes</h3>
    
    <div class="filtros">
      <select v-model="filtros.cursoId" @change="buscarDados">
        <option value="">Todos os cursos</option>
        <option 
          v-for="curso in cursos" 
          :key="curso.id" 
          :value="curso.id"
        >
          {{ curso.nome }}
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
            <th>Aluno</th>
            <th>Curso</th>
            <th>Conclusão</th>
            <th>Frequência</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dados" :key="item.id">
            <td>{{ item.aluno_nome }}</td>
            <td>{{ item.curso_nome }}</td>
            <td>{{ formatDate(item.data_conclusao) }}</td>
            <td>{{ item.frequencia }}%</td>
            <td>{{ item.status }}</td>
            <td>
              <button 
                @click="emitirCertificado(item)"
                class="btn-emitir"
                :disabled="item.frequencia < 75"
              >
                Emitir Certificado
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { formatDate } from '@/utils/date'
import type { PendenteItem } from '@/types/relatorio'

const filtros = ref({
  cursoId: ''
})

const dados = ref<PendenteItem[]>([])
const cursos = ref<{id: string, nome: string}[]>([])
const loading = ref(false)

const buscarCursos = async () => {
  const { data } = await supabase
    .from('cursos')
    .select('id, nome')
    .eq('status', 'finalizado')
    .order('nome')
  
  cursos.value = data || []
}

const buscarDados = async () => {
  try {
    loading.value = true
    const query = supabase
      .from('matriculas')
      .select(`
        id,
        usuarios (nome),
        cursos (nome),
        data_conclusao,
        frequencia,
        status
      `)
      .eq('status', 'concluido')
      .is('certificado_emitido', false)

    if (filtros.value.cursoId) {
      query.eq('curso_id', filtros.value.cursoId)
    }

    const { data, error } = await query
    if (error) throw error
    dados.value = data || []
  } catch (err) {
    console.error('Erro ao buscar dados:', err)
  } finally {
    loading.value = false
  }
}

const emitirCertificado = async (item) => {
  // Implementar emissão de certificado
}

onMounted(async () => {
  await buscarCursos()
  await buscarDados()
})
</script>

<style scoped>
.btn-emitir {
  padding: 0.5rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-emitir:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>