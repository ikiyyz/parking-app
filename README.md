# Web Parking System

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&pause=1400&color=2563EB&center=true&vCenter=true&width=760&lines=Web+Parking+System+%F0%9F%9A%97;Ticket+%E2%86%92+Payment+%E2%86%92+Gate+Open+%F0%9F%85%BF%EF%B8%8F)](https://git.io/typing-svg)

A mini parking workflow project built with **Next.js** and **PostgreSQL**.
It covers ticket creation, QR/PDF ticket generation, payment simulation, and exit processing.

## Features

- Generate parking tickets with unique `ticket_code`
- Store `entry_time`, `exit_time`, and `total_price` in PostgreSQL
- Generate QR code from ticket data
- Download PDF ticket (Ticket Code, Entry Time, QR)
- `/pay` page for QR image upload and decode
- Pricing rules:
  - First hour: `5000`
  - Next hours: `3000/hour`
- Final status:
  - **Payment Successful**
  - **Gate Open**

## Demo Flow

`🚗 Entry` -> `🎟️ Ticket` -> `📱 QR/PDF` -> `💳 Payment` -> `🚪 Gate Open`

## Tech Stack

- Next.js (App Router)
- PostgreSQL
- `pg`, `qrcode`, `pdf-lib`, `jsqr`

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_db
```

3. Run development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

- `POST /api/tickets` -> create ticket + QR data
- `GET /api/tickets/[code]` -> get ticket details
- `GET /api/tickets/[code]/pdf` -> download ticket PDF
- `POST /api/pay` -> calculate fee + update `exit_time` and `total_price`

## Project Structure

```bash
app/
  page.tsx
  pay/page.tsx
  api/tickets/route.js
  api/tickets/[code]/route.js
  api/tickets/[code]/pdf/route.js
  api/pay/route.js
lib/db.js
```
