import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "NB57's Nostalgia",
  description: "India's Digital Archive of Vintage Collectibles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorantGaramond.variable} font-sans antialiased bg-[#FAFAF8] text-slate-900`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
