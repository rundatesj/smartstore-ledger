import bcrypt from "bcrypt";

export async function GET() {
  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Response.json(
        {
          ok: false,
          message: "환경변수가 비어 있습니다.",
          env: {
            NAVER_CLIENT_ID: !!clientId,
            NAVER_CLIENT_SECRET: !!clientSecret,
          },
        },
        { status: 500 }
      );
    }

    const timestamp = Date.now().toString();
    const password = `${clientId}_${timestamp}`;

    // 네이버 커머스API 공식 방식: bcrypt 해싱 후 base64 인코딩
    const hashed = bcrypt.hashSync(password, clientSecret);
    const clientSecretSign = Buffer.from(hashed, "utf-8").toString("base64");

    const body = new URLSearchParams({
      client_id: clientId,
      timestamp,
      grant_type: "client_credentials",
      client_secret_sign: clientSecretSign,
      type: "SELF",
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
