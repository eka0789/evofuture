import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateReferralCode } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    });

    return NextResponse.json({ referralCode: user?.referralCode });
  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const referralCode = generateReferralCode();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode },
    });

    return NextResponse.json({ referralCode: user.referralCode });
  } catch (error) {
    console.error('Referral generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
