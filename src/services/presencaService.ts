// Novo arquivo: src/services/presencaService.ts
import QRCode from 'qrcode'
import { supabase } from '@/config/supabase'

export const presencaService = {
  async gerarCodigoAula(cursoId: string, dataAula: string) {
    try {
      // Verifica se já existe um código válido
      const { data: codigoExistente } = await supabase
        .from('codigos_aula')
        .select('codigo')
        .eq('curso_id', cursoId)
        .eq('data_aula', dataAula)
        .gt('validade', new Date().toISOString())
        .single()

      if (codigoExistente) {
        return await QRCode.toDataURL(codigoExistente.codigo)
      }

      // Gera novo código único
      const codigoAula = `${cursoId}-${dataAula}-${Date.now()}`
      
      // Salva o código no banco com validade de 15 minutos
      const { error } = await supabase.from('codigos_aula').insert({
        codigo: codigoAula,
        curso_id: cursoId,
        data_aula: dataAula,
        validade: new Date(Date.now() + 1000 * 60 * 15)
      })

      if (error) throw error

      // Retorna QR Code
      return await QRCode.toDataURL(codigoAula)

    } catch (err) {
      console.error('Erro ao gerar código da aula:', err)
      throw new Error('Não foi possível gerar o código da aula')
    }
  },

  async validarCodigo(codigo: string) {
    try {
      const { data, error } = await supabase
        .from('codigos_aula')
        .select('*')
        .eq('codigo', codigo)
        .gt('validade', new Date().toISOString())
        .single()

      if (error) throw error
      
      return data
    } catch (err) {
      console.error('Erro ao validar código:', err)
      throw new Error('Código inválido ou expirado')
    }
  },

  async validarPresenca(codigo: string, email: string) {
    try {
      // 1. Valida o código da aula
      const { data: dadosAula, error: erroCodigo } = await supabase
        .from('codigos_aula')
        .select(`
          *,
          curso:cursos(id, nome)
        `)
        .eq('codigo', codigo)
        .gt('validade', new Date().toISOString())
        .single()

      if (erroCodigo || !dadosAula) {
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
          horario_registro: new Date().toISOString()
        })

      if (erroPresenca) throw erroPresenca

      return {
        success: true,
        message: 'Presença registrada com sucesso'
      }

    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao registrar presença'
      }
    }
  }
}