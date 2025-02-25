import { ref } from 'vue'
import TheSidebar from '@/components/navbar.vue'
import DataTable from '@/components/DataTable.vue'
import { exportarParaPDF, exportarParaExcel } from '@/utils/exportadores'

export default {
  name: 'RelatoriosPeriodo',
  
  components: {
    TheSidebar,
    DataTable
  },

  setup() {
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

    return {
      filtros,
      dados,
      statusOptions,
      tiposOptions,
      colunas,
      buscarDados,
      exportarPDF,
      exportarExcel
    }
  }
}