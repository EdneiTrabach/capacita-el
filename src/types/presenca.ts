export interface DadosAula {
  codigo: string
  curso_id: string
  curso: {
    id: string
    nome: string
  }
  data_aula: string
  horario_geracao: string
  validade: string
}

export interface Presenca {
  id: string
  aluno_id: string 
  aluno_nome?: string
  curso_id: string
  data_aula: string
  horario_registro: string
  status: string
  feedback?: string
  comentarios?: string
}

export interface PresencaResponse {
  success: boolean
  message: string
  data?: any
}
