import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function askAssistant(prompt: string, context: any) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    És o Assistente IA do Hub do Cliente TrataTudo.
    O teu objetivo é ajudar o cliente a gerir os seus pedidos e reclamações.
    Tens acesso ao contexto do cliente (pedidos, mensagens, etc.).
    Responde sempre em Português de Portugal.
    Sê profissional, prestável e conciso.
    
    Contexto atual:
    ${JSON.stringify(context, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Erro no assistente IA:", error);
    return "Desculpe, ocorreu um erro ao processar o seu pedido. Por favor, tente novamente mais tarde.";
  }
}
