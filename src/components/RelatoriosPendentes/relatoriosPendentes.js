// src/components/RelatoriosPendentes/relatoriosPendentes.js
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import DataTable from '@/components/DataTable.vue'
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'RelatoriosPendentes',
  
  components: {
    DataTable
  },

  setup() {
    const { isDark } = useTheme()

    const filtros = ref({
      dataInicio: '',
      dataFim: '',
      cursoId: '',
      status: ''
    })

    const dados = ref([])
    const cursos = ref([])
    const loading = ref(false)

    const colunas = [
      { field: 'aluno', header: 'Aluno' },
      { field: 'curso', header: 'Curso' },
      { field: 'data_conclusao', header: 'Data Conclusão' },
      { field: 'status', header: 'Status' },
      { field: 'observacoes', header: 'Observações' }
    ]

    const carregarCursos = async () => {
      try {
        const { data } = await supabase
          .from('cursos')
          .select('id, nome')
          .eq('status', 'Finalizado')

        cursos.value = data || []
      } catch (error) {
        console.error('Erro ao carregar cursos:', error)
      }
    }

    const buscarDados = async () => {
      try {
        loading.value = true
        
        let query = supabase
          .from('certificados')
          .select(`
            *,
            usuarios (id, nome),
            cursos (id, nome)
          `)
          .eq('status', 'pendente')
          .order('created_at', { ascending: false })

        if (filtros.value.cursoId) {
          query = query.eq('curso_id', filtros.value.cursoId)
        }

        if (filtros.value.dataInicio) {
          query = query.gte('data_conclusao', filtros.value.dataInicio)
        }

        if (filtros.value.dataFim) {
          query = query.lte('data_conclusao', filtros.value.dataFim)
        }

        const { data, error } = await query

        if (error) throw error

        dados.value = data?.map(item => ({
          ...item,
          aluno: item.usuarios?.nome,
          curso: item.cursos?.nome
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

    // Carregar dados iniciais
    onMounted(() => {
      carregarCursos()
      buscarDados()
    })

    return {
      filtros,
      dados,
      cursos,
      colunas,
      loading,
      buscarDados,
      exportarPDF,
      exportarExcel
    }
  }
}