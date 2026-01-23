import type { Metadata } from "next";
import { Playfair_Display, Inter, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/Shell";

// 1. Load Fonts
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter", 
  display: "swap",
});

const pinyon = Pinyon_Script({
  weight: "400",
  subsets: ["latin"], 
  variable: "--font-pinyon",
  display: "swap",
});

// 2. Metadata
export const metadata: Metadata = {
  title: "Lumaire Studio",
  description: "The wedding planning platform that feels calm, grounded, and emotional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* We pass the font variables to the body so they are available everywhere.
        We REMOVED the fixed flex/sidebar classes from here and moved them to <Shell>
        so they don't break the landing page.
      */}
      <body className={`${inter.variable} ${playfair.variable} ${pinyon.variable} antialiased`}>
        <Shell>
            {children}
        </Shell>
      </body>
    </html>
  );
}
