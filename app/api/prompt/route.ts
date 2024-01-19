import { NextRequest, NextResponse } from "next/server";

import Prompt from "@/app/models/promptModel";
import dbConnect from "@/app/lib/dbConnect";

export async function GET() {
  try {
    await dbConnect();

    const response = await Prompt.find({});

    return NextResponse.json(response);
  } catch (error) {
    console.error("Errors: ", error);

    return NextResponse.json(error);
  }
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

  try {
    await dbConnect();

    const data = new Prompt(newData);

    const checkable = await Prompt.findOne({ id: newData.id });

    if (checkable) {
      const response = await Prompt.updateOne(
        { id: newData.id },
        { $set: { title: newData.title, content: newData.content } },
      );

      return NextResponse.json(response);
    } else {
      const response = await data.save();

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("Error: ", error);

    return NextResponse.json(error);
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {
    await dbConnect();

    const checkable = await Prompt.findOne({ id });

    if (checkable) {
      const response = await Prompt.deleteOne({ id });

      console.log("Deleted: ", response.deleteCount);
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("Errors: ", error);

    return NextResponse.json(error);
  }
}
