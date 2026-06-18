import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbService } from '@/lib/db-service';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function GET(
  request: Request,
  context: { params: Promise<{ workId: string }> }
) {
  try {
    const { workId } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = verifyAccessToken(token) as any;
    if (!payload?.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const ownerEmail = payload.email as string;

    // Fetch entries and private works
    const entries = (await dbService.getEntries(ownerEmail)) as any[];
    const privateWorks = await dbService.getPrivateWorks(ownerEmail);

    // Find the work (either government contract entry or private work)
    let workName = '';
    let agreedAmount = 0;
    let gstApplicable = true;

    const entry = entries.find((e: any) => e.id === workId);
    if (entry) {
      workName = entry.workName;
      agreedAmount = entry.amount;
      gstApplicable = entry.gstApplicable;
    } else {
      const privateWork = privateWorks.find((p: any) => p.id === workId);
      if (privateWork) {
        workName = privateWork.workName;
        agreedAmount = privateWork.approxFinalWorkAmount;
        gstApplicable = privateWork.gstApplicable;
      } else {
        return NextResponse.json({ error: 'Work not found' }, { status: 404 });
      }
    }

    // Fetch materials costs
    const cementLoads = await dbService.getCementLoads(ownerEmail);
    const tarLoads = await dbService.getTarLoads(ownerEmail);

    const cementCost = cementLoads
      .filter((cl: any) => cl.workId === workId)
      .reduce((sum: number, cl: any) => sum + cl.amountPerLoad, 0);

    const tarCost = tarLoads
      .filter((tl: any) => tl.workId === workId)
      .reduce((sum: number, tl: any) => sum + tl.amountPerLoad, 0);

    const materialsCost = cementCost + tarCost;

    // Fetch execution expenses
    const expenses = await dbService.getExpenses(ownerEmail);
    const executionExpense = expenses
      .filter((exp: any) => exp.workId === workId)
      .reduce((sum: number, exp: any) => sum + exp.amount, 0);

    // Calculations
    const gstPercentage = gstApplicable ? 18 : 0;
    const gstAmount = agreedAmount * (gstPercentage / 100);
    const agreedAmountWithGST = agreedAmount + gstAmount;

    const totalExpense = materialsCost + executionExpense;
    const totalExpenseWithGST = totalExpense + (totalExpense * 0.18); // Formula: Total Expense + 18% GST

    const overallProfit = agreedAmountWithGST - totalExpenseWithGST;
    const profitPercentage = agreedAmountWithGST > 0 ? (overallProfit / agreedAmountWithGST) * 100 : 0;

    return NextResponse.json({
      workId,
      workName,
      agreedAmount,
      gstPercentage,
      gstAmount,
      agreedAmountWithGST,
      materialsCost,
      executionExpense,
      totalExpense,
      totalExpenseWithGST,
      overallProfit,
      profitPercentage: Math.round(profitPercentage * 100) / 100 // Round to 2 decimal places
    });
  } catch (error: any) {
    console.error('Error calculating profit:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
