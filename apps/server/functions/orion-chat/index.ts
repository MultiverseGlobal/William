import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { streamText, tool } from "https://esm.sh/ai@3.1.21";
import { createGoogleGenerativeAI } from "https://esm.sh/@ai-sdk/google@0.0.12";
import { createOpenAI } from "https://esm.sh/@ai-sdk/openai@0.0.12";
import { createAnthropic } from "https://esm.sh/@ai-sdk/anthropic@0.1.13";
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metadata = user.user_metadata || {};
    let languageModel;

    if (metadata.gemini_api_key) {
      const google = createGoogleGenerativeAI({ apiKey: metadata.gemini_api_key });
      languageModel = google("models/gemini-1.5-pro-latest");
    } else if (metadata.openai_api_key) {
      const openai = createOpenAI({ apiKey: metadata.openai_api_key });
      languageModel = openai("gpt-4-turbo");
    } else if (metadata.anthropic_api_key) {
      const anthropic = createAnthropic({ apiKey: metadata.anthropic_api_key });
      languageModel = anthropic("claude-3-opus-20240229");
    } else {
      return new Response(JSON.stringify({ error: "No AI keys found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    const result = await streamText({
      model: languageModel,
      messages,
      system: "You are Orion, Benjamin's executioner agent. Keep responses concise.",
      tools: {
        get_leads: tool({
          description: "Get autonomous leads from the database",
          parameters: z.object({}),
        }),
        create_lead: tool({
          description: "Create a new lead",
          parameters: z.object({
            name: z.string(),
            company: z.string(),
            website: z.string().optional(),
          }),
        }),
        update_lead: tool({
          description: "Update lead status",
          parameters: z.object({
            id: z.string(),
            status: z.string(),
          }),
        }),
        get_drafts: tool({
          description: "Get drafts from Metaphor",
          parameters: z.object({}),
        }),
        process_video: tool({
          description: "Process a video in Clario using its URL",
          parameters: z.object({
            url: z.string(),
          }),
        }),
        search_context: tool({
          description: "Search user context",
          parameters: z.object({
            query: z.string(),
          }),
        }),
      },
    });

    return result.toDataStreamResponse({
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
