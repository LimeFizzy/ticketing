import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'TicketFlow',
  description: 'Buy and manage event tickets in Lithuania',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html
    lang="en"
    className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
  >
    <body className="min-h-dvh">
      {/* Fixed gradient backdrop — always in the viewport compositing layer
          so backdrop-filter on cards blurs it correctly from any scroll container */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 80% 60% at 10% 70%, oklch(0.72 0.14 260 / 0.45) 0%, transparent 60%)',
            'radial-gradient(ellipse 70% 50% at 90% 10%, oklch(0.76 0.12 210 / 0.40) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 50% at 60% 90%, oklch(0.70 0.13 290 / 0.35) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 40% at 40% 30%, oklch(0.80 0.08 240 / 0.25) 0%, transparent 50%)',
          ].join(', '),
        }}
      />
      <Toaster position="top-center" richColors closeButton />
      <AuthProvider>{children}</AuthProvider>
    </body>
  </html>
);

export default RootLayout;
