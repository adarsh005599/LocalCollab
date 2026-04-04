import { NextResponse } from "next/server";

export async function GET() {
  try {
    const shops = [
      {
        id: 1,
        name: "Tech Store",
        category: "Electronics",
        location: "Delhi",
      },
      {
        id: 2,
        name: "Fashion Hub",
        category: "Clothing",
        location: "Mumbai",
      },
    ];

    return NextResponse.json({
      success: true,
      data: shops,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}