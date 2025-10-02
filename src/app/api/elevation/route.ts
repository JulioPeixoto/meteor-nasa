import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Elevation API endpoint - Coming soon',
    status: 'under_development'
  })
}
