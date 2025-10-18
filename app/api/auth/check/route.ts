import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-unified';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json(currentUser);
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
