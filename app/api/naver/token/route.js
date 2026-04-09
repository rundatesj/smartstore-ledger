import bcrypt from "bcrypt";

export async function GET() {
  try {
    const clientId = process.env.NAVER_CLIENT_ID?.trim();
    const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();
    const accountId = process.env.NAVER_ACCOUNT_ID?.trim();

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
    const password = `${clientId}_${timestamp}`;
    const hashed = bcrypt.hashSync(password, clientSecret);
    const clientSecretSign = Buffer.from(hashed, "utf-8").toString("base64");

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret_sign: clientSecretSign,
      grant_type: "client_credentials",
      type: "SELLER",
      account_id: accountId,
      timestamp,
    });

    const res = await fetch("https://api.commerce.naver.com/external/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return Response.json({
      ok: res.ok,
      status: res.status,
      requestCheck: {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasAccountId: !!accountId,
        secretStartsWithDollar2: clientSecret.startsWith("$2"),
        timestamp,
      },
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
