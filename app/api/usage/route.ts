import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/app/lib/dbConnect";
import Usage from "@/app/models/usageModel";

export async function GET() {
  try {
    await dbConnect();

    const response = await Usage.find({});

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    return NextResponse.json(error);
  }
}

export async function POST(request: NextRequest) {
  const { email, model, token, methods } = await request.json();

  try {
    await dbConnect();

    const newData = {
      email,
      model,
      token,
      methods,
    };

    const data = new Usage(newData);

    const response = await data.save();

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    return NextResponse.json(error);
  }
}
