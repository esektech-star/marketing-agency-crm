import { invokeLLM } from "./_core/llm";
import * as db from "./db";

export async function generateClientInsights(clientId: number) {
  try {
    const client = await db.getClientById(clientId);
    if (!client) return null;

    const campaigns = await db.getCampaigns();
    const clientCampaigns = campaigns.filter((c: any) => c.relatedClient === clientId);
    
    const tasks = await db.getTasks();
    const clientTasks = tasks.filter((t: any) => t.relatedClient === clientId);

    const prompt = `
You are a marketing agency consultant. Analyze the following client data and provide strategic insights and recommendations.

Client Information:
- Name: ${client.name}
- Service Type: ${client.serviceType}
- Status: ${client.status}
- Monthly Amount: ₪${client.monthlyAmount || 0}
- Active Since: ${new Date(client.startDate).toLocaleDateString()}

Active Campaigns: ${clientCampaigns.length}
${clientCampaigns.slice(0, 3).map((c: any) => `- ${c.name} (${c.platform}) - Budget: ₪${c.budget || 0}`).join('\n')}

Active Tasks: ${clientTasks.length}
${clientTasks.filter((t: any) => t.status !== 'completed').slice(0, 3).map((t: any) => `- ${t.title} (${t.priority} priority)`).join('\n')}

Based on this data, provide:
1. Key Performance Indicators (KPIs) to track
2. Strategic recommendations for improvement
3. Potential growth opportunities
4. Risk areas to monitor

Format your response as a JSON object with keys: kpis, recommendations, opportunities, risks
Each value should be an array of strings.
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a marketing strategy expert. Provide insights in JSON format only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "client_insights",
          strict: true,
          schema: {
            type: "object",
            properties: {
              kpis: {
                type: "array",
                items: { type: "string" },
                description: "Key performance indicators to track",
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "Strategic recommendations",
              },
              opportunities: {
                type: "array",
                items: { type: "string" },
                description: "Growth opportunities",
              },
              risks: {
                type: "array",
                items: { type: "string" },
                description: "Risk areas to monitor",
              },
            },
            required: ["kpis", "recommendations", "opportunities", "risks"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return content;
  } catch (error) {
    console.error("Error generating client insights:", error);
    return null;
  }
}

export async function generateCampaignRecommendations(campaignId: number) {
  try {
    const campaign = await db.getCampaignById(campaignId);
    if (!campaign) return null;

    const prompt = `
You are a digital marketing expert. Analyze this campaign and provide optimization recommendations.

Campaign Details:
- Name: ${campaign.name}
- Platform: ${campaign.platform}
- Budget: ₪${campaign.budget || 0}
- Duration: ${new Date(campaign.startDate).toLocaleDateString()} to ${new Date(campaign.endDate).toLocaleDateString()}
- Status: ${campaign.status}
- Description: ${campaign.description || "No description"}

Provide recommendations in JSON format with keys: optimization_tips, budget_allocation, audience_targeting, content_strategy
Each value should be an array of strings with actionable advice.
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a digital marketing strategist. Provide recommendations in JSON format only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "campaign_recommendations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              optimization_tips: {
                type: "array",
                items: { type: "string" },
              },
              budget_allocation: {
                type: "array",
                items: { type: "string" },
              },
              audience_targeting: {
                type: "array",
                items: { type: "string" },
              },
              content_strategy: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["optimization_tips", "budget_allocation", "audience_targeting", "content_strategy"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return content;
  } catch (error) {
    console.error("Error generating campaign recommendations:", error);
    return null;
  }
}
