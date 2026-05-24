import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    console.log('Sending meal image to webhook...');

    const webhookUrl = 'https://bision.app.n8n.cloud/webhook-test/Meal.Ai';
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error:', response.status, errorText);

      const isMissingWorkspace = errorText.includes('No workspace here');
      const message = isMissingWorkspace
        ? 'The meal scan webhook is not reachable. n8n says “No workspace here”, so the webhook URL or workspace subdomain appears incorrect.'
        : `The meal scan webhook returned ${response.status}. Please check that the n8n workflow is active and the webhook URL is correct.`;
      
      return new Response(
        JSON.stringify({ error: message, details: errorText.slice(0, 500), webhookUrl }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Webhook response:', JSON.stringify(data));
    
    // Check if webhook returned "Workflow was started" message (async workflow)
    if (data.message === "Workflow was started") {
      console.error('Webhook is configured for async execution. Add a "Respond to Webhook" node in n8n.');
      return new Response(
        JSON.stringify({ 
          error: 'Webhook is not configured to return data. Please add a "Respond to Webhook" node at the end of your n8n workflow to return the analysis results.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate the expected response format
    if (!data || !Array.isArray(data) || !data[0]?.output) {
      console.error('Invalid webhook response format:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from analysis service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nutritionData = data[0].output;
    console.log('Successfully analyzed meal:', JSON.stringify(nutritionData));

    return new Response(
      JSON.stringify(nutritionData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-meal function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
