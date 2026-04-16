import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { investorId, investorName, documentType } = data;

    // Simulate secure dispatch latency
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // In a production environment, this would integrate with Resend, Sendgrid, or SMTP.
    // For the GIC demo, we simulate a successful transmission to the authenticated session user.
    console.log(`[EMAIL DISPATCH] Sent ${documentType} for ${investorName} (${investorId}) to authenticated user.`);

    return NextResponse.json({
      success: true,
      message: `Dossier securely dispatched to your registered email address.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[EMAIL DISPATCH ERRROR]", error);
    return NextResponse.json(
      { error: "Failed to dispatch email. Internal infrastructure error." },
      { status: 500 }
    );
  }
}
