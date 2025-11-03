import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionContent, assignmentTitle, assignmentInstructions, maxPoints } = await req.json();
    
    const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
    if (!MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY is not configured');
    }

    console.log('Grading submission for assignment:', assignmentTitle);

    // Create a detailed system prompt for assignment grading
    const systemPrompt = `You are an expert educational AI assistant that evaluates student assignments. 
Your task is to provide constructive, detailed feedback that helps students improve their work.

Guidelines for grading:
1. Evaluate based on the assignment instructions provided
2. Be fair, constructive, and encouraging
3. Identify both strengths and areas for improvement
4. Provide specific examples from the submission
5. Suggest concrete steps for improvement
6. Grade on a scale of 0-${maxPoints} points
7. Return your response in a structured format

Format your response as follows:
SCORE: [numerical score out of ${maxPoints}]

STRENGTHS:
- [List key strengths]

AREAS FOR IMPROVEMENT:
- [List areas that need work]

DETAILED FEEDBACK:
[Provide detailed paragraph feedback]

SUGGESTIONS:
- [Specific actionable suggestions]`;

    const userPrompt = `Assignment Title: ${assignmentTitle}

Assignment Instructions:
${assignmentInstructions}

Student Submission:
${submissionContent}

Please evaluate this submission and provide comprehensive feedback.`;

    // Call Mistral AI API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'Invalid API key. Please check your Mistral API configuration.' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    console.log('AI grading completed successfully');

    // Parse the score from the feedback
    const scoreMatch = feedback.match(/SCORE:\s*(\d+)/i);
    const suggestedGrade = scoreMatch ? parseInt(scoreMatch[1]) : null;

    return new Response(JSON.stringify({ 
      feedback,
      suggestedGrade 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in grade-assignment function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
