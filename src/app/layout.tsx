import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: '--font-poppins',
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kasir",
  description: "made by nuaysa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
