// API route for Gemini-powered suggestions
export async function POST(request: Request) {
  try {
    const { resume, jobDescription, testMode } = await request.json();
    const apiKey = request.headers.get('X-API-Key');
    
    // If API key provided, validate and try Gemini API
    if (apiKey) {
      // Validate API key format
      const trimmedKey = apiKey.trim();
      if (!trimmedKey.startsWith('AIza') || trimmedKey.length !== 39) {
        return Response.json({ valid: false, error: 'Invalid API key format' }, { status: 400 });
      }

      // If in test mode, make a real API call to verify the key works
      if (testMode) {
        try {
          const testResponse = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + trimmedKey,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: 'Hello'
                  }]
                }]
              })
            }
          );

          if (testResponse.ok) {
            return Response.json({ valid: true, message: 'API key verified successfully' });
          } else {
            const errorData = await testResponse.json();
            return Response.json({ 
              valid: false, 
              error: errorData.error?.message || 'API key verification failed' 
            }, { status: 401 });
          }
        } catch (testError) {
          console.error('API key test error:', testError);
          return Response.json({ 
            valid: false, 
            error: 'Failed to verify API key. Check your internet connection.' 
          }, { status: 500 });
        }
      }

      // Not test mode - generate actual suggestions
      // Try latest model first, fallback to stable if needed
      const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash'];
      
      for (const model of models) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `You are an expert recruiter. Analyze this resume against the job description and provide 5-8 specific, actionable suggestions for improvement.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Provide exactly 5-8 suggestions as a numbered list. Each suggestion should be:
- Specific and actionable
- Focus on gaps between resume and job requirements
- Include concrete examples of what to add or improve

Format: 
1. [Your suggestion]
2. [Your suggestion]
etc.`
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1000,
                }
              })
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const suggestions = text.split('\n')
              .filter((line: string) => line.trim().match(/^\d+\./))
              .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
              .filter((s: string) => s.length > 10);
            
            if (suggestions.length > 0) {
              return Response.json({ suggestions, valid: true });
            }
          } else if (model === models[models.length - 1]) {
            // Last model failed, return error
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            return Response.json({ 
              valid: false, 
              error: errorData.error?.message || 'Failed to generate suggestions' 
            }, { status: response.status });
          }
          // Try next model
        } catch (apiError) {
          console.error(`Error with model ${model}:`, apiError);
          if (model === models[models.length - 1]) {
            // Last model, return error
            return Response.json({ valid: false, error: 'API call failed' }, { status: 500 });
          }
          // Try next model
        }
      }
    }
    
    // Return empty array to trigger ML fallback
    return Response.json({ suggestions: [] });
  } catch (error) {
    console.error('Error in gemini-suggestions:', error);
    return Response.json({ suggestions: [], error: 'Internal error' }, { status: 500 });
  }
}
