import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { sanitizeHTML } from '@/utils/sanitize'
import { useUsuarios } from '../composables/useUsuarios'
import { useFilters } from '../composables/useFilters'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

// Adicione o ícone à biblioteca
library.add(faTriangleExclamation)

export default {
  name: 'ListaUsuarios',
  components: {
    FontAwesomeIcon
  },
  setup() {
    const router = useRouter()
    
    // Estados locais
    const showEditModal = ref(false)
    const editingUser = ref({
      id: null,
      nome: '',
      email: '',
      data_nascimento: '',
      telefone: '',
      cidade: '',
      estado: '',
      setor: ''
    })

    const showDeleteDialog = ref(false)
    const userToDelete = ref(null)

    // No início do setup()
    const estados = [
      { uf: 'AC', nome: 'Acre' },
      { uf: 'AL', nome: 'Alagoas' },
      { uf: 'AP', nome: 'Amapá' },
      { uf: 'AM', nome: 'Amazonas' },
      { uf: 'BA', nome: 'Bahia' },
      { uf: 'CE', nome: 'Ceará' },
      { uf: 'DF', nome: 'Distrito Federal' },
      { uf: 'ES', nome: 'Espírito Santo' },
      { uf: 'GO', nome: 'Goiás' },
      { uf: 'MA', nome: 'Maranhão' },
      { uf: 'MT', nome: 'Mato Grosso' },
      { uf: 'MS', nome: 'Mato Grosso do Sul' },
      { uf: 'MG', nome: 'Minas Gerais' },
      { uf: 'PA', nome: 'Pará' },
      { uf: 'PB', nome: 'Paraíba' },
      { uf: 'PR', nome: 'Paraná' },
      { uf: 'PE', nome: 'Pernambuco' },
      { uf: 'PI', nome: 'Piauí' },
      { uf: 'RJ', nome: 'Rio de Janeiro' },
      { uf: 'RN', nome: 'Rio Grande do Norte' },
      { uf: 'RS', nome: 'Rio Grande do Sul' },
      { uf: 'RO', nome: 'Rondônia' },
      { uf: 'RR', nome: 'Roraima' },
      { uf: 'SC', nome: 'Santa Catarina' },
      { uf: 'SP', nome: 'São Paulo' },	
      { uf: 'SE', nome: 'Sergipe' },
      { uf: 'TO', nome: 'Tocantins' },
      { uf: 'EX', nome: 'Exterior' }
    ]

    // Inicialize municipios como ref
    const municipios = ref([])

    const toast = ref({
      show: false,
      message: '',
      type: 'success'
    })

    // Composables
    const { 
      usuarios,
      loading,
      error,
      loadUsuarios,
      loadSetores,
      setores
    } = useUsuarios()

    const {
      searchTerm,
      setorFilter,
      statusFilter,
      sortBy,
      setoresUnicos,
      usuariosFiltrados
    } = useFilters(usuarios)

    // Funções
    const showToast = (message, type = 'success') => {
      toast.value = {
        show: true,
        message,
        type
      }
      setTimeout(() => {
        toast.value.show = false
      }, 3000)
    }

    const deletarUsuario = async (id) => {
      const usuario = usuarios.value.find(u => u.id === id)
      if (!usuario) return

      // Primeiro, verificar se o usuário tem matrículas
      try {
        const { data: matriculas, error: matriculasError } = await supabase
          .from('matriculas')
          .select('id')
          .eq('aluno_id', id)
        
        if (matriculasError) throw matriculasError

        if (matriculas?.length > 0) {
          showToast(
            'Não é possível excluir um usuário que possui matrículas. Remova primeiro as matrículas do usuário.',
            'error'
          )
          return
        }

        // Se não tiver matrículas, mostra o diálogo de confirmação
        userToDelete.value = usuario
        showDeleteDialog.value = true

      } catch (error) {
        console.error('Erro ao verificar matrículas:', error)
        showToast('Erro ao verificar matrículas do usuário', 'error')
      }
    }

    const confirmDelete = async () => {
      if (!userToDelete.value) return

      try {
        const { error } = await supabase
          .from('usuarios')
          .delete()
          .eq('id', userToDelete.value.id)

        if (error) throw error
        
        usuarios.value = usuarios.value.filter(u => u.id !== userToDelete.value.id)
        showToast('Usuário excluído com sucesso!', 'success')
        showDeleteDialog.value = false
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        showToast(
          'Não foi possível excluir o usuário. Verifique se não existem dados vinculados.',
          'error'
        )
      } finally {
        userToDelete.value = null
      }
    }

    const buscarMunicipios = async (uf) => {
      try {
        if (!uf) {
          municipios.value = []
          editingUser.value.cidade = ''
          return
        }
        
        loading.value = true
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        const data = await response.json()
        
        municipios.value = data.map(municipio => ({
          id: municipio.id,
          nome: municipio.nome
        }))
      } catch (error) {
        console.error('Erro ao buscar municípios:', error)
        showToast('Erro ao carregar municípios', 'error')
        municipios.value = []
        editingUser.value.cidade = ''
      } finally {
        loading.value = false
      }
    }

    const editarUsuario = async (usuario) => {
      try {
        editingUser.value = { ...usuario }
        if (usuario.estado) {
          await buscarMunicipios(usuario.estado)
        }
        showEditModal.value = true
      } catch (error) {
        console.error('Erro ao preparar edição:', error)
        showToast('Erro ao abrir formulário de edição', 'error')
      }
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editingUser.value = {
        id: null,
        nome: '',
        email: '',
        data_nascimento: '',
        telefone: '',
        cidade: '',
        estado: '',
        setor: ''
      }
    }

    const handleEditSubmit = async () => {
      try {
        loading.value = true
        const { error: err } = await supabase
          .from('usuarios')
          .update({
            nome: editingUser.value.nome,
            email: editingUser.value.email,
            data_nascimento: editingUser.value.data_nascimento,
            telefone: editingUser.value.telefone,
            cidade: editingUser.value.cidade,
            estado: editingUser.value.estado,
            setor: editingUser.value.setor
          })
          .eq('id', editingUser.value.id)

        if (err) throw err
        
        await loadUsuarios()
        showEditModal.value = false
        showToast('Usuário atualizado com sucesso')
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        showToast('Erro ao atualizar usuário', 'error')
      } finally {
        loading.value = false
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('pt-BR')
    }

    const getInitials = (name) => {
      if (!name) return ''
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    // Adicionar configurações do IntroJS
    const introSteps = [
      {
        element: '.usuarios-header',
        intro: 'Bem-vindo à página de Gestão de Pessoas! Aqui você pode gerenciar todos os alunos cadastrados.',
        position: 'bottom'
      },
      {
        element: '.btn-novo',
        intro: 'Clique aqui para cadastrar uma nova pessoa no sistema',
        position: 'left'
      },
      {
        element: '.search-bar',
        intro: 'Use estas opções para filtrar e buscar pessoas específicas',
        position: 'bottom'
      },
      {
        element: '.search-bar input',
        intro: 'Digite aqui para buscar por nome, email ou setor',
        position: 'bottom'
      },
      {
        element: '.search-bar select:nth-child(2)',
        intro: 'Filtre as pessoas por setor',
        position: 'bottom'
      },
      {
        element: '.search-bar select:nth-child(3)',
        intro: 'Filtre por status: Ativo, Cursando ou Inativo',
        position: 'bottom'
      },
      {
        element: '.search-bar select:nth-child(4)',
        intro: 'Organize a visualização na ordem desejada',
        position: 'bottom'
      },
      {
        element: '.usuarios-grid',
        intro: 'Aqui estão listados todos os alunos cadastrados no sistema',
        position: 'top'
      },
      {
        element: '.usuario-card',
        intro: 'Cada card representa uma pessoa cadastrada com suas informações e opções de gerenciamento',
        position: 'right'
      },
      {
        element: '.actions',
        intro: 'Utilize estes botões para editar ou excluir o cadastro da pessoa',
        position: 'left'
      },
      {
        element: '.status-toggle',
        intro: 'Gerencie o status do aluno facilmente clicando em um destes botões',
        position: 'top'
      }
    ];
    
    const introOptions = {
      showStepNumbers: true,
      showBullets: true,
      showProgress: true,
      exitOnOverlayClick: false,
      nextLabel: 'Próximo',
      prevLabel: 'Anterior',
      doneLabel: 'Concluir'
    };

    // Lifecycle hooks
    onMounted(async () => {
      try {
        await Promise.all([
          loadUsuarios(),
          loadSetores()
        ])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    })

    return {
      // Estados
      showEditModal,
      editingUser,
      usuarios,
      municipios,
      setores,
      searchTerm,
      setorFilter,
      loading,
      error,
      statusFilter,
      sortBy,
      toast,
      estados,
      setoresUnicos,
      usuariosFiltrados,
      showDeleteDialog,
      userToDelete,

      // Métodos
      editarUsuario,
      closeEditModal,
      handleEditSubmit,
      loadUsuarios,
      loadSetores,
      deletarUsuario,
      confirmDelete,
      formatDate,
      getInitials,
      sanitizeHTML,
      buscarMunicipios,
      introSteps,
      introOptions
    }
  }
}
