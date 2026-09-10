import type { Metadata } from 'next';
import { Manrope, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const serif = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['opsz'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KinderPets — Verified Animal Sanctuary & Adoption Records',
  description: 'Connecting verified animal shelters with adopters through transparent relational records.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F3F1EA] text-[#14181A] selection:bg-[#3E6259] selection:text-white">
        {children}
      </body>
    </html>
  );
}

