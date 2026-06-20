import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateMetrics, formatCampaignForDisplay } from './metaAds';

describe('Meta Ads Integration', () => {
  describe('calculateMetrics', () => {
    it('should calculate CTR correctly', () => {
      const campaign = {
        impressions: 1000,
        clicks: 50,
      };
      const metrics = calculateMetrics(campaign);
      expect(parseFloat(metrics.ctr)).toBeCloseTo(5, 1);
    });

    it('should handle zero impressions', () => {
      const campaign = {
        impressions: 0,
        clicks: 0,
      };
      const metrics = calculateMetrics(campaign);
      expect(metrics.ctr).toBe('0.00');
    });

    it('should calculate CPM correctly', () => {
      const campaign = {
        impressions: 1000,
        spend: 10,
      };
      const metrics = calculateMetrics(campaign);
      expect(parseFloat(metrics.cpm)).toBeCloseTo(10, 1);
    });

    it('should calculate CPC correctly', () => {
      const campaign = {
        clicks: 100,
        spend: 50,
      };
      const metrics = calculateMetrics(campaign);
      expect(parseFloat(metrics.cpc)).toBeCloseTo(0.5, 1);
    });

    it('should handle zero clicks for CPC', () => {
      const campaign = {
        clicks: 0,
        spend: 50,
      };
      const metrics = calculateMetrics(campaign);
      expect(metrics.cpc).toBe('0.00');
    });

    it('should calculate ROAS correctly', () => {
      const campaign = {
        spend: 100,
        results: 500,
      };
      const metrics = calculateMetrics(campaign);
      expect(parseFloat(metrics.roas || '0')).toBeCloseTo(5, 1);
    });

    it('should return null ROAS when spend is zero', () => {
      const campaign = {
        spend: 0,
        results: 500,
      };
      const metrics = calculateMetrics(campaign);
      expect(metrics.roas).toBeNull();
    });
  });

  describe('formatCampaignForDisplay', () => {
    it('should format campaign data correctly', () => {
      const campaign = {
        id: 1,
        campaignId: 'camp_123',
        campaignName: 'Test Campaign',
        objective: 'LINK_CLICKS',
        status: 'ACTIVE',
        impressions: 1000,
        clicks: 50,
        linkClicks: 45,
        spend: '50.00',
        reach: 800,
        results: 10,
        costPerResult: '5.00',
        videoThreeSecondPlays: 0,
        videoPlays: 0,
        ctr: '5.0000',
        cpm: '50.00',
        cpc: '1.00',
        roas: '2.00',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        dataFetchedAt: new Date(),
      };

      const formatted = formatCampaignForDisplay(campaign);

      expect(formatted.campaignId).toBe('camp_123');
      expect(formatted.campaignName).toBe('Test Campaign');
      expect(formatted.spend).toBe('50.00');
      expect(formatted.costPerResult).toBe('5.00');
      expect(formatted.ctr).toBe('5.00');
      expect(formatted.cpm).toBe('50.00');
      expect(formatted.cpc).toBe('1.00');
      expect(formatted.roas).toBe('2.00');
    });

    it('should handle null costPerResult', () => {
      const campaign = {
        id: 1,
        campaignId: 'camp_123',
        campaignName: 'Test Campaign',
        objective: 'LINK_CLICKS',
        status: 'ACTIVE',
        impressions: 1000,
        clicks: 50,
        linkClicks: 45,
        spend: '50.00',
        reach: 800,
        results: 10,
        costPerResult: null,
        videoThreeSecondPlays: 0,
        videoPlays: 0,
        ctr: '5.0000',
        cpm: '50.00',
        cpc: '1.00',
        roas: null,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        dataFetchedAt: new Date(),
      };

      const formatted = formatCampaignForDisplay(campaign);

      expect(formatted.costPerResult).toBe('N/A');
      expect(formatted.roas).toBe('N/A');
    });
  });
});
