import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NAO Medical Trainual Dashboard",
  description: "Trainual completion dashboard for NAO Medical."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
