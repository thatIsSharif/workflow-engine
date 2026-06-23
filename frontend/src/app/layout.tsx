import type { Metadata } from "next";
import { UserProvider } from "@/store/user-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workflow Engine",
  description: "Business workflow management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
