import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Initialize GoogleGenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI with key:', err);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI request timed out')), ms)),
  ]);
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiAvailable: !!aiClient,
    model: 'gemini-3.8-flash',
  });
});

// AI Financial Audit endpoint
app.post('/api/ai/audit', async (req, res) => {
  const { financialSummary } = req.body;

  if (!financialSummary) {
    return res.status(400).json({ error: 'Financial summary data is required' });
  }

  if (!aiClient) {
    return res.status(200).json({
      fallback: true,
      message: 'AI API Key is not configured on server. Showing rule-based smart diagnostic.',
      analysis: generateLocalDiagnostic(financialSummary),
    });
  }

  try {
    const prompt = `You are a certified, objective personal financial planner analyzing a user's financial profile.
Here is the user's financial data:
${JSON.stringify(financialSummary, null, 2)}

Provide a structured, deeply practical financial assessment in strict JSON format matching this schema:
{
  "financialHealthVerdict": "string (e.g. 'Strong foundation with high debt drag', 'Balanced growth with minor leaks')",
  "healthScore": number between 1 and 100,
  "keyObservations": [
    { "type": "positive" | "warning" | "neutral", "title": "string", "detail": "string" }
  ],
  "prioritizedActions": [
    { "priority": "High" | "Medium" | "Low", "action": "string", "impact": "string (e.g. Saves $220/month or accelerates debt-free date by 8 months)", "effort": "Quick Win" | "Strategic" }
  ],
  "budgetRuleFeedback": "string explaining how their 50/30/20 breakdown compares to recommended benchmarks and where to trim or reallocate",
  "recommendedMonthlySavingsTarget": number
}

Keep advice concrete, realistic, supportive, and free of jargon. Return ONLY valid JSON, no markdown wrapper.`;

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      8000
    );

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // In case of markdown formatting
      const clean = text.replace(/```json\n?|```/g, '').trim();
      parsed = JSON.parse(clean);
    }

    return res.json({ fallback: false, analysis: parsed });
  } catch (error: any) {
    console.error('Error generating AI audit:', error);
    return res.status(200).json({
      fallback: true,
      error: error?.message || 'Failed to call Gemini API',
      analysis: generateLocalDiagnostic(financialSummary),
    });
  }
});

// AI Financial Chat / Q&A endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, financialSummary, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!aiClient) {
    return res.status(200).json({
      reply: `I see your financial profile! Currently, your monthly net income is $${financialSummary?.monthlyIncome || 0} with $${financialSummary?.totalMonthlyExpenses || 0} in expenses (Savings rate: ${financialSummary?.savingsRate || 0}%). To provide real-time custom Gemini AI advisory, please ensure the GEMINI_API_KEY is active. Meanwhile, consider reviewing your debt payoff strategy and building a 3-6 month emergency fund!`,
    });
  }

  try {
    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'User' : 'Advisor'}: ${h.text}`).join('\n')
      : '';

    const systemPrompt = `You are "Smart Money Advisor", a knowledgeable, compassionate, and precise personal finance expert.
The user's real-time financial snapshot:
- Monthly Income: $${financialSummary?.monthlyIncome ?? 0}
- Monthly Expenses: $${financialSummary?.totalMonthlyExpenses ?? 0}
- Monthly Savings/Surplus: $${financialSummary?.monthlySavings ?? 0} (Savings Rate: ${financialSummary?.savingsRate ?? 0}%)
- Needs: $${financialSummary?.needsTotal ?? 0} (${financialSummary?.needsPercent ?? 0}%)
- Wants: $${financialSummary?.wantsTotal ?? 0} (${financialSummary?.wantsPercent ?? 0}%)
- Total Debt: $${financialSummary?.totalDebt ?? 0}
- Liquid Emergency Savings: $${financialSummary?.emergencySavings ?? 0} (${financialSummary?.runwayMonths ?? 0} months runway)
- Goals: ${JSON.stringify(financialSummary?.goals || [])}

Answer the user's question with specific, quantified advice based on their actual numbers. Be concise (2-4 paragraphs max), encouraging, and use bullet points when suggesting actionable steps.`;

    const fullPrompt = `${systemPrompt}\n\nRecent conversation:\n${formattedHistory}\n\nUser Question: ${message}`;

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: fullPrompt,
      }),
      8000
    );

    return res.json({ reply: response.text || 'I have analyzed your situation and recommend focusing on increasing your emergency cushion first.' });
  } catch (error: any) {
    console.error('Error answering AI chat:', error);
    return res.status(500).json({ error: error?.message || 'Chat generation failed' });
  }
});

// AI "Can I Afford This?" Stress Test endpoint
app.post('/api/ai/stress-test', async (req, res) => {
  const { scenario, financialSummary } = req.body;

  if (!scenario) {
    return res.status(400).json({ error: 'Scenario description is required' });
  }

  if (!aiClient) {
    const cost = Number(scenario.cost || 0);
    const surplus = (financialSummary?.monthlyIncome || 0) - (financialSummary?.totalMonthlyExpenses || 0);
    const canAfford = surplus >= cost;
    return res.json({
      verdict: canAfford ? 'Affordable with adjustments' : 'Stretches cash flow significantly',
      impact: `This expense represents ${Math.round((cost / ((financialSummary?.monthlyIncome || 1))) * 100)}% of your monthly income. Surplus remaining: $${Math.max(0, surplus - cost)}.`,
      recommendation: canAfford ? 'Allocate from your Wants budget so your Savings goals remain untouched.' : 'Consider delaying or finding a lower-cost alternative to maintain your emergency fund velocity.',
    });
  }

  try {
    const prompt = `You are a financial stress-test analyst.
User Financial Snapshot:
${JSON.stringify(financialSummary, null, 2)}

User's Proposed Expense / Decision:
"${scenario.description}" (Estimated Monthly or One-time Cost: $${scenario.cost || 0}, Type: ${scenario.type || 'Monthly Expense'})

Evaluate whether the user can safely afford this without derailing debt repayment, emergency buffer, or retirement goals.
Return strict JSON with:
{
  "canAffordVerdict": "Yes, comfortably" | "Yes, but requires tradeoffs" | "Risky / Not advised right now",
  "cashFlowImpact": "string explaining how it changes their monthly surplus and savings rate",
  "tradeOffs": ["string tradeoff 1", "string tradeoff 2"],
  "safeAlternative": "string suggestion for how to make it feasible or negotiate down"
}
Return ONLY valid JSON.`;

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      8000
    );

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const clean = text.replace(/```json\n?|```/g, '').trim();
      parsed = JSON.parse(clean);
    }

    return res.json({ analysis: parsed });
  } catch (error: any) {
    console.error('Error running stress test:', error);
    return res.status(500).json({ error: error?.message || 'Failed to run scenario stress test' });
  }
});

// Fallback rule-based diagnostic engine if offline or no key
function generateLocalDiagnostic(summary: any) {
  const savingsRate = Number(summary.savingsRate || 0);
  const runwayMonths = Number(summary.runwayMonths || 0);
  const debtTotal = Number(summary.totalDebt || 0);
  const needsPercent = Number(summary.needsPercent || 50);
  const wantsPercent = Number(summary.wantsPercent || 30);

  let score = 50;
  if (savingsRate >= 20) score += 20;
  else if (savingsRate >= 10) score += 10;

  if (runwayMonths >= 6) score += 20;
  else if (runwayMonths >= 3) score += 12;
  else if (runwayMonths >= 1) score += 5;

  if (debtTotal === 0) score += 10;
  else if (debtTotal < (summary.monthlyIncome || 0) * 2) score += 5;
  else score -= 5;

  score = Math.min(98, Math.max(25, score));

  const observations = [];
  if (runwayMonths < 3) {
    observations.push({
      type: 'warning',
      title: 'Low Emergency Buffer',
      detail: `Your emergency reserve covers only ${runwayMonths.toFixed(1)} months of necessary expenses. The standard safe threshold is 3 to 6 months.`,
    });
  } else {
    observations.push({
      type: 'positive',
      title: 'Solid Emergency Cushion',
      detail: `You have ${runwayMonths.toFixed(1)} months of living expenses safely banked in liquid funds.`,
    });
  }

  if (wantsPercent > 35) {
    observations.push({
      type: 'warning',
      title: 'Elevated Discretionary Outflow',
      detail: `Wants account for ${wantsPercent.toFixed(0)}% of your income (ideal benchmark is ≤30%). Trimming $100-$200 here accelerates wealth velocity.`,
    });
  }

  if (debtTotal > 0) {
    observations.push({
      type: 'neutral',
      title: 'Active Debt Obligations',
      detail: `Total debt stands at $${debtTotal.toLocaleString()}. Utilizing the Avalanche strategy will minimize lifetime interest costs.`,
    });
  }

  return {
    financialHealthVerdict: score >= 75 ? 'Strong financial momentum with disciplined habits' : score >= 55 ? 'Balanced financial base with clear optimization opportunities' : 'Vulnerable cash flow requiring immediate stabilization',
    healthScore: score,
    keyObservations: observations,
    prioritizedActions: [
      {
        priority: runwayMonths < 3 ? 'High' : 'Medium',
        action: runwayMonths < 3 ? 'Direct all extra cash surplus to liquid high-yield savings until 3 months of expenses are secured' : 'Automate monthly index fund contributions',
        impact: runwayMonths < 3 ? 'Prevents high-interest credit card debt in surprise emergencies' : 'Builds compound wealth at 7-9% annual returns',
        effort: 'Quick Win',
      },
      {
        priority: 'Medium',
        action: 'Review recurring subscriptions and dining/entertainment allocations',
        impact: 'Recovers an estimated $75-$180/month towards primary financial goals',
        effort: 'Quick Win',
      },
      {
        priority: debtTotal > 0 ? 'High' : 'Low',
        action: debtTotal > 0 ? 'Apply debt avalanche method to highest interest rate balance' : 'Set up sinking funds for upcoming irregular annual expenses',
        impact: debtTotal > 0 ? 'Saves hundreds in cumulative interest charges' : 'Smooths out cash flow fluctuations throughout the year',
        effort: 'Strategic',
      },
    ],
    budgetRuleFeedback: `Your current distribution is ${needsPercent.toFixed(0)}% Needs, ${wantsPercent.toFixed(0)}% Wants, and ${savingsRate.toFixed(0)}% Savings. ${needsPercent > 55 ? 'Needs are running slightly high; seek fixed expense efficiencies.' : 'Needs are well contained.'}`,
    recommendedMonthlySavingsTarget: Math.round((summary.monthlyIncome || 0) * 0.2),
  };
}

// Dev & Prod Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Money Planner server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
