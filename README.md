# Independent Contractor Invoicing

<div align="center">
  <img src="/public/demo.png" alt="Screenshot of the Invoicing App" width="600" />
</div>

<p align="center">
  A simple, lightweight invoicing tool created specifically for independent contractors and freelancers.
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#running-locally">Running Locally</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#contributing">Contributing</a> ·
  <a href="#license">License</a>
</p>

## Features

- **Simple Invoicing**: Create clean, professional invoices in seconds
- **Client Management**: Store and manage your client information
- **PDF Generation**: Download and share invoices as professional PDF documents
- **Payment Tracking**: Keep track of paid and unpaid invoices
- **Lightweight & Fast**: Minimal interface with no unnecessary features
- **Free Forever**: No subscriptions, no hidden fees, completely free
- **Privacy Focused**: Your data stays on your device and with Supabase

## Getting Started

Visit [invoicing-app-url.com](https://invoicing-app-url.com) to use the application without any installation.

1. Create an account or sign in
2. Enter your contractor details
3. Add your clients
4. Create and customize your invoices
5. Download as PDF and send to clients

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **PDF Generation**: React PDF
- **Icons**: Lucide React
- **Styling**: Tailwind CSS v4

## Running Locally

### Prerequisites

- Node.js (v18 or newer)
- pnpm
- A Supabase account and project

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/CaptainCrouton89/invoicing.git
   cd invoicing
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy the environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application can be easily deployed to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CaptainCrouton89/invoicing)

Make sure to add your Supabase environment variables in the Vercel dashboard.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Created By

Built with ❤️ by [Silas Rhyneer](https://linkedin.com/in/silas-rhyneer) at [Rhyneer Consulting](https://rhyneerconsulting.com). This project is my contribution to making business life a little easier for independent contractors and freelancers.

---

© 2023-present · Open-source and free forever
