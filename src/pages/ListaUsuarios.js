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

    // Estados dos dados
    const usuarios = ref([])
    const setores = ref([])
    const searchTerm = ref('')
    const setorFilter = ref('')
    const loading = ref(false)
    const error = ref(null)
    const statusFilter = ref('')
    const sortBy = ref('recent')
    const municipios = ref([])
    const toast = ref({
      show: false,
      message: '',
      type: 'success'
    })

    // Estados do Brasil
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

    // Computed properties
    const setoresUnicos = computed(() => {
      const setoresSet = new Set(usuarios.value.map(u => u.setor).filter(Boolean))
      return Array.from(setoresSet).sort()
    })

    const usuariosFiltrados = computed(() => {
      let filtered = usuarios.value

      // Filtrar por termo de busca
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(usuario =>
          usuario.nome?.toLowerCase().includes(term) ||
          usuario.email?.toLowerCase().includes(term) ||
          usuario.setor?.toLowerCase().includes(term)
        )
      }

      // Filtrar por setor
      if (setorFilter.value) {
        filtered = filtered.filter(usuario => usuario.setor === setorFilter.value)
      }

      // Filtrar por status
      if (statusFilter.value) {
        filtered = filtered.filter(usuario => usuario.status === statusFilter.value)
      }

      // Ordenar
      switch (sortBy.value) {
        case 'recent':
          return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        case 'oldest':
          return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        case 'alpha':
          return filtered.sort((a, b) => a.nome.localeCompare(b.nome))
        default:
          return filtered
      }
    })

    // Funções de demonstração
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

    // Função principal para carregar usuários com dados de demonstração
    const loadUsuarios = async () => {
      try {
        loading.value = true
        
        // 🎯 DADOS DE DEMONSTRAÇÃO - pessoas fictícias
        const pessoasDemo = [
          {
            id: 'demo-user-001',
            nome: 'Maria Silva Santos',
            email: 'maria.silva@empresa.com',
            data_nascimento: '1985-03-15',
            telefone: '(11) 99999-8888',
            cidade: 'São Paulo',
            estado: 'SP',
            setor: 'Recursos Humanos',
            status: 'ativo',
            created_at: new Date().toISOString(),
            isDemo: true // Flag para identificar dados demo
          },
          {
            id: 'demo-user-002',
            nome: 'João Pedro Oliveira',
            email: 'joao.pedro@empresa.com',
            data_nascimento: '1990-08-22',
            telefone: '(21) 98888-7777',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            setor: 'Tecnologia da Informação',
            status: 'cursando',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
            isDemo: true
          },
          {
            id: 'demo-user-003',
            nome: 'Ana Carolina Ferreira',
            email: 'ana.ferreira@empresa.com',
            data_nascimento: '1988-11-10',
            telefone: '(31) 97777-6666',
            cidade: 'Belo Horizonte',
            estado: 'MG',
            setor: 'Financeiro',
            status: 'ativo',
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
            isDemo: true
          }
        ]

        // Simular carregamento do banco de dados
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Em modo demo, usar apenas dados de demonstração
        usuarios.value = pessoasDemo
        
        console.log(`Usuários carregados: ${usuarios.value.length} (modo demonstração)`)
        
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        // Em caso de erro, pelo menos mostrar dados demo básicos
        usuarios.value = [{
          id: 'demo-user-001',
          nome: 'Maria Silva Santos',
          email: 'maria.silva@empresa.com',
          data_nascimento: '1985-03-15',
          telefone: '(11) 99999-8888',
          cidade: 'São Paulo',
          estado: 'SP',
          setor: 'Recursos Humanos',
          status: 'ativo',
          created_at: new Date().toISOString(),
          isDemo: true
        }]
        showToast('Carregando dados de demonstração', 'success')
      } finally {
        loading.value = false
      }
    }

    const loadSetores = async () => {
      try {
        // Setores de demonstração baseados nos usuários demo
        setores.value = [
          { id: 'demo-setor-001', nome: 'Recursos Humanos' },
          { id: 'demo-setor-002', nome: 'Tecnologia da Informação' },
          { id: 'demo-setor-003', nome: 'Financeiro' },
          { id: 'demo-setor-004', nome: 'Operações' },
          { id: 'demo-setor-005', nome: 'Marketing' }
        ]
      } catch (error) {
        console.error('Erro ao carregar setores:', error)
        showToast('Erro ao carregar setores', 'error')
      }
    }

    const formatDate = (date) => {
      if (!date) return '--'
      try {
        const [year, month, day] = date.split('-')
        return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
      } catch (error) {
        console.error('Erro ao formatar data:', error)
        return '--'
      }
    }

    const getInitials = (name) => {
      return name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || '??'
    }

    const toggleStatus = async (usuario, status) => {
      if (usuario.status !== status) {
        try {
          // Simular atualização no banco
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Update local state
          const index = usuarios.value.findIndex(u => u.id === usuario.id)
          if (index !== -1) {
            usuarios.value[index] = { ...usuarios.value[index], status }
            showToast(`Status atualizado para ${status}`, 'success')
          }
        } catch (error) {
          console.error('Erro ao atualizar status:', error)
          showToast('Erro ao atualizar status do usuário', 'error')
        }
      }
    }

    const deletarUsuario = async (id) => {
      const usuario = usuarios.value.find(u => u.id === id)
      if (!usuario) return

      userToDelete.value = usuario
      showDeleteDialog.value = true
    }

    const confirmDelete = async () => {
      try {
        const id = userToDelete.value.id
        
        // Simular exclusão no banco
        await new Promise(resolve => setTimeout(resolve, 500))
        
        usuarios.value = usuarios.value.filter(u => u.id !== id)
        showToast('Usuário excluído com sucesso!', 'success')
        showDeleteDialog.value = false
        userToDelete.value = null
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        showToast(
          'Não foi possível excluir o usuário. Verifique se não existem dados vinculados.',
          'error'
        )
      } finally {
        userToDelete.value = null
        showDeleteDialog.value = false
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
        
        // Simular atualização no banco
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Atualizar o usuário na lista local
        const index = usuarios.value.findIndex(u => u.id === editingUser.value.id)
        if (index !== -1) {
          usuarios.value[index] = { ...usuarios.value[index], ...editingUser.value }
        }
        
        showEditModal.value = false
        showToast('Usuário atualizado com sucesso', 'success')
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        showToast('Erro ao atualizar usuário', 'error')
      } finally {
        loading.value = false
      }
    }

    // Configurações do IntroJS
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
    ]
    
    const introOptions = {
      showStepNumbers: true,
      showBullets: true,
      showProgress: true,
      exitOnOverlayClick: false,
      nextLabel: 'Próximo',
      prevLabel: 'Anterior',
      doneLabel: 'Concluir'
    }

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
      deletarUsuario,
      confirmDelete,
      formatDate,
      getInitials,
      sanitizeHTML,
      buscarMunicipios,
      toggleStatus,
      introSteps,
      introOptions
    }
  }
}
