import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kinder Pets — Tinder-Style Pet Adoption Management System',
  description: 'DBMS DA2 Academic Project: Tinder-style pet adoption platform featuring 12 normalized entities, relational constraints, and PL/SQL business procedures.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col font-sans text-slate-800">
        {children}
      </body>
    </html>
  );
}
