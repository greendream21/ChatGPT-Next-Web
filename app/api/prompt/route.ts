import { NextRequest, NextResponse } from "next/server";

import { createPrompt, getPrompt } from "./handlers";
export async function GET() {
  const data = await getPrompt();

  let json_response = {
    data: data,
    status: true,
  };
  return NextResponse.json(json_response);
}

export async function POST(request: NextRequest) {
  const { id, userEmail, title, content, isUser } = await request.json();

  const newData = {
    id,
    userEmail,
    title,
    content,
    isUser,
  };

  await createPrompt(newData);
  let json_response = {
    status: true,
  };
  return NextResponse.json(json_response);
}
