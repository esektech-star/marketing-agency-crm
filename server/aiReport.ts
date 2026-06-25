import { invokeLLM } from "./_core/llm";
import * as db from "./db";

export async function generatePerformanceReport() {
  try {
    const clients = await db.getClients();
    const campaigns = await db.getCampaigns();
    const tasks = await db.getTasks();

    const totalRevenue = clients.reduce((sum: number, c: any) => sum + (c.monthlyAmount || 0), 0);
    const activeClients = clients.filter((c: any) => c.status === "active").length;
    const activeCampaigns = campaigns.filter((c: any) => c.status === "active").length;
    const completedTasks = tasks.filter((t: any) => t.status === "completed").length;

    const prompt = `
Generate a comprehensive performance report for a digital marketing agency with the following data:

Performance Metrics:
- Total Clients: ${clients.length}
- Active Clients: ${activeClients}
- Monthly Revenue: ₪${totalRevenue.toFixed(0)}
- Active Campaigns: ${activeCampaigns}
- Total Tasks: ${tasks.length}
- Completed Tasks: ${completedTasks}

Provide the report in JSON format with keys: executive_summary, key_metrics, performance_analysis, recommendations, next_steps
Each section should contain actionable insights and strategic recommendations.
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a business intelligence analyst. Generate comprehensive performance reports in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "performance_report",
          strict: true,
          schema: {
            type: "object",
            properties: {
              executive_summary: {
                type: "string",
                description: "High-level overview of performance",
              },
              key_metrics: {
                type: "array",
                items: { type: "string" },
                description: "Important metrics and KPIs",
              },
              performance_analysis: {
                type: "array",
                items: { type: "string" },
                description: "Detailed analysis of performance areas",
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "Strategic recommendations",
              },
              next_steps: {
                type: "array",
                items: { type: "string" },
                description: "Action items for next quarter",
              },
            },
            required: ["executive_summary", "key_metrics", "performance_analysis", "recommendations", "next_steps"],
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
    console.error("Error generating performance report:", error);
    return null;
  }
}

export async function generateClientReport(clientId: number) {
  try {
    const client = await db.getClientById(clientId);
    if (!client) return null;

    const campaigns = await db.getCampaigns();
    const clientCampaigns = campaigns.filter((c: any) => c.relatedClient === clientId);
    
    const tasks = await db.getTasks();
    const clientTasks = tasks.filter((t: any) => t.relatedClient === clientId);

    const prompt = `
Generate a detailed client performance report for ${client.name}:

Client Information:
- Service Type: ${client.serviceType}
- Status: ${client.status}
- Monthly Revenue: ₪${client.monthlyAmount || 0}
- Active Since: ${new Date(client.startDate).toLocaleDateString()}

Campaigns: ${clientCampaigns.length}
Tasks: ${clientTasks.length}
Completed Tasks: ${clientTasks.filter((t: any) => t.status === 'completed').length}

Provide a comprehensive report in JSON format with keys: client_overview, performance_summary, achievements, challenges, recommendations
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a client success manager. Generate detailed client performance reports in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "client_report",
          strict: true,
          schema: {
            type: "object",
            properties: {
              client_overview: {
                type: "string",
                description: "Overview of the client relationship",
              },
              performance_summary: {
                type: "string",
                description: "Summary of client performance",
              },
              achievements: {
                type: "array",
                items: { type: "string" },
                description: "Key achievements and milestones",
              },
              challenges: {
                type: "array",
                items: { type: "string" },
                description: "Challenges and areas for improvement",
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "Recommendations for next steps",
              },
            },
            required: ["client_overview", "performance_summary", "achievements", "challenges", "recommendations"],
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
    console.error("Error generating client report:", error);
    return null;
  }
}
