import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/components/providers/language-provider";
// IMPORTA IL COMPONENTE
import LanguageSwitcher from "@/components/ui/language-switcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Democracy is Dead",
  description: "Social Choice Theory App",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1", // Importante per mobile
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}>
        <AuthProvider>
          <LanguageProvider>
            
            {/* ORA IL SELETTORE È QUI, FISSO PER TUTTE LE PAGINE */}
            <LanguageSwitcher />
            
            {children}
            <Toaster position="top-center" richColors />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}