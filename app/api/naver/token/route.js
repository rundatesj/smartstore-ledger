import crypto from "crypto";

export async function GET() {
  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    const accountId = process.env.NAVER_ACCOUNT_ID;

    if (!clientId || !clientSecret || !accountId) {
      return Response.json(
        {
          ok: false,
          message: "환경변수가 비어 있습니다.",
          env: {
            NAVER_CLIENT_ID: !!clientId,
            NAVER_CLIENT_SECRET: !!clientSecret,
            NAVER_ACCOUNT_ID: !!accountId,
          },
        },
        { status: 500 }
      );
    }

    const timestamp = Date.now().toString();

    const clientSecretSign = crypto
      .createHmac("sha256", clientSecret)
      .update(`${clientId}_${timestamp}`)
      .digest("base64");

    const body = new URLSearchParams({
      client_id: clientId,
      timestamp,
      grant_type: "client_credentials",
      client_secret_sign: clientSecretSign,
      type: "SELLER",
      account_id: accountId,
    });

    const res = await fetch("https://api.commerce.naver.com/external/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    });

    const data = await res.json();

    return Response.json({
      ok: res.ok,
      status: res.status,
      data,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
