import { NextResponse } from "next/server";

export async function GET() {
  try {
    const matches = [
      {
        id: 1,
        influencer: "Adarsh",
        shop: "Tech Store",
        status: "Active",
      },
      {
        id: 2,
        influencer: "Riya",
        shop: "Fashion Hub",
        status: "Pending",
      },
    ];

    return NextResponse.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}