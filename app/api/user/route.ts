import { NextRequest, NextResponse } from "next/server";

import { createData, getData } from "./handlers";
export async function GET() {
  const data = await getData();

  let json_response = {
    data: data,
    status: "success",
  };
  return NextResponse.json(json_response);
}

export async function POST(request: NextRequest) {
  const { userId, query, userEmail } = await request.json();

  const newData = {
    userId: String(userId),
    query: Number(query),
    userEmail: String(userEmail),
  };

  await createData(newData);
  let json_response = {
    status: "success",
  };
  return NextResponse.json(json_response);
}
