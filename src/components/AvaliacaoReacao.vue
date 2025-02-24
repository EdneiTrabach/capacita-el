<template>
  <div class="avaliacao-container">
    <h2>Avaliação de Satisfação</h2>
    <form @submit.prevent="salvarAvaliacao" class="avaliacao-form">
      <!-- Satisfação Geral -->
      <div class="rating-group">
        <label>Satisfação Geral com o Treinamento</label>
        <div class="star-rating">
          <template v-for="n in 5" :key="n">
            <input 
              type="radio" 
              :id="`satisfacao-${n}`"
              name="satisfacao"
              :value="n"
              v-model="avaliacao.satisfacao_geral"
              required
            />
            <label :for="`satisfacao-${n}`">★</label>
          </template>
        </div>
      </div>

      <!-- Qualidade do Conteúdo -->
      <div class="rating-group">
        <label>Qualidade do Conteúdo</label>
        <div class="star-rating">
          <template v-for="n in 5" :key="n">
            <input 
              type="radio" 
              :id="`conteudo-${n}`"
              name="conteudo"
              :value="n"
              v-model="avaliacao.qualidade_conteudo"
              required
            />
            <label :for="`conteudo-${n}`">★</label>
          </template>
        </div>
      </div>

      <!-- Aplicabilidade -->
      <div class="rating-group">
        <label>Aplicabilidade do Conteúdo</label>
        <div class="star-rating">
          <template v-for="n in 5" :key="n">
            <input 
              type="radio" 
              :id="`aplicabilidade-${n}`"
              name="aplicabilidade"
              :value="n"
              v-model="avaliacao.aplicabilidade"
              required
            />
            <label :for="`aplicabilidade-${n}`">★</label>
          </template>
        </div>
      </div>

      <!-- Comentários e Sugestões -->
      <div class="form-group">
        <label>Comentários Adicionais</label>
        <textarea 
          v-model="avaliacao.comentarios"
          rows="3"
          placeholder="Compartilhe sua experiência..."
        ></textarea>
      </div>

      <div class="form-group">
        <label>Sugestões de Melhoria</label>
        <textarea 
          v-model="avaliacao.sugestoes"
          rows="3"
          placeholder="Suas sugestões são importantes..."
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-enviar">
          Enviar Avaliação
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { useRoute } from 'vue-router'

const route = useRoute()
const cursoId = route.params.id

const avaliacao = ref({
  satisfacao_geral: null,
  qualidade_conteudo: null,
  aplicabilidade: null,
  material_didatico: null,
  dominio_instrutor: null,
  comentarios: '',
  sugestoes: ''
})

const salvarAvaliacao = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
      .from('avaliacoes_reacao')
      .insert({
        ...avaliacao.value,
        curso_id: cursoId,
        usuario_id: user.id
      })

    if (error) throw error
    
    alert('Avaliação enviada com sucesso!')
    // Redirecionar ou fechar modal
  } catch (err) {
    console.error('Erro ao salvar avaliação:', err)
    alert('Erro ao enviar avaliação')
  }
}
</script>

<style scoped>
.avaliacao-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.avaliacao-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.rating-group {
  margin-bottom: 1.5rem;
}

.star-rating {
  display: flex;
  flex-direction: row-reverse;
  gap: 0.5rem;
}

.star-rating input {
  display: none;
}

.star-rating label {
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
}

.star-rating input:checked ~ label {
  color: #ffd700;
}

.star-rating label:hover,
.star-rating label:hover ~ label {
  color: #ffed4a;
}

.form-group {
  margin-bottom: 1.5rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  resize: vertical;
}

.btn-enviar {
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
}

.btn-enviar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 49, 85, 0.2);
}
</style>