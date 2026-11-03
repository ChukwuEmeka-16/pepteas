import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.scss";
import AuthProvider from "./_components/AuthListener";

export const metadata: Metadata = {
  title: "PEPTEAS.NG | Research Peptides",
  description:
    "Premium research peptides with third-party testing and transparent certificates of analysis.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
