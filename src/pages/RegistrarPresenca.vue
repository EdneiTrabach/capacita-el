<template>
  <div class="registrar-presenca">
    <h1>Registrar Presença</h1>
    
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <!-- Etapa 1: Scanner QR Code -->
    <div v-if="!codigoLido" class="qr-scanner">
      <qrcode-stream @decode="onDecode" />
    </div>

    <!-- Etapa 2: Validação de Email -->
    <div v-if="codigoLido && !emailValidado" class="email-validation">
      <h2>Confirme seu email</h2>
      <div class="form-group">
        <input 
          v-model="email"
          type="email"
          placeholder="Digite seu email cadastrado"
          :disabled="loading"
        />
        <button 
          @click="validarEmail"
          :disabled="loading || !email"
        >
          {{ loading ? 'Verificando...' : 'Confirmar' }}
        </button>
      </div>
    </div>

    <!-- Etapa 3: Confirmação de Presença -->
    <div v-if="emailValidado" class="confirmation">
      <h2>Confirmação de Presença</h2>
      <p>Email validado: {{ email }}</p>
      <button 
        @click="registrarPresenca"
        :disabled="loading"
        class="btn-confirm"
      >
        {{ loading ? 'Registrando...' : 'Confirmar Presença' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { supabase } from '@/config/supabase'
import { presencaService } from '@/services/presencaService'

interface DadosAula {
  codigo: string
  curso_id: string
  curso: {
    id: string
    nome: string
  }
  data_aula: string
  horario_geracao: string
}

const codigoAula = ref('')
const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const codigoLido = ref(false)
const emailValidado = ref(false)
const dadosAula = ref<DadosAula | null>(null)

const onDecode = async (decodedString: string) => {
  codigoAula.value = decodedString
  codigoLido.value = true
  
  try {
    const { data, error } = await supabase
      .from('codigos_aula')
      .select(`
        *,
        curso:cursos(id, nome)
      `)
      .eq('codigo', decodedString)
      .gt('validade', new Date().toISOString()) // Adiciona verificação de validade
      .single()

    if (error || !data) {
      throw new Error('Código inválido ou expirado')
    }

    // Formata os dados antes de atribuir
    const dadosFormatados: DadosAula = {
      codigo: data.codigo,
      curso_id: data.curso_id,
      curso: {
        id: data.curso.id,
        nome: data.curso.nome
      },
      data_aula: data.data_aula,
      horario_geracao: data.horario_geracao
    }

    dadosAula.value = dadosFormatados
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Código inválido'
    codigoLido.value = false
  }
}

const validarEmail = async () => {
  try {
    loading.value = true
    error.value = ''

    // Verifica se o email está cadastrado no curso
    const { data, error: queryError } = await supabase
      .from('usuarios')
      .select('id, nome')
      .eq('email', email.value)
      .eq('status', 'ativo')
      .single()

    if (queryError || !data) {
      throw new Error('Email não encontrado ou não autorizado')
    }

    // Verifica se o aluno está matriculado no curso
    if (!dadosAula.value?.curso_id) {
      throw new Error('Dados do curso não encontrados')
    }

    const { data: matricula, error: matriculaError } = await supabase
      .from('matriculas')
      .select('id')
      .eq('aluno_id', data.id)
      .eq('curso_id', dadosAula.value.curso_id)
      .single()

    if (matriculaError || !matricula) {
      throw new Error('Aluno não matriculado neste curso')
    }

    emailValidado.value = true

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao validar email'
    emailValidado.value = false
  } finally {
    loading.value = false
  }
}

// Adicione esta função ao script setup
const registrarPresenca = async () => {
  try {
    loading.value = true
    error.value = ''
    
    if (!dadosAula.value?.codigo || !email.value) {
      throw new Error('Dados insuficientes para registrar presença')
    }

    const resultado = await presencaService.validarPresenca(
      dadosAula.value.codigo,
      email.value
    )

    if (resultado) {
      success.value = 'Presença registrada com sucesso!'
      // Resetar estado
      codigoLido.value = false
      emailValidado.value = false
      email.value = ''
      dadosAula.value = null
    }

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao registrar presença'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Estilos existentes... */

.registrar-presenca {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.error-message {
  color: #dc3545;
  padding: 10px;
  margin: 10px 0;
  background-color: #ffe6e6;
  border-radius: 4px;
}

.success-message {
  color: #28a745;
  padding: 10px;
  margin: 10px 0;
  background-color: #e6ffe6;
  border-radius: 4px;
}

.manual-input {
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  margin-left: 10px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

input {
  padding: 8px;
  width: 200px;
}

.email-validation {
  margin: 20px 0;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.form-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.confirmation {
  text-align: center;
  margin: 20px 0;
}

.btn-confirm {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
}

.btn-confirm:hover {
  background-color: #218838;
}
</style>