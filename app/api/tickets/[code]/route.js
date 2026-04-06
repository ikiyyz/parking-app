import pool from "@/lib/db";

export async function GET(request, { params }) {
    try {
        const { code } = await params;

        const result = await pool.query(
            `
      SELECT id, ticket_code, entry_time, exit_time, total_price
      FROM public.tickets
      WHERE ticket_code = $1
      LIMIT 1
      `,
            [code]
        );

        if (result.rowCount === 0) {
            return Response.json(
                { success: false, message: "Ticket not found" },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, data: result.rows[0] },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { success: false, message: "Failed to get ticket" },
            { status: 500 }
        );
    }
}