import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PawPrint — Know Your Pet Better",
  description: "AI-powered pet breed analysis. Upload a photo of your dog or cat and receive a complete breed profile powered by Claude Vision.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
