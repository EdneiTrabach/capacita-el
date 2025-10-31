// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Você pode escolher Resend.com (mais fácil de configurar)
import { Resend } from "https://esm.sh/resend@0.16.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Hello from Functions!")

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emailId } = await req.json()
    
    if (!emailId) {
      return new Response(
        JSON.stringify({ error: "ID do email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Inicializar o cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    // Buscar os detalhes do email
    const { data: email, error: fetchError } = await supabase
      .from('emails_enviados')
      .select(`
        id,
        assunto,
        conteudo,
        usuario_id,
        usuarios:usuario_id (nome, email),
        curso_id,
        cursos:curso_id (nome)
      `)
      .eq('id', emailId)
      .single()

    if (fetchError || !email) {
      return new Response(
        JSON.stringify({ 
          error: "Email não encontrado", 
          details: fetchError?.message
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log("Email encontrado:", {
      id: email.id,
      assunto: email.assunto,
      destinatario: email.usuarios?.email,
      curso: email.cursos?.nome
    });

    // Verificar se temos email do destinatário
    if (!email.usuarios?.email) {
      return new Response(
        JSON.stringify({ error: "Email do destinatário não encontrado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Inicializar Resend com a chave API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY não está configurada no ambiente");
    }
    
    const resend = new Resend(resendApiKey);
    const fromEmail = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";

    console.log("Enviando email via Resend:", {
      from: fromEmail,
      to: email.usuarios.email,
      subject: email.assunto
    });

    // Enviar o email
    const { data: sendResult, error: sendError } = await resend.emails.send({
      from: `Sistema de Treinamentos <${fromEmail}>`,
      to: [email.usuarios.email],
      subject: email.assunto,
      html: email.conteudo,
    })

    if (sendError) {
      console.error("Erro ao enviar email via Resend:", sendError);
      throw sendError;
    }

    console.log("Email enviado com sucesso:", sendResult);

    // Atualizar o status do email
    const { error: updateError } = await supabase
      .from('emails_enviados')
      .update({
        status: 'enviado',
        enviado_real_em: new Date().toISOString(),
        resultado_envio: { 
          id: sendResult?.id,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', emailId)

    if (updateError) {
      console.error("Erro ao atualizar status do email:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email enviado com sucesso!", 
        data: sendResult 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
    
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : "Erro ao enviar email"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
