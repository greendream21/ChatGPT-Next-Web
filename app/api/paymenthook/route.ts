import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { data } = await req.json();

  const hotmart_token = req.headers.get("x-hotmart-hottok");

  console.log("data", data);
  console.log("Header", hotmart_token);

  return NextResponse.json(data);
}
