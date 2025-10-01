import type {Metadata} from 'next';
import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const fontSans = FontSans({ 
  subsets: ['latin'], 
  variable: "--font-sans" 
});


export const metadata: Metadata = {
  title: 'GDGoC VTU Portal',
  description: 'Event portal for GDG of Creation VTU 2025-26',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <FirebaseErrorListener />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
