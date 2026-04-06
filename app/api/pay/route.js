import pool from "@/lib/db";

export async function POST(request) {
    try {
        const body = await request.json();
        const { ticket_code } = body;

        if (!ticket_code) {
            return Response.json(
                { success: false, message: "ticket_code is required" },
                { status: 400 }
            );
        }

        // ambil tiket
        const result = await pool.query(
            `
      SELECT id, ticket_code, entry_time, exit_time, total_price
      FROM public.tickets
      WHERE ticket_code = $1
      LIMIT 1
      `,
            [ticket_code]
        );

        if (result.rowCount === 0) {
            return Response.json(
                { success: false, message: "Ticket not found" },
                { status: 404 }
            );
        }

        const ticket = result.rows[0];

        // hitung durasi (dalam jam, dibulatkan ke atas)
        const entry = new Date(ticket.entry_time);
        const now = new Date(); // waktu bayar
        const diffMs = now.getTime() - entry.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const hours = Math.max(1, Math.ceil(diffHours)); // minimal 1 jam

        // aturan tarif:
        // 1 jam pertama = 5000
        // selanjutnya = 3000/jam
        let totalPrice = 5000;
        if (hours > 1) {
            totalPrice += (hours - 1) * 3000;
        }

        // simpan exit_time & total_price ke database
        const updateResult = await pool.query(
            `
        UPDATE public.tickets
        SET exit_time = NOW(),
            total_price = $2
        WHERE id = $1
        RETURNING id, ticket_code, entry_time, exit_time, total_price
        `,
            [ticket.id, totalPrice]
        );
        const updated = updateResult.rows[0];

        return Response.json(
            {
                success: true,
                data: {
                    ticket_id: updated.id,
                    ticket_code: updated.ticket_code,
                    entry_time: updated.entry_time,
                    exit_time: updated.exit_time,
                    hours,
                    total_price: updated.total_price,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { success: false, message: "Failed to calculate price" },
            { status: 500 }
        );
    }
}