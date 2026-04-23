import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const count = await prisma.materials.count();

    return Response.json({ ok: true, count });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 500 }
    );
  }
}
