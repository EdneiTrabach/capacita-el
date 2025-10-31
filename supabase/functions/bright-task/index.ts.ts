// Código para a função bright-task
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@0.16.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Tratamento de CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { emailId } = await req.json();

    if (!emailId) {
      return new Response(
        JSON.stringify({ error: "ID do email é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Inicializar cliente Supabase com chaves de serviço
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar informações do email
    const { data: email, error: fetchError } = await supabase
      .from("emails_enviados")
      .select(`
        id,
        assunto,
        conteudo,
        usuario_id,
        usuarios:usuario_id (nome, email),
        curso_id,
        cursos:curso_id (nome)
      `)
      .eq("id", emailId)
      .single();

    if (fetchError || !email) {
      return new Response(
        JSON.stringify({
          error: "Email não encontrado",
          details: fetchError?.message,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o email do destinatário existe
    if (!email.usuarios?.email) {
      return new Response(
        JSON.stringify({ error: "Email do destinatário não encontrado" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Configurar Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY não está configurada");
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";

    // Enviar email via Resend
    const { data: sendResult, error: sendError } = await resend.emails.send({
      from: `Sistema de Treinamentos <${fromEmail}>`,
      to: [email.usuarios.email],
      subject: email.assunto,
      html: email.conteudo,
    });

    if (sendError) {
      throw sendError;
    }

    // Atualizar status do email no banco
    await supabase
      .from("emails_enviados")
      .update({
        status: "enviado",
        enviado_real_em: new Date().toISOString(),
        resultado_envio: {
          id: sendResult?.id,
          timestamp: new Date().toISOString(),
        },
      })
      .eq("id", emailId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado com sucesso!",
        data: sendResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Erro:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erro ao enviar email",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});