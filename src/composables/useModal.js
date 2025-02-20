import { ref } from 'vue'
import { supabase } from '@/config/supabase'

export function useModal() {
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

  const handleEditSubmit = async () => {
    // ...código existente do handleEditSubmit...
  }

  const closeEditModal = () => {
    // ...código existente do closeEditModal...
  }

  return {
    showEditModal,
    editingUser,
    handleEditSubmit,
    closeEditModal
  }
}
