import { NextResponse } from "next/server";

export async function GET() {
  try {
    const influencers = [
      {
        id: 1,
        name: "Adarsh",
        followers: 12000,
        niche: "Tech",
      },
      {
        id: 2,
        name: "Riya",
        followers: 8000,
        niche: "Fashion",
      },
    ];

    return NextResponse.json({
      success: true,
      data: influencers,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}