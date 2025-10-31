import { supabase } from "@/config/supabase";

/**
 * Verifica e cria as tabelas necessárias para o sistema funcionar
 * Execute esta função manualmente pelo console de desenvolvedor
 */
export const verificarEstruturaBanco = async () => {
  try {
    console.log("Verificando estrutura do banco de dados...");

    // Verificar tabela profiles
    const { error: profilesError } = await supabase.rpc(
      "verificar_tabela_exists",
      {
        tablename: "profiles",
      }
    );

    if (profilesError) {
      console.log("Criando tabela profiles...");
      await supabase.rpc("executar_sql", {
        sql_command: `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT,
            nome TEXT,
            role TEXT DEFAULT 'user',
            status TEXT DEFAULT 'ativo',
            updated_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_sign_in_at TIMESTAMP WITH TIME ZONE
          );
        `,
      });
      console.log("Tabela profiles criada com sucesso");
    }

    // Verificar tabela emails_enviados
    const { error: emailsError } = await supabase.rpc(
      "verificar_tabela_exists",
      {
        tablename: "emails_enviados",
      }
    );

    if (emailsError) {
      console.log("Criando tabela emails_enviados...");
      await supabase.rpc("executar_sql", {
        sql_command: `
          CREATE TABLE IF NOT EXISTS emails_enviados (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            usuario_id UUID REFERENCES usuarios(id),
            curso_id UUID REFERENCES cursos(id),
            assunto TEXT,
            modelo VARCHAR(50),
            conteudo TEXT,
            enviado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      });
      console.log("Tabela emails_enviados criada com sucesso");
    }

    console.log("Verificação e criação de tabelas concluída");
    return { success: true };
  } catch (error) {
    console.error("Erro ao verificar/criar tabelas:", error);
    return { success: false, error };
  }
};

/**
 * Sincroniza dados entre tabelas (útil para manter profiles e usuarios sincronizados)
 */
export const sincronizarDados = async () => {
  try {
    console.log("Sincronizando dados entre tabelas...");

    // Sincronizar usuarios -> profiles
    const { data: usuarios, error: usuariosError } = await supabase
      .from("usuarios")
      .select("id, nome, email, role, status");

    if (usuariosError) throw usuariosError;

    console.log(`Sincronizando ${usuarios.length} usuários...`);

    for (const usuario of usuarios) {
      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role || "user",
          status: usuario.status || "ativo",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (upsertError) {
        console.error(
          `Erro ao sincronizar usuário ${usuario.id}:`,
          upsertError
        );
      }
    }

    console.log("Sincronização concluída");
    return { success: true };
  } catch (error) {
    console.error("Erro ao sincronizar dados:", error);
    return { success: false, error };
  }
};
