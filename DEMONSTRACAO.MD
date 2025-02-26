# Guia de Demonstração do Sistema

## 1. Acesso ao Sistema

1. Abrir o navegador e acessar: `http://sistema.local`
2. Fazer login com credenciais de demonstração
   - Usuário: demo
   - Senha: demo123

## 2. Casos Comuns de Erro

### 2.1 Erro de Autenticação
- Mensagem: "Credenciais inválidas"
- Solução: Verificar caps lock e dados de acesso

### 2.2 Timeout de Sessão
- Mensagem: "Sua sessão expirou"
- Solução: Realizar novo login

## 3. Vinculações do Sistema

### 3.1 Módulos Principais
- Cadastro → Financeiro
- Pedidos → Estoque
- Usuários → Permissões

### 3.2 Fluxo de Dados
1. Cadastro de Cliente
   - Vincula automaticamente ao módulo financeiro
   - Gera código único de identificação

2. Criação de Pedido
   - Verifica estoque disponível
   - Atualiza status financeiro

## 4. Validações Importantes
- CPF/CNPJ deve ser único
- Campos obrigatórios marcados com (*)
- Valores monetários sempre em BRL

## 5. Dicas de Uso
- Utilize a pesquisa global para encontrar registros
- Mantenha backups regulares
- Monitore logs de erro em: `/logs/sistema`





# Erros Comuns e Soluções

## Erros de Sistema

### Erro 500 - Falha Interna
- **Causa**: Processamento incorreto no servidor
- **Solução**: Limpar cache e cookies

### Erro 404 - Página não encontrada
- **Causa**: URL inválida ou recurso removido
- **Solução**: Verificar endereço digitado

## Erros de Operação

### Duplicidade de Cadastro
- **Causa**: Tentativa de cadastrar item já existente
- **Solução**: Usar função de busca antes de cadastrar

### Falha na Importação
- **Causa**: Formato de arquivo incompatível
- **Solução**: Verificar template padrão

## Problemas de Conexão
- Timeout: Verificar qualidade da internet
- Erro SSL: Atualizar certificados
- Bloqueio de Porta: Consultar firewall


