import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';  
import { ThemeProvider } from '@/app/providers/ThemeProvider';  
import { Toaster } from 'sonner';
import { LanguageSwitcher } from '@/features/change-language/ui/LanguageSwitcher';  
import { GlobalModalWrapper } from '@/shared/ui/modal/GlobalModalWrapper';
import '../globals.css';

export const metadata = {
  title: 'Democracy is Dead',
  description: 'Advanced Voting Platform',
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-gray-950 text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <QueryProvider>
              <AuthProvider>
                <LanguageSwitcher />
                <GlobalModalWrapper />
                
                {children}
                <Toaster position="top-center" theme="dark" />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}