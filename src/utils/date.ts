// Create the date utility functions
export const formatDate = (date: string): string => {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('pt-BR')
}