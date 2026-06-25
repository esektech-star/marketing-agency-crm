import { invokeLLM, Message } from "./_core/llm";
import * as db from "./db";

export async function chatWithAI(messages: Message[], clientId?: number) {
  try {
    let systemPrompt = `You are a helpful marketing strategy assistant for a digital marketing agency. 
You provide expert advice on marketing campaigns, client strategies, and business growth.
Be concise, professional, and actionable in your responses.`;

    if (clientId) {
      const client = await db.getClientById(clientId);
      if (client) {
        systemPrompt += `\n\nYou are assisting with client: ${client.name} (${client.serviceType})`;
      }
    }

    const systemMessage: Message = {
      role: "system",
      content: systemPrompt,
    };

    const allMessages = [systemMessage, ...messages];

    const response = await invokeLLM({
      messages: allMessages,
    });

    const assistantMessage = response.choices[0].message.content;
    return assistantMessage;
  } catch (error) {
    console.error("Error in AI chat:", error);
    throw error;
  }
}
