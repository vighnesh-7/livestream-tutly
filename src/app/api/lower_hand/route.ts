import { Controller, LowerHandParams, getSessionFromReq } from "@/lib/controller";

export async function POST(req: Request) {
  const controller = new Controller();

  try {
    const session = getSessionFromReq(req);
    const reqBody = await req.json();
    const result = await controller.lowerHand(session, reqBody as LowerHandParams);

    return Response.json({
      success: true,
      participant: result
    });
  } catch (err) {
    console.error("Error in lower_hand:", err);
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
} 