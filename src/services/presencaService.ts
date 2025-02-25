// src/services/presencaService.ts
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/config/supabase'
import type { DadosAula, PresencaResponse } from '@/types/presenca'

export const presencaService = {
  async gerarCodigoAula(cursoId: string, dataAula: string) {
    try {
      const dataHoje = new Date().toISOString().split('T')[0]
      const agora = new Date()
      
      // 1. Primeiro verifica se já existe um código válido
      const { data: codigoExistente } = await supabase
        .from('codigos_aula')
        .select('codigo, validade')
        .eq('curso_id', cursoId)
        .eq('data_aula', dataHoje)
        .gt('validade', agora.toISOString())
        .single()

      if (codigoExistente) {
        const urlPresenca = `https://registro-presenca.vercel.app/presenca/${codigoExistente.codigo}`
        return await QRCode.toDataURL(urlPresenca)
      }

      // 2. Se não existe, busca dados do curso para gerar novo código
      const { data: dadosCurso } = await supabase
        .from('cursos')
        .select('professor_responsavel')
        .eq('id', cursoId)
        .single()

      // 3. Gera um código composto
      const timestamp = Date.now()
      const codigoBase = `${cursoId}_${dadosCurso.professor_responsavel}_${dataHoje}_${timestamp}`
      const codigoAula = Buffer.from(codigoBase).toString('base64')

      // 4. Salva o novo código
      const validade = new Date(agora.getTime() + 15 * 60000) // 15 minutos
      
      const { error } = await supabase.from('codigos_aula').insert({
        codigo: codigoAula,
        curso_id: cursoId,
        data_aula: dataHoje,
        horario_geracao: agora.toISOString(),
        validade: validade.toISOString(),
        professor_id: dadosCurso.professor_responsavel
      })

      if (error) throw error

      const urlPresenca = `https://registro-presenca.vercel.app/presenca/${codigoAula}`
      return await QRCode.toDataURL(urlPresenca)

    } catch (error) {
      console.error('Erro ao gerar código da aula:', error)
      throw new Error('Não foi possível gerar o código da aula')
    }
  },

  async validarCodigo(codigo: string) {
    try {
      const agora = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('codigos_aula')
        .select(`
          *,
          curso:cursos(id, nome)
        `)
        .eq('codigo', codigo)
        .gt('validade', agora)
        .single()

      console.log('Validação completa:', {
        codigo,
        agora,
        resultado: data,
        erro: error
      })

      if (error) throw error
      return data
    } catch (err) {
      console.error('Erro na validação:', err)
      throw new Error('Código inválido ou expirado')
    }
  },

  async validarPresenca(
    codigo: string, 
    email: string, 
    feedback?: string, 
    comentarios?: string
  ): Promise<PresencaResponse> {
    try {
      console.log('Iniciando validação de presença:', { codigo, email })
      
      // 1. Decodifica o código para extrair as informações
      const codigoDecodificado = Buffer.from(codigo, 'base64').toString('ascii')
      const [cursoId, professorId, dataAula, timestamp] = codigoDecodificado.split('_')
      
      // 2. Valida o código da aula
      const { data: dadosAula, error: erroCodigo } = await supabase
        .from('codigos_aula')
        .select(`
          *,
          curso:cursos(id, nome)
        `)
        .eq('codigo', codigo)
        .eq('curso_id', cursoId)
        .eq('data_aula', dataAula)
        .gt('validade', new Date().toISOString())
        .single()

      console.log('Dados da aula:', dadosAula)

      if (erroCodigo || !dadosAula) {
        console.error('Erro na validação do código:', erroCodigo)
        throw new Error('Código inválido ou expirado')
      }

      // 2. Verifica se o aluno está matriculado
      const { data: aluno, error: erroAluno } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('email', email)
        .eq('status', 'ativo')
        .single()

      if (erroAluno || !aluno) {
        throw new Error('Email não encontrado ou não autorizado')
      }

      // 3. Verifica matrícula no curso
      const { data: matricula, error: erroMatricula } = await supabase
        .from('matriculas')
        .select('id')
        .eq('aluno_id', aluno.id)
        .eq('curso_id', dadosAula.curso_id)
        .single()

      if (erroMatricula || !matricula) {
        throw new Error('Aluno não matriculado neste curso')
      }

      // 4. Verifica presença duplicada
      const { data: presencaExistente } = await supabase
        .from('lista_presenca')
        .select()
        .eq('aluno_id', aluno.id)
        .eq('data_aula', dadosAula.data_aula)
        .single()

      if (presencaExistente) {
        throw new Error('Presença já registrada para esta aula')
      }

      // 5. Registra a presença
      const { error: erroPresenca } = await supabase
        .from('lista_presenca')
        .insert({
          aluno_id: aluno.id,
          curso_id: dadosAula.curso_id,
          data_aula: dadosAula.data_aula,
          status: 'presente',
          feedback,
          comentarios,
          horario_registro: new Date().toISOString()
        })

      if (erroPresenca) throw erroPresenca

      return {
        success: true,
        message: 'Presença registrada com sucesso'
      }

    } catch (err) {
      console.error('Erro completo:', err)
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao registrar presença'
      }
    }
  }
}