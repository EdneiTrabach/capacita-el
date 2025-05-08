import { supabase } from '../config/supabase'

// Controle de tentativas
let attempts = 0
let lastAttemptTime = 0
const cooldownPeriods = [0, 5000, 30000, 60000, 300000] // tempo progressivo de espera

export async function requestPasswordReset(email: string, redirectUrl: string) {
  const now = Date.now()

  // Verificar se está em cooldown
  if (attempts > 0) {
    const waitTime = cooldownPeriods[Math.min(attempts, cooldownPeriods.length - 1)]
    const timeElapsed = now - lastAttemptTime

    if (timeElapsed < waitTime) {
      const remainingTime = Math.ceil((waitTime - timeElapsed) / 1000)
      throw new Error(`Por favor, aguarde ${remainingTime} segundos antes de tentar novamente.`)
    }
  }

  try {
    lastAttemptTime = now
    attempts++

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl })

    if (error) throw error

    // Se for bem-sucedido, diminui contador
    setTimeout(() => { if (attempts > 0) attempts-- }, 60000)

    return { success: true }
  } catch (error: any) {
    // Se for erro 429, incrementa attempts para aumentar o tempo de espera
    if (error.status === 429) {
      attempts = Math.min(attempts + 1, cooldownPeriods.length - 1)
    }
    throw error
  }
}