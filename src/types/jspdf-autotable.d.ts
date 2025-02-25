declare module 'jspdf-autotable' {
  export interface UserOptions {
    head?: any[][]
    body?: any[][]
    startY?: number
    theme?: string
    styles?: {
      fontSize?: number
      cellPadding?: number
      lineColor?: number[]
      lineWidth?: number
    }
    headStyles?: {
      fillColor?: number[]
      textColor?: number[]
    }
  }

  export default function(this: any, options: UserOptions): any
}