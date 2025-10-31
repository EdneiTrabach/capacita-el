export class AuthDemo {
  constructor() {
    this.isAuthenticated = false
    this.currentUser = null
  }

  // Login simples para demonstração
  async login(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simula uma autenticação bem-sucedida
        this.isAuthenticated = true
        this.currentUser = {
          id: '1',
          email: email,
          nome: email.split('@')[0],
          role: 'admin' // Para ter acesso total
        }
        
        // Salva no localStorage para persistir
        localStorage.setItem('demo_auth', JSON.stringify({
          isAuthenticated: true,
          user: this.currentUser
        }))
        
        resolve({ 
          success: true, 
          user: this.currentUser 
        })
      }, 500) // Simula delay de rede
    })
  }

  // Logout
  logout() {
    this.isAuthenticated = false
    this.currentUser = null
    localStorage.removeItem('demo_auth')
  }

  // Verificar se está logado
  getSession() {
    const stored = localStorage.getItem('demo_auth')
    if (stored) {
      const auth = JSON.parse(stored)
      this.isAuthenticated = auth.isAuthenticated
      this.currentUser = auth.user
      return auth
    }
    return { isAuthenticated: false, user: null }
  }

  // Simular mudanças de estado de autenticação
  onAuthStateChange(callback) {
    // Para compatibilidade com o código existente
    const stored = this.getSession()
    if (stored.isAuthenticated) {
      callback('SIGNED_IN', { user: stored.user })
    }
  }
}

export const authDemo = new AuthDemo()