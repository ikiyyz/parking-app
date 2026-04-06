import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Web Parking System</h1>
        <p className="text-sm text-gray-600 mb-6">
          Klik tombol untuk generate tiket masuk parkir.
        </p>

        <button
          onClick={handleMasukParkir}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk Parkir"}
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {ticket && (
          <div className="mt-6 border-t pt-4">
            <p className="text-sm">
              <b>Ticket Code:</b> {ticket.ticket_code}
            </p>
            <p className="text-sm">
              <b>Entry Time:</b>{" "}
              {new Date(ticket.entry_time).toLocaleString("id-ID")}
            </p>

            {ticket.qr_data_url && (
              <img
                src={ticket.qr_data_url}
                alt="QR Ticket"
                className="mt-4 w-44 h-44"
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
