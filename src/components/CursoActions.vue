<template>
  <div class="actions">
    <button @click="$emit('edit')" class="btn-edit">
      <img src="/public/icons/edicao.svg" alt="Editar" class="icon" />
      Editar
    </button>
    <button @click="$emit('delete')" class="btn-delete">
      <img src="/public/icons/lixeira.svg" alt="Excluir" class="icon" />
      Excluir
    </button>
    <button 
      @click="$router.push(`/curso/${curso.id}/presenca`)"
      class="btn-presenca"
    >
      <img src="../../public/icons/check.svg" alt="Presença" class="icon"/>
      Lista de Presença
    </button>

    <router-link to="/matricula-alunos" class="btn">
      Gerenciar Matrículas
    </router-link>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'CursoActions',
  props: {
    curso: {
      type: Object,
      required: true
    }
  },
  setup() {
    const router = useRouter()
    return { router }
  }
})
</script>
