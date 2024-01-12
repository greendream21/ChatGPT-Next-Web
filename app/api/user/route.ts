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
  const { userEmail, amount, status } = await request.json();

  const newData = {
    userEmail,
    amount,
    status,
  };

  console.log("HHHHHHHHH", newData);

  await createData(newData);
  let json_response = {
    status: true,
  };
  return NextResponse.json(json_response);
}
