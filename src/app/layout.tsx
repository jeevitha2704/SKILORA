import './globals.css'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { AuthProvider } from '@/lib/auth'
import { Navbar } from '@/components/Navbar'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SKILORA - Master Your Skills",
  description: "AI-powered skill development platform that helps you master your skills and accelerate your career growth.",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: { url: '/logo.svg' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark">
        <div className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
