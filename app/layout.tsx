import type { Metadata, Viewport } from "next"; // Aggiungi Viewport
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/language-provider";
import { ConfirmProvider } from "@/components/providers/confirm-provider"; // <--- IMPORT
import { Toaster } from 'sonner'; // <--- IMPORT

const inter = Inter({ subsets: ["latin"] });

// ... metadata code ...

// Aggiungi export viewport per gestire lo zoom su mobile
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
          <ConfirmProvider> {/* <--- WRAPPER */}
             {children}
             
             {/* TOASTER GLOBALE CONFIGURATO */}
             <Toaster 
                position="top-center" 
                theme="dark" 
                richColors 
                closeButton
                toastOptions={{
                    style: { background: '#111827', border: '1px solid #374151', borderRadius: '12px' },
                    className: 'my-toast-class',
                }}
             />
          </ConfirmProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}