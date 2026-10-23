import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seu currículo | Me Emprega",
  description:
    "Conte sua trajetória. Crie e baixe seu currículo profissional em PDF com o Me Emprega.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
