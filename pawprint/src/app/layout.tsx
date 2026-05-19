import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "PawPrint — Know Your Pet Better",
  description: "AI-powered pet breed analysis. Upload a photo of your dog or cat and receive a complete breed profile powered by Claude Vision.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        {/* Set theme before React hydrates to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('pawprint-theme')||'dark';document.documentElement.className=t+' h-full';}catch(e){}` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
