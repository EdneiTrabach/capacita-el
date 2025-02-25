import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { sanitizeHTML } from '@/utils/sanitize'
import { useUsuarios } from '../composables/useUsuarios'
import { useFilters } from '../composables/useFilters'

export default {
  name: 'ListaUsuarios',
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

      if (confirm(`Deseja realmente excluir o usuário ${usuario.nome}?\nEsta ação não poderá ser desfeita.`)) {
        try {
          const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id)

          if (error) throw error
          
          await loadUsuarios()
          showToast('Usuário excluído com sucesso!')
        } catch (error) {
          console.error('Erro ao excluir usuário:', error)
          showToast('Erro ao excluir usuário', 'error')
        }
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

      // Métodos
      editarUsuario,
      closeEditModal,
      handleEditSubmit,
      loadUsuarios,
      loadSetores,
      deletarUsuario,
      formatDate,
      getInitials,
      sanitizeHTML,
      buscarMunicipios
    }
  }
}
