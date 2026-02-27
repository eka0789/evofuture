import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIService } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!AIService.isConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { data, question } = body;

    if (!data || !question) {
      return NextResponse.json(
        { error: 'Data and question are required' },
        { status: 400 }
      );
    }

    // Analyze data
    const analysis = await AIService.analyzeData(data, question);

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: 'ai_analyze',
        description: 'Used AI data analysis',
        metadata: JSON.stringify({ question }),
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze data' },
      { status: 500 }
    );
  }
}
