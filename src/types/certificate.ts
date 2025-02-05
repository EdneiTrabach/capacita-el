export interface Certificate {
     id: string
     codigo: string
     usuario_id: string
     curso_id: string
     data_conclusao: string
     data_emissao?: string
     observacoes?: string
     status: 'pendente' | 'emitido' | 'cancelado'
     usuario?: {
       nome: string
       email: string
     }
     curso?: {
       nome: string
       duracao_horas: number
     }
   }