import pool from "@/lib/db";
import QRCode from "qrcode";

function generateTicketCode() {
    // format: TKT-20260406-AB12CD
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TKT-${y}${m}${d}-${rand}`;
}

export async function POST() {
    try {
        const ticketCode = generateTicketCode();

        const result = await pool.query(
            `
      INSERT INTO tickets (ticket_code, entry_time)
      VALUES ($1, NOW())
      RETURNING id, ticket_code, entry_time, exit_time, total_price
      `,
            [ticketCode]
        );

        const ticket = result.rows[0];

        // paylod qr minimal ticket code
        const qrPayload = JSON.stringify({
            ticketCode: ticket.ticket_code,
            entryTime: ticket.entry_time,
        });

        // hasil base64 data URL (langsung bisa dipakai <img src="...">)
        const qrDataUrl = await QRCode.toDataURL(qrPayload);

        return Response.json(
            {
                success: true,
                message: "Ticket created",
                data: {
                    ...ticket,
                    qr_data_url: qrDataUrl,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (error.code === "23505") {
            return Response.json(
                { success: false, message: "Ticket code collision, try again" },
                { status: 409 }
            );
        }

        return Response.json(
            { success: false, message: "Failed to create ticket" },
            { status: 500 }
        );
    }
}