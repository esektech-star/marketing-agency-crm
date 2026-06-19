import { getDb } from "./db";
import { kpis, transactions, clients } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Calculate and update KPI for a specific month
 */
export async function updateMonthlyKPI(year: number, month: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Calculate monthly revenue
  const monthlyTransactions = await db!
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "revenue"),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    );

  const monthlyRevenue = monthlyTransactions.reduce(
    (sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0),
    0
  );

  // Calculate monthly expenses
  const monthlyExpenses = await db!
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "expense"),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    );

  const totalExpenses = monthlyExpenses.reduce(
    (sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0),
    0
  );

  // Count active clients
  const activeClientsCount = await db!
    .select()
    .from(clients)
    .where(eq(clients.status, "active"));

  const netProfit = monthlyRevenue - totalExpenses;

  // Calculate month-over-month change
  const prevMonthKPI = await db!
    .select()
    .from(kpis)
    .where(
      and(
        eq(kpis.year, year),
        eq(kpis.month, month === 1 ? 12 : month - 1)
      )
    )
    .limit(1);

  const monthlyChangePercent =
    prevMonthKPI.length > 0 && parseFloat(prevMonthKPI[0].monthlyRevenue.toString()) > 0
      ? ((monthlyRevenue - parseFloat(prevMonthKPI[0].monthlyRevenue.toString())) /
          parseFloat(prevMonthKPI[0].monthlyRevenue.toString())) *
        100
      : 0;

  // Calculate year-over-year change
  const prevYearKPI = await db!
    .select()
    .from(kpis)
    .where(and(eq(kpis.year, year - 1), eq(kpis.month, month)))
    .limit(1);

  const yearOverYearChangePercent =
    prevYearKPI.length > 0 && parseFloat(prevYearKPI[0].monthlyRevenue.toString()) > 0
      ? ((monthlyRevenue - parseFloat(prevYearKPI[0].monthlyRevenue.toString())) /
          parseFloat(prevYearKPI[0].monthlyRevenue.toString())) *
        100
      : 0;

  // Calculate quarterly revenue
  const quarter = Math.ceil(month / 3);
  const quarterStartMonth = (quarter - 1) * 3 + 1;
  const quarterEndMonth = quarter * 3;

  const quarterlyTransactions = await db!
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "revenue"),
        gte(
          transactions.date,
          new Date(year, quarterStartMonth - 1, 1)
        ),
        lte(
          transactions.date,
          new Date(year, quarterEndMonth, 0, 23, 59, 59)
        )
      )
    );

  const quarterlyRevenue = quarterlyTransactions.reduce(
    (sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0),
    0
  );

  // Calculate quarterly change
  const prevQuarterKPI = await db!
    .select()
    .from(kpis)
    .where(
      and(
        eq(kpis.year, year),
        eq(kpis.month, quarter === 1 ? 12 : quarterEndMonth - 3)
      )
    )
    .limit(1);

  const quarterlyChangePercent =
    prevQuarterKPI.length > 0 && parseFloat(prevQuarterKPI[0].quarterlyRevenue.toString()) > 0
      ? ((quarterlyRevenue - parseFloat(prevQuarterKPI[0].quarterlyRevenue.toString())) /
          parseFloat(prevQuarterKPI[0].quarterlyRevenue.toString())) *
        100
      : 0;

  // Calculate yearly revenue
  const yearlyTransactions = await db!
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "revenue"),
        gte(transactions.date, new Date(year, 0, 1)),
        lte(transactions.date, new Date(year, 11, 31, 23, 59, 59))
      )
    );

  const yearlyRevenue = yearlyTransactions.reduce(
    (sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0),
    0
  );

  // Upsert KPI record
  const existingKPI = await db!
    .select()
    .from(kpis)
    .where(and(eq(kpis.year, year), eq(kpis.month, month)))
    .limit(1);

  if (existingKPI.length > 0) {
    await db!
      .update(kpis)
      .set({
        monthlyRevenue: monthlyRevenue.toString(),
        quarterlyRevenue: quarterlyRevenue.toString(),
        yearlyRevenue: yearlyRevenue.toString(),
        monthlyChangePercent: monthlyChangePercent.toString(),
        yearOverYearChangePercent: yearOverYearChangePercent.toString(),
        quarterlyChangePercent: quarterlyChangePercent.toString(),
        activeClientsCount: activeClientsCount.length,
        totalExpenses: totalExpenses.toString(),
        netProfit: netProfit.toString(),
      })
      .where(and(eq(kpis.year, year), eq(kpis.month, month)));
  } else {
    await db!.insert(kpis).values({
      year,
      month,
      monthlyRevenue: monthlyRevenue.toString(),
      quarterlyRevenue: quarterlyRevenue.toString(),
      yearlyRevenue: yearlyRevenue.toString(),
      monthlyChangePercent: monthlyChangePercent.toString(),
      yearOverYearChangePercent: yearOverYearChangePercent.toString(),
      quarterlyChangePercent: quarterlyChangePercent.toString(),
      activeClientsCount: activeClientsCount.length,
      totalExpenses: totalExpenses.toString(),
      netProfit: netProfit.toString(),
    });
  }
}

/**
 * Get KPI data for a specific year
 */
export async function getYearlyKPIData(year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(kpis)
    .where(eq(kpis.year, year))
    .orderBy(kpis.month);
}

/**
 * Get KPI comparison between two years
 */
export async function getYearComparisonKPI(year1: number, year2: number) {
  const year1Data = await getYearlyKPIData(year1);
  const year2Data = await getYearlyKPIData(year2);

  return {
    year1: year1Data,
    year2: year2Data,
  };
}
