import { NextRequest, NextResponse } from "next/server";

import Setting from "@/app/models/settingModel";
import dbConnect from "@/app/lib/dbConnect";

export async function GET() {
  try {
    await dbConnect();

    const settingData = await Setting.find({});

    return NextResponse.json(settingData);
  } catch (error) {
    console.error("Error: ", error);

    return NextResponse.json(error);
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const { id, apikey } = data;

  const newData = {
    id,
    apikey,
  };

  try {
    await dbConnect();

    const data = new Setting(newData);

    const checkable = await Setting.findOne({ apikey: newData.apikey });

    if (checkable) {
      return NextResponse.json(checkable);
    } else {
      const response = await data.save();

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("Errors: ", error);

    return NextResponse.json(error);
  }
}
