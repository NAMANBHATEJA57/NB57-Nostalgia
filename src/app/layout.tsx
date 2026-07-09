import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Fira_Sans, Fira_Code } from "next/font/google";
import { Toaster } from "sonner";
import { InterestedItemsProvider } from "@/components/context/InterestedItemsContext";
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

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-sans",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fira-code",
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
        className={`${inter.variable} ${cormorantGaramond.variable} ${firaSans.variable} ${firaCode.variable} font-sans antialiased`}
      >
        <InterestedItemsProvider>
          {children}
          <Toaster />
        </InterestedItemsProvider>
      </body>
    </html>
  );
}
