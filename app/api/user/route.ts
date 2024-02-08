import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/userModel";
import Setting from "@/app/models/settingModel";

export async function GET() {
  try {
    await dbConnect();

    const response = await User.find({});

    return NextResponse.json(response);
  } catch (error) {
    console.error("Errors: ", error);

    return NextResponse.json(error);
  }
}

export async function POST(request: NextRequest) {
  const { userId, email, amount, phone } = await request.json();

  try {
    await dbConnect();

    const { limit } = await Setting.findOne({ id: "default" });

    const newData = {
      userId,
      email,
      phone,
      amount: limit,
    };

    const updateData = {
      userId,
      amount,
      phone,
    };

    const data = new User(newData);

    const checkAvailable = await User.findOne({ userId });

    if (checkAvailable) {
      if (!updateData.amount) return NextResponse.json("None!");

      const response = await User.updateOne(
        { userId },
        {
          $set: { amount: updateData.amount },
        },
      );

      return NextResponse.json(response);
    } else {
      const response = await data.save();

      return NextResponse.json(response);
    }
  } catch (error) {
    console.log("Errors: ", error);
    return NextResponse.json(error);
  }
}
