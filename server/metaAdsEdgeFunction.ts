/**
 * Edge Function: Fetch Meta Ads Campaign Data
 * Called by Heartbeat job to retrieve campaign metrics from Meta API
 * 
 * This function uses the meta-marketing MCP connector to fetch data
 * and stores it in the metaCampaigns table
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { saveMetaCampaigns } from './metaAds';
import { InsertMetaCampaign } from '../drizzle/schema';

const execAsync = promisify(exec);

interface MetaCampaignData {
  id: string;
  name: string;
  objective?: string;
  status?: string;
  start_time?: string;
  stop_time?: string;
  insights?: {
    impressions?: number;
    clicks?: number;
    link_clicks?: number;
    spend?: string;
    reach?: number;
    actions?: Array<{ value: number }>;
    cost_per_action_type?: Array<{ value: string }>;
    video_3_second_plays?: number;
    video_plays?: number;
    ctr?: string;
    cpm?: string;
    cpc?: string;
    roas?: string;
  };
}

/**
 * Main function to fetch and process Meta campaign data
 * This will be called from the Heartbeat job
 */
export async function fetchAndSaveMetaCampaigns(adAccountId: string) {
  try {
    console.log(`[Meta Ads Edge] Starting fetch for ad account: ${adAccountId}`);

    // Step 1: Get all campaigns from the ad account
    const campaignsResult = await fetchCampaignsFromMeta(adAccountId);
    console.log(`[Meta Ads Edge] Retrieved ${campaignsResult.length} campaigns`);

    // Step 2: For each campaign, fetch detailed metrics
    const campaignsWithMetrics = await Promise.all(
      campaignsResult.map((campaign: MetaCampaignData) => 
        fetchCampaignMetrics(campaign.id, campaign)
      )
    );

    // Step 3: Transform data for database storage
    const campaignsToSave: InsertMetaCampaign[] = campaignsWithMetrics.map((campaign: MetaCampaignData) => {
      const insights = campaign.insights || {};
      const spend = parseFloat(String(insights.spend || '0'));
      const costPerResult = insights.cost_per_action_type?.[0]?.value 
        ? parseFloat(String(insights.cost_per_action_type[0].value))
        : null;

      return {
        campaignId: String(campaign.id),
        campaignName: String(campaign.name),
        objective: campaign.objective ? String(campaign.objective) : undefined,
        status: campaign.status ? String(campaign.status) : undefined,
        impressions: parseInt(String(insights.impressions || 0)),
        clicks: parseInt(String(insights.clicks || 0)),
        linkClicks: parseInt(String(insights.link_clicks || 0)),
        spend: String(spend),
        reach: parseInt(String(insights.reach || 0)),
        results: parseInt(String(
          insights.actions?.reduce((sum: number, a: any) => sum + a.value, 0) || 0
        )),
        costPerResult: costPerResult ? String(costPerResult) : undefined,
        videoThreeSecondPlays: parseInt(String(insights.video_3_second_plays || 0)),
        videoPlays: parseInt(String(insights.video_plays || 0)),
        ctr: String(insights.ctr ? parseFloat(String(insights.ctr)) : 0),
        cpm: String(insights.cpm ? parseFloat(String(insights.cpm)) : 0),
        cpc: String(insights.cpc ? parseFloat(String(insights.cpc)) : 0),
        roas: insights.roas ? String(parseFloat(String(insights.roas))) : undefined,
        startDate: campaign.start_time ? new Date(campaign.start_time) : undefined,
        endDate: campaign.stop_time ? new Date(campaign.stop_time) : undefined,
      };
    });

    // Step 4: Save to database
    const result = await saveMetaCampaigns(campaignsToSave);
    console.log(`[Meta Ads Edge] Saved ${result.count} campaigns to database`);

    return {
      success: true,
      message: `Successfully fetched and saved ${result.count} campaigns`,
      count: result.count,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Meta Ads Edge] Error:', error);
    throw error;
  }
}

/**
 * Fetch campaigns from Meta API using MCP
 * Uses manus-mcp-cli to call meta_marketing_get_campaigns
 */
async function fetchCampaignsFromMeta(adAccountId: string): Promise<MetaCampaignData[]> {
  try {
    // Format ad account ID
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

    // Call MCP tool to get campaigns
    const command = `manus-mcp-cli tool call meta_marketing_get_campaigns --server meta-marketing --input '{"ad_account_id":"${formattedId}'}'`;
    
    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout);

    if (!result.campaigns) {
      console.warn('[Meta Ads Edge] No campaigns found in response');
      return [];
    }

    return result.campaigns;
  } catch (error) {
    console.error('[Meta Ads Edge] Error fetching campaigns from Meta:', error);
    throw new Error(`Failed to fetch campaigns from Meta API: ${error}`);
  }
}

/**
 * Fetch detailed metrics for a specific campaign
 */
async function fetchCampaignMetrics(
  campaignId: string,
  campaign: MetaCampaignData
): Promise<MetaCampaignData> {
  try {
    // Call MCP tool to get campaign insights
    const command = `manus-mcp-cli tool call meta_marketing_get_insights --server meta-marketing --input '{"object_type":"campaign","object_id":"${campaignId}","level":"campaign"}'`;
    
    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout);

    return {
      ...campaign,
      insights: result.insights?.[0] || {},
    };
  } catch (error) {
    console.error(`[Meta Ads Edge] Error fetching metrics for campaign ${campaignId}:`, error);
    // Return campaign without metrics rather than failing completely
    return {
      ...campaign,
      insights: {},
    };
  }
}

/**
 * Format error response for Heartbeat callback
 */
export function formatErrorResponse(error: any) {
  return {
    error: error.message || 'Unknown error',
    stack: error.stack,
    context: {
      timestamp: new Date().toISOString(),
    },
  };
}
