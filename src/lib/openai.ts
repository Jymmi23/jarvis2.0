import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function getAIResponse(message: string) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "Eres JARVIS, un asistente virtual avanzado experto en programación, tecnología, y diseño técnico. Tienes la capacidad de ayudar con proyectos de programación en cualquier lenguaje, crear planos técnicos, y proporcionar asistencia detallada en mecánica y mecatrónica. Tus respuestas son precisas, profesionales y útiles."
        },
        { 
          role: "user", 
          content: message 
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0]?.message?.content || "Lo siento, no pude procesar tu solicitud.";
  } catch (error) {
    console.error('Error al obtener respuesta de OpenAI:', error);
    return "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.";
  }
}