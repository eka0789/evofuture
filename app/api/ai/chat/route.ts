import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIService, ChatMessage } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!AIService.isConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set OPENAI_API_KEY.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { messages, model, temperature, maxTokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Generate AI response
    const response = await AIService.chat(messages as ChatMessage[], {
      model,
      temperature,
      maxTokens,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: 'ai_chat',
        description: 'Used AI chat assistant',
        metadata: JSON.stringify({
          messageCount: messages.length,
          tokensUsed: response.usage?.totalTokens,
        }),
      },
    });

    return NextResponse.json({
      content: response.content,
      usage: response.usage,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
