import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { data, event } = await req.json();

  const hotmart_token = process.env.HOTMART_HOTTOK;
  const token = req.headers.get("x-hotmart-hottok");

  if (hotmart_token !== token) {
    console.log("Incorrect Token, No Access!");
    return NextResponse.json("Incorrect Token, No Access!");
  }

  const updatedata = async (props: any) => {
    const { email } = props;
    try {
      await dbConnect();

      const checkable = await User.findOne({ email });

      if (!checkable)
        return NextResponse.json("Please signup with ChatGPT project!");

      const status = "premium";

      const response = await User.updateOne(
        { email },
        { $set: { status: status } },
      );

      return NextResponse.json(response);
    } catch (error) {
      console.error(error);
      return NextResponse.json(error);
    }
  };

  switch (event) {
    case "PURCHASE_COMPLETE":
      const { purchase } = data;
      const { price } = purchase;
      const productID = data.product.id;
      const email = data.buyer.email;

      const newData = {
        productID,
        email,
        price,
      };

      updatedata(newData);
  }

  return NextResponse.json(data);
}
