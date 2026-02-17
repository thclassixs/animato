import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Animato - Watch Anime Online",
  description: "Stream your favorite anime. Netflix-style experience.",
  openGraph: {
    title: "Animato - Watch Anime Online",
    description: "Stream your favorite anime.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-netflix-black">
      <body className="antialiased min-h-screen">
        <Header />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
