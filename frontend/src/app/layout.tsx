import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Trao AI - Premium AI Travel Planner',
  description: 'Design and custom-tailor your dream itinerary in seconds with our smart weather-aware AI coordinator.',
  openGraph: {
    title: 'Trao AI Travel Planner',
    description: 'Design and custom-tailor your dream itinerary in seconds with our smart weather-aware AI coordinator.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.variable} font-sans bg-slate-950 text-slate-100 antialiased h-full flex flex-col`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
