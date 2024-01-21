import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { client_id, client_secret, basic } = await req.json();

  try {
    const { data } = await axios.post(
      "https://api-sec-vlc.hotmart.com/security/oauth/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: client_id,
        client_secret: client_secret,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basic}`, // Ensure basic contains the correct base64-encoded credentials
        },
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("error");

    return NextResponse.json(error);
  }
}
