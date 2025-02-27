<template>
  <div class="app-container">
    <Navbar @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'with-sidebar': true, 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="avaliacao-container">
        <div class="avaliacao-header">
          <h1>Avaliação de Satisfação</h1>
        </div>

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
            <button type="button" class="btn-cancelar" @click="$router.back()">
              <img src="/public/icons/fechar.svg" alt="Cancelar" class="icon"/>
              Cancelar
            </button>
            <button type="submit" class="btn-enviar">
              <img src="/public/icons/save-fill.svg" alt="Enviar" class="icon"/>
              Enviar Avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue' // Importando o componente Navbar

const route = useRoute()
const cursoId = route.params.id
const isSidebarCollapsed = ref(false) // Estado para controlar o sidebar

// Função para lidar com o toggle do sidebar
const handleSidebarToggle = (collapsed) => {
  isSidebarCollapsed.value = collapsed
}

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
.app-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  /* transition: all 0.3s ease; */
  margin-left: 280px;
  width: calc(100% - 280px);
}

.main-content.sidebar-collapsed {
  margin-left: 60px;
  width: calc(100% - 60px);
}

.avaliacao-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

.avaliacao-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avaliacao-header h1 {
  color: #ffffff;
  font-size: 1.8rem;
  margin: 0;
  font-weight: 600;
}

.avaliacao-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.rating-group {
  margin-bottom: 1.5rem;
  color: black;
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


textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e4e8;
  border-radius: 8px;
  resize: vertical;
  font-family: 'Roboto', sans-serif;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e4e8;
}

.btn-cancelar,
.btn-enviar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-cancelar {
  background-color: #6c757d;
  color: white;
}

.btn-enviar {
  background: linear-gradient(135deg, #193155 0%, #254677 100%);
  color: white;
}

.btn-cancelar:hover,
.btn-enviar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 49, 85, 0.2);
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 60px;
    width: calc(100% - 60px);
  }

  .main-content.sidebar-collapsed {
    margin-left: 0;
    width: 100%;
  }

  .avaliacao-container {
    padding: 1rem;
  }

  .avaliacao-header {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancelar,
  .btn-enviar {
    width: 100%;
    justify-content: center;
  }
}
</style>