import type { Metadata } from "next";
import { Rubik, Nunito_Sans } from "next/font/google";
import "./globals.css";

// Rubik (headings) + Nunito Sans (body) — the "E-commerce Clean" pairing: a confident geometric
// display face for prices/headlines, paired with a warm, highly-readable text face for product
// descriptions. Chosen for this store type specifically, not a generic default.
const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"] });
const nunitoSans = Nunito_Sans({ variable: "--font-nunito-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Busiman Storefronts",
  description: "Online stores built with Busiman.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${rubik.variable} ${nunitoSans.variable} h-full antialiased`} lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
