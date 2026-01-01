import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Toaster } from "sonner"; // แจ้งเตือนสวยๆ

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thanakorn POS",
  description: "POS & Stock Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <MobileLayout>
            {children}
            <Toaster position="top-center" richColors />
          </MobileLayout>
        </QueryProvider>
      </body>
    </html>
  );
}