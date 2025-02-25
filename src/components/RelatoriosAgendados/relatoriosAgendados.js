import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import DataTable from '@/components/DataTable.vue'
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'RelatoriosAgendados',
  
  components: {
    DataTable
  },

  setup() {
    const { isDark } = useTheme()

    const filtros = ref({
      dataInicio: '',
      dataFim: '',
      status: '',
      professorId: ''
    })

    const dados = ref([])
    const professores = ref([])
    const loading = ref(false)

    const colunas = [
      { field: 'nome', header: 'Treinamento' },
      { field: 'data_inicio', header: 'Data Início' },
      { field: 'data_fim', header: 'Data Fim' },
      { field: 'professor', header: 'Professor' },
      { field: 'status', header: 'Status' },
      { field: 'vagas', header: 'Vagas Disponíveis' }
    ]

    const carregarProfessores = async () => {
      try {
        const { data } = await supabase
          .from('usuarios')
          .select('id, nome')
          .eq('role', 'professor')

        professores.value = data || []
      } catch (error) {
        console.error('Erro ao carregar professores:', error)
      }
    }

    const buscarDados = async () => {
      try {
        loading.value = true
        
        let query = supabase
          .from('cursos')
          .select(`
            *,
            usuarios (id, nome),
            matriculas (count)
          `)
          .gt('data_inicio', new Date().toISOString())
          .order('data_inicio', { ascending: true })

        if (filtros.value.status) {
          query = query.eq('status', filtros.value.status)
        }

        if (filtros.value.professorId) {
          query = query.eq('professor_responsavel', filtros.value.professorId)
        }

        if (filtros.value.dataInicio) {
          query = query.gte('data_inicio', filtros.value.dataInicio)
        }

        if (filtros.value.dataFim) {
          query = query.lte('data_inicio', filtros.value.dataFim)
        }

        const { data, error } = await query

        if (error) throw error

        dados.value = data?.map(item => ({
          ...item,
          professor: item.usuarios?.nome,
          vagas: item.vagas_totais - item.matriculas[0].count
        })) || []

      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        loading.value = false
      }
    }

    const exportarPDF = () => {
      // Implementar exportação PDF
    }

    const exportarExcel = () => {
      // Implementar exportação Excel
    }

    // Carregar professores ao montar o componente
    carregarProfessores()

    return {
      filtros,
      dados,
      professores,
      colunas,
      loading,
      buscarDados,
      exportarPDF,
      exportarExcel
    }
  }
}