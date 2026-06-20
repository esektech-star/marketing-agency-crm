/**
 * Meta Ads Integration Helper Functions
 * Handles fetching campaign data from Meta Marketing API
 */

import { getDb } from './db';
import { metaCampaigns, InsertMetaCampaign } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Fetch campaigns from Meta Marketing API using MCP
 * This function will be called by the Heartbeat job
 */
export async function fetchMetaCampaignsFromAPI(adAccountId: string) {
  try {
    // This will be called from an edge function that has access to MCP
    // For now, we'll prepare the structure for the edge function
    console.log(`[Meta Ads] Fetching campaigns for ad account: ${adAccountId}`);
    
    // The actual API call will happen in the edge function
    return {
      success: true,
      message: `Ready to fetch campaigns for ${adAccountId}`,
    };
  } catch (error) {
    console.error('[Meta Ads] Error fetching campaigns:', error);
    throw error;
  }
}

/**
 * Save Meta campaign data to database
 */
export async function saveMetaCampaigns(campaigns: InsertMetaCampaign[]) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    for (const campaign of campaigns) {
      // Upsert: update if exists, insert if not
      const existing = await db
        .select()
        .from(metaCampaigns)
        .where(eq(metaCampaigns.campaignId, campaign.campaignId));

      if (existing.length > 0) {
        // Update existing campaign
        await db
          .update(metaCampaigns)
          .set({
            ...campaign,
            updatedAt: new Date(),
          })
          .where(eq(metaCampaigns.campaignId, campaign.campaignId));
      } else {
        // Insert new campaign
        await db.insert(metaCampaigns).values(campaign);
      }
    }

    console.log(`[Meta Ads] Saved ${campaigns.length} campaigns to database`);
    return { success: true, count: campaigns.length };
  } catch (error) {
    console.error('[Meta Ads] Error saving campaigns:', error);
    throw error;
  }
}

/**
 * Get all Meta campaigns from database
 */
export async function getMetaCampaigns() {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    const campaigns = await db.select().from(metaCampaigns);
    return campaigns;
  } catch (error) {
    console.error('[Meta Ads] Error fetching campaigns from DB:', error);
    throw error;
  }
}

/**
 * Get Meta campaign by ID
 */
export async function getMetaCampaignById(campaignId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    const campaign = await db
      .select()
      .from(metaCampaigns)
      .where(eq(metaCampaigns.campaignId, campaignId));

    return campaign[0] || null;
  } catch (error) {
    console.error('[Meta Ads] Error fetching campaign:', error);
    throw error;
  }
}

/**
 * Delete Meta campaign
 */
export async function deleteMetaCampaign(campaignId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    await db
      .delete(metaCampaigns)
      .where(eq(metaCampaigns.campaignId, campaignId));

    console.log(`[Meta Ads] Deleted campaign: ${campaignId}`);
    return { success: true };
  } catch (error) {
    console.error('[Meta Ads] Error deleting campaign:', error);
    throw error;
  }
}

/**
 * Calculate performance metrics from campaign data
 */
export function calculateMetrics(campaign: any) {
  const metrics = {
    ctr: campaign.impressions > 0 
      ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
      : '0.00',
    cpm: campaign.impressions > 0
      ? (campaign.spend / (campaign.impressions / 1000)).toFixed(2)
      : '0.00',
    cpc: campaign.clicks > 0
      ? (campaign.spend / campaign.clicks).toFixed(2)
      : '0.00',
    roas: campaign.spend > 0 && campaign.results > 0
      ? (campaign.results / campaign.spend).toFixed(2)
      : null,
  };

  return metrics;
}

/**
 * Format campaign data for display
 */
export function formatCampaignForDisplay(campaign: any) {
  return {
    id: campaign.id,
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    objective: campaign.objective,
    status: campaign.status,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    linkClicks: campaign.linkClicks,
    spend: parseFloat(campaign.spend).toFixed(2),
    reach: campaign.reach,
    results: campaign.results,
    costPerResult: campaign.costPerResult ? parseFloat(campaign.costPerResult).toFixed(2) : 'N/A',
    videoThreeSecondPlays: campaign.videoThreeSecondPlays,
    videoPlays: campaign.videoPlays,
    ctr: parseFloat(campaign.ctr).toFixed(2),
    cpm: parseFloat(campaign.cpm).toFixed(2),
    cpc: parseFloat(campaign.cpc).toFixed(2),
    roas: campaign.roas ? parseFloat(campaign.roas).toFixed(2) : 'N/A',
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    dataFetchedAt: campaign.dataFetchedAt,
  };
}
