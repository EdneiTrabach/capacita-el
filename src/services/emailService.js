// filepath: d:\PROJETOS-EL\cursos-itilh\src\services\emailService.js
import { supabase } from "@/config/supabase";

/**
 * Serviço para envio de emails
 */
export const emailService = {
  /**
   * Envia emails para vários destinatários
   * @param {Array} destinatarios - Lista de objetos com dados dos destinatários
   * @param {Object} emailConfig - Configurações do email
   * @returns {Promise} - Resultado da operação
   */
  async enviarMultiplos(destinatarios, emailConfig) {
    try {
      // Para cada destinatário, gerar o conteúdo personalizado
      const envios = destinatarios.map((dest) => {
        // Gerar conteúdo personalizado baseado no modelo
        const conteudoEmail = this.gerarConteudoEmail(emailConfig.modelo, {
          cursoNome: emailConfig.cursoNome,
          nomeAluno: dest.nome,
          conteudoPersonalizado: emailConfig.conteudo,
        });

        return {
          usuario_id: dest.id,
          curso_id: emailConfig.cursoId,
          assunto: emailConfig.assunto,
          modelo: emailConfig.modelo,
          conteudo: conteudoEmail,
          enviado_em: new Date().toISOString(),
          status: "pendente",
        };
      });

      // Inserir registro de emails enviados e retornar os IDs
      const { data, error } = await supabase
        .from("emails_enviados")
        .insert(envios)
        .select("id");

      if (error) throw error;

      console.log(`${envios.length} emails registrados no banco`);

      // Array para armazenar promessas de envio
      const envioPendentes = [];

      // Para cada email registrado, chamar a Edge Function para envio real
      for (const email of data) {
        try {
          const envioPromise = fetch(
            // Use bright-task em vez de send-email
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bright-task`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                  import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
              },
              body: JSON.stringify({ emailId: email.id }),
            }
          ).then(async (res) => {
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`Erro no envio: ${errorText}`);
            }
            return res.json();
          });

          envioPendentes.push(envioPromise);
        } catch (err) {
          console.error(`Erro ao agendar envio do email ${email.id}:`, err);
        }
      }

      // Aguardar todos os envios (com timeout de 10 segundos para não bloquear UI)
      const enviosResultados = await Promise.allSettled(
        envioPendentes.map((p) =>
          Promise.race([
            p,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 10000)
            ),
          ])
        )
      );

      // Contar envios bem-sucedidos
      const enviados = enviosResultados.filter(
        (r) => r.status === "fulfilled"
      ).length;

      console.log(`${enviados}/${data.length} emails enviados com sucesso`);
      return {
        success: true,
        data,
        count: data.length,
        enviados,
      };
    } catch (error) {
      console.error("Erro ao enviar emails:", error);
      return { success: false, error };
    }
  },

  /**
   * Gera o conteúdo do email baseado no modelo
   * @param {String} modelo - Tipo de modelo de email
   * @param {Object} dados - Dados para personalizar o email
   * @returns {String} - Conteúdo HTML do email
   */
  gerarConteudoEmail(modelo, dados) {
    switch (modelo) {
      case "convite":
        return `
          <h2>Convite para Treinamento: ${dados.cursoNome}</h2>
          <p>Olá ${dados.nomeAluno},</p>
          <p>Gostaríamos de confirmar sua participação no treinamento <strong>${dados.cursoNome}</strong> que começará em breve.</p>
          <p>Por favor, reserve esta data em sua agenda e prepare-se para uma experiência de aprendizado enriquecedora.</p>
          <p>Atenciosamente,<br>Equipe de Treinamentos</p>
        `;

      case "lembrete":
        return `
          <h2>Lembrete: Aula do Treinamento ${dados.cursoNome}</h2>
          <p>Olá ${dados.nomeAluno},</p>
          <p>Este é um lembrete sobre a próxima aula do treinamento <strong>${dados.cursoNome}</strong>.</p>
          <p>Não se esqueça de verificar o material preparatório e comparecer pontualmente.</p>
          <p>Atenciosamente,<br>Equipe de Treinamentos</p>
        `;

      case "material":
        return `
          <h2>Material Disponível: Treinamento ${dados.cursoNome}</h2>
          <p>Olá ${dados.nomeAluno},</p>
          <p>Os materiais para o treinamento <strong>${dados.cursoNome}</strong> já estão disponíveis em nossa plataforma.</p>
          <p>Recomendamos que você revise o conteúdo antes da próxima aula para um melhor aproveitamento.</p>
          <p>Atenciosamente,<br>Equipe de Treinamentos</p>
        `;

      case "personalizado":
        return dados.conteudoPersonalizado || "Conteúdo não fornecido";

      default:
        return "Modelo de email não especificado";
    }
  },

  /**
   * Obtém o histórico de emails enviados para um curso
   * @param {String} cursoId - ID do curso
   * @returns {Promise} - Lista de emails enviados
   */
  async getHistoricoEmailsCurso(cursoId) {
    try {
      const { data, error } = await supabase
        .from("emails_enviados")
        .select(
          `
          *,
          usuario:usuario_id (nome, email)
        `
        )
        .eq("curso_id", cursoId)
        .order("enviado_em", { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Erro ao obter histórico de emails:", error);
      return { success: false, error };
    }
  },
};
