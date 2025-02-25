import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import DataTable from '@/components/DataTable.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'RelatoriosAlunos',
  
  components: {
    DataTable
  },

  setup() {
    const router = useRouter()
    const filtros = ref({
      cursoId: '',
      status: '',
      dataInicio: '',
      dataFim: '',
      conclusao: ''
    })

    const dados = ref([])
    const cursos = ref([])
    const loading = ref(false)

    const colunas = [
      { field: 'aluno', header: 'Aluno' },
      { field: 'curso', header: 'Curso' },
      { field: 'status', header: 'Status' },
      { field: 'data_matricula', header: 'Data Matrícula' },
      { field: 'conclusao', header: 'Conclusão' }
    ]

    const carregarCursos = async () => {
      try {
        const { data } = await supabase
          .from('cursos')
          .select('id, nome')
        
        cursos.value = data || []
      } catch (error) {
        console.error('Erro ao carregar cursos:', error)
      }
    }

    const buscarDados = async () => {
      try {
        loading.value = true
        
        let query = supabase
          .from('matriculas')
          .select(`
            *,
            usuarios (id, nome),
            cursos (id, nome)
          `)
          .order('created_at', { ascending: false })

        if (filtros.value.cursoId) {
          query = query.eq('curso_id', filtros.value.cursoId)
        }

        if (filtros.value.status) {
          query = query.eq('status', filtros.value.status)
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

    const gerarPDF = () => {
      // Implementar exportação PDF
    }

    const exportarExcel = () => {
      // Implementar exportação Excel
    }

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
      gerarPDF,
      exportarExcel
    }
  }
}