// src/components/RelatoriosTipo/relatoriosTipo.js
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'RelatoriosTipo',
  
  setup() {
    const { isDark } = useTheme()

    const filtros = ref({
      dataInicio: '',
      dataFim: '',
      tipo: '',
      status: ''
    })

    const dados = ref([])
    const loading = ref(false)

    const colunas = [
      { field: 'nome', header: 'Treinamento' },
      { field: 'tipo', header: 'Modalidade' },
      { field: 'data_inicio', header: 'Data Início' },
      { field: 'data_fim', header: 'Data Fim' },
      { field: 'status', header: 'Status' },
      { field: 'total_participantes', header: 'Participantes' }
    ]

    const buscarDados = async () => {
      try {
        loading.value = true
        
        let query = supabase
          .from('cursos')
          .select(`
            *,
            matriculas:matriculas(count)
          `)
          .order('data_inicio', { ascending: false })

        if (filtros.value.tipo) {
          query = query.eq('tipo', filtros.value.tipo)
        }

        if (filtros.value.status) {
          query = query.eq('status', filtros.value.status)
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
          total_participantes: item.matriculas[0].count
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

    return {
      filtros,
      dados,
      colunas,
      loading,
      buscarDados,
      exportarPDF,
      exportarExcel
    }
  }
}