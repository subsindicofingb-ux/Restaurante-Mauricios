import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Outfit } from "next/font/google";
import { Shell } from "@/components/shell";
import { StaffProvider } from "@/lib/staff";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const sans = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Mauricio's · Petiscaria e Restaurante",
  description: "Cardápio, pedido, cozinha e gestão da casa.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${sans.variable} ${serif.variable} font-sans text-ink antialiased`}>
        <StoreProvider>
          <StaffProvider>
            <Shell>{children}</Shell>
          </StaffProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
