import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Campus Survival | Your UNT starting point',
  description:
    'Find campus resources, save useful places, and settle into student life in Denton. A Group 7 student project.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
