import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/language-provider";
import { ConfirmProvider } from "@/components/providers/confirm-provider";
import { Toaster } from 'sonner';
import LanguageSwitcher from "@/components/ui/language-switcher"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Votazione Collaborativa",
  description: "App per decisioni di gruppo",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white overflow-x-hidden`}>
        <LanguageProvider>
          <ConfirmProvider>
             
             {}
             <LanguageSwitcher />
             
             {children}
             
             <Toaster 
                position="top-center" 
                theme="dark" 
                richColors 
                closeButton
                toastOptions={{
                    style: { background: '#111827', border: '1px solid #374151', borderRadius: '12px' },
                }}
             />
          </ConfirmProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}