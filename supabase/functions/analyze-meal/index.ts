import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEBHOOK_URL = 'https://bision.app.n8n.cloud/webhook-test/Meal.Ai';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const toNumber = (value: unknown) => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : 0;
};

const normalizeNutritionData = (rawData: unknown) => {
  const data = rawData as any;
  const output = Array.isArray(data) ? data[0]?.output : data?.output ?? data;

  if (!output || !Array.isArray(output.food) || !output.total) {
    return null;
  }

  return {
    status: output.status || 'success',
    food: output.food.map((item: any) => ({
      name: String(item.name || 'Unknown food'),
      quantity: String(item.quantity || 'estimated serving'),
      calories: toNumber(item.calories),
      protein: toNumber(item.protein),
      carbs: toNumber(item.carbs),
      fat: toNumber(item.fat),
    })),
    total: {
      calories: toNumber(output.total.calories),
      protein: toNumber(output.total.protein),
      carbs: toNumber(output.total.carbs),
      fat: toNumber(output.total.fat),
    },
  };
};

const extractJson = (text: string) => {
  const cleaned = text.replace(/```json|```/gi, '').trim();
  const firstObject = cleaned.indexOf('{');
  const firstArray = cleaned.indexOf('[');
  const start = firstArray >= 0 && (firstArray < firstObject || firstObject === -1) ? firstArray : firstObject;

  if (start === -1) {
    throw new Error('AI returned text instead of JSON');
  }

  const jsonText = cleaned.slice(start, Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']')) + 1);
  return JSON.parse(jsonText);
};

const analyzeWithLovableAI = async (imageBase64: string) => {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');

  if (!apiKey) {
    throw new Error('Built-in AI is not configured for this project.');
  }

  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition image analyzer. Return only valid JSON with this exact shape: {"status":"success","food":[{"name":"Food name","quantity":"estimated amount","calories":0,"protein":0,"carbs":0,"fat":0}],"total":{"calories":0,"protein":0,"carbs":0,"fat":0}}. Estimate values from the visible meal photo. Use grams for macros and calories for calories.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this meal photo and estimate calories, protein, carbs, and fat for each detected food item.' },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
    }),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('Built-in AI error:', aiResponse.status, errorText);
    throw new Error(`Built-in AI analysis failed with status ${aiResponse.status}.`);
  }

  const aiData = await aiResponse.json();
  const content = aiData?.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part: any) => part?.text || '').join('\n')
    : String(content || '');
  const parsed = extractJson(text);
  const normalized = normalizeNutritionData(parsed);

  if (!normalized) {
    throw new Error('Built-in AI returned an invalid nutrition format.');
  }

  return normalized;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return jsonResponse({ error: 'Image data is required' }, 400);
    }


    console.log('Sending meal image to webhook...');

    const response = await fetch(WEBHOOK_URL, {
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

      console.warn(`${message} Falling back to built-in AI analysis.`);
      const fallbackData = await analyzeWithLovableAI(imageBase64);
      return jsonResponse({ ...fallbackData, source: 'built-in-ai', warning: message });
    }

    const responseText = await response.text();
    let data: unknown;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Webhook returned non-JSON response:', responseText.slice(0, 500), parseError);
      const fallbackData = await analyzeWithLovableAI(imageBase64);
      return jsonResponse({
        ...fallbackData,
        source: 'built-in-ai',
        warning: 'The n8n webhook did not return JSON, so built-in AI analyzed the image instead.',
      });
    }

    console.log('Webhook response:', JSON.stringify(data));
    
    // Check if webhook returned "Workflow was started" message (async workflow)
    if (data.message === "Workflow was started") {
      console.error('Webhook is configured for async execution. Add a "Respond to Webhook" node in n8n.');
      const fallbackData = await analyzeWithLovableAI(imageBase64);
      return jsonResponse({
        ...fallbackData,
        source: 'built-in-ai',
        warning: 'The n8n webhook started asynchronously and did not return meal data, so built-in AI analyzed the image instead.',
      });
    }
    
    // Validate the expected response format
    if (!data || !Array.isArray(data) || !data[0]?.output) {
      console.error('Invalid webhook response format:', data);
      const fallbackData = await analyzeWithLovableAI(imageBase64);
      return jsonResponse({
        ...fallbackData,
        source: 'built-in-ai',
        warning: 'The n8n webhook returned an unexpected format, so built-in AI analyzed the image instead.',
      });
    }

    const nutritionData = data[0].output;
    console.log('Successfully analyzed meal:', JSON.stringify(nutritionData));

    return jsonResponse({ ...nutritionData, source: 'webhook' });

  } catch (error) {
    console.error('Error in analyze-meal function:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error occurred' }, 500);
  }
});
