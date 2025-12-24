import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFL Week 17 Dashboard",
  description: "Complete NFL Week 17 schedule with betting odds and weather conditions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
