import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sig: string }> }
) {
  try {
    const { sig } = await params;

    if (!sig) {
      return NextResponse.json(
        { error: 'Signature parameter is required' },
        { status: 400 }
      );
    }

    // Here you would typically fetch settlement data based on the signature
    // For now, returning a mock response
    const settlementData = {
      signature: sig,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      amount: '1000',
      token: 'AXIS',
      // Add more settlement details as needed
    };

    return NextResponse.json(settlementData);

  } catch (error) {
    console.error('Error fetching settlement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
