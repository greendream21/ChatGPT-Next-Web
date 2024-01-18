import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/userModel";

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
  const { userId, amount } = await request.json();

  const newData = {
    userId,
    amount: typeof amount === "undefined" ? 20 : amount,
  };

  try {
    await dbConnect();

    const data = new User(newData);

    const checkAvailable = await User.findOne({ userId });

    if (checkAvailable) {
      if (typeof amount === "undefined") {
        return NextResponse.json(checkAvailable);
      } else {
        console.log("data", newData);

        const response = await User.updateOne(
          { userId: newData.userId },
          { $set: { amount: newData.amount } },
        );

        console.log(response.matchedCount + " document(s) matched");
        console.log(response.modifiedCount + " document(s) updated");

        return NextResponse.json(response);
      }
    } else {
      const response = await data.save();

      return NextResponse.json(response);
    }
  } catch (error) {
    console.log("Errors: ", error);
    return NextResponse.json(error);
  }
}
