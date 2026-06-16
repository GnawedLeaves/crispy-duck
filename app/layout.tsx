import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar/navbar";

import { Josefin_Sans } from "next/font/google";
import { token } from "./theme";
import { Providers } from "./providers";
import PWARegister from "./utils/pwa/pwa";
const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-josefin",
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Crispy Duck",
  description: "An app for you to store your body composition",
  manifest: "/manifest.json",
};

const cssVariables = {
  "--bg-color": token.light.background,
  "--text-color": token.light.textColor,
  "--border-color": token.light.borderColor,
  "--primary-color": token.light.primaryColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${josefinSans.variable}  h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={cssVariables as React.CSSProperties}
      >
        <Providers>
          <PWARegister />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
