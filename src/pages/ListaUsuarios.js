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
    
    // Estados
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

    // Composables
    const { 
      usuarios,
      loading,
      error,
      toast,
      loadUsuarios,
      loadSetores
    } = useUsuarios()

    const {
      searchTerm,
      setorFilter,
      statusFilter,
      sortBy,
      setoresUnicos,
      usuariosFiltrados
    } = useFilters(usuarios)

    // Métodos
    const deletarUsuario = async (id) => {
      const usuario = usuarios.value.find(u => u.id === id)
      if (!usuario) return

      if (confirm(`Deseja realmente excluir o usuário ${usuario.nome}?\nEsta ação não poderá ser desfeita.`)) {
        try {
          const { error: err } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id)

          if (err) throw err

          await loadUsuarios()
          toast.value = {
            show: true,
            message: 'Usuário excluído com sucesso!',
            type: 'success'
          }
        } catch (error) {
          console.error('Erro ao excluir usuário:', error)
          toast.value = {
            show: true,
            message: 'Não foi possível excluir o usuário. Tente novamente.',
            type: 'error'
          }
        }
      }
    }

    const editarUsuario = (usuario) => {
      editingUser.value = { ...usuario }
      showEditModal.value = true
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
        toast.value = {
          show: true,
          message: 'Usuário atualizado com sucesso',
          type: 'success'
        }
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        toast.value = {
          show: true,
          message: 'Erro ao atualizar usuário',
          type: 'error'
        }
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
      console.log('Componente montado')
      await loadUsuarios()
      await loadSetores()
      console.log('Dados carregados:', usuarios.value)
    })

    return {
      // Estados
      showEditModal,
      editingUser,
      usuarios,
      loading,
      error,
      toast,
      searchTerm,
      setorFilter,
      statusFilter,
      sortBy,
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
      sanitizeHTML
    }
  }
}
