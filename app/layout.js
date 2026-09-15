import { Libre_Baskerville, DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-libre-baskerville',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
});

export const metadata = {
  title: 'Naposo HKBP Ujung Menteng',
  description: 'Kalender kegiatan, reversement, dan informasi Naposo HKBP Ujung Menteng',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${libreBaskerville.variable} ${dmSans.variable}`}>
        <LanguageProvider>
          <ThemeProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-60px-56px)]">{children}</main>
            <Footer />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
