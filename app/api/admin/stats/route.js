import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Replace with DB queries later
    const stats = {
      totalUsers: 120,
      totalInfluencers: 45,
      totalShops: 30,
      totalMatches: 80,
      revenue: 15000,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}