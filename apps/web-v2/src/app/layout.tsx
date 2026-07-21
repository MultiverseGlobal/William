import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "William — Personal AI Companion",
  description: "Experience your intelligent, context-aware AI assistant with modern design.",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}


