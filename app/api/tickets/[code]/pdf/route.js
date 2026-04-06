import pool from "@/lib/db";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(request, { params }) {
    try {
        const { code } = await params;

        const result = await pool.query(
            `
      SELECT id, ticket_code, entry_time
      FROM public.tickets
      WHERE ticket_code = $a1
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

        const ticket = result.rows[0];

        const qrPayload = JSON.stringify({
            id: ticket.id,
            ticket_code: ticket.ticket_code,
        });
        const qrPngBuffer = await QRCode.toBuffer(qrPayload, { type: "png", width: 220 });

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([400, 600]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const qrImage = await pdfDoc.embedPng(qrPngBuffer);

        page.drawText("Parking Ticket", {
            x: 130,
            y: 560,
            size: 22,
            font: boldFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Ticket Code: ${ticket.ticket_code}`, {
            x: 40,
            y: 510,
            size: 12,
            font,
        });

        page.drawText(`Entry Time: ${new Date(ticket.entry_time).toLocaleString("id-ID")}`, {
            x: 40,
            y: 485,
            size: 12,
            font,
        });

        page.drawImage(qrImage, {
            x: 90,
            y: 220,
            width: 220,
            height: 220,
        });

        page.drawText("Tunjukkan tiket ini saat pembayaran/keluar", {
            x: 55,
            y: 190,
            size: 11,
            font,
        });

        const pdfBytes = await pdfDoc.save();

        return new Response(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="ticket-${ticket.ticket_code}.pdf"`,
            },
        });
    } catch (error) {
        return Response.json(
            { success: false, message: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}