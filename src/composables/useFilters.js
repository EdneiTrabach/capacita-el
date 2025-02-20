import { ref, computed } from 'vue'

export function useFilters(usuarios) {
  const searchTerm = ref('')
  const setorFilter = ref('')
  const statusFilter = ref('')
  const sortBy = ref('nome')

  const setoresUnicos = computed(() => {
    const setores = new Set(usuarios.value.map(u => u.setor))
    return Array.from(setores).filter(Boolean).sort()
  })

  const usuariosFiltrados = computed(() => {
    return usuarios.value.filter(usuario => {
      const matchesSearch = !searchTerm.value || 
        usuario.nome?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        usuario.setor?.toLowerCase().includes(searchTerm.value.toLowerCase())

      const matchesSetor = !setorFilter.value || usuario.setor === setorFilter.value
      const matchesStatus = !statusFilter.value || usuario.status === statusFilter.value

      return matchesSearch && matchesSetor && matchesStatus
    })
  })

  return {
    searchTerm,
    setorFilter,
    statusFilter,
    sortBy,
    setoresUnicos,
    usuariosFiltrados
  }
}
