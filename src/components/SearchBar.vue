<template>
  <div class="search-bar">
    <input 
      type="text" 
      v-model="searchModel" 
      placeholder="Buscar por nome ou descrição..."
      @input="$emit('update:search', searchModel)"
    >
    <select 
      v-model="statusModel"
      @change="$emit('update:status', statusModel)"
    >
      <option value="">Todos os status</option>
      <option value="Em andamento">Em andamento</option>
      <option value="Finalizado">Finalizado</option>
      <option value="Cancelado">Cancelado</option>
    </select>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'SearchBar',
  props: {
    search: String,
    status: String
  },
  emits: ['update:search', 'update:status'],
  setup(props) {
    const searchModel = ref(props.search)
    const statusModel = ref(props.status)

    watch(() => props.search, (newVal) => {
      searchModel.value = newVal
    })

    watch(() => props.status, (newVal) => {
      statusModel.value = newVal
    })

    return {
      searchModel,
      statusModel
    }
  }
})
</script>

<style scoped>
.search-bar {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.2);

}
</style>
