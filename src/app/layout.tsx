import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-prompt",
});
export const metadata: Metadata = {
  title: "E-Budget Workspace",
  description:
    "Enterprise workspace for project planning, budgeting, documentation, and organizational workflows.",
  icons: {
    icon: "/icon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${prompt.className} antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
