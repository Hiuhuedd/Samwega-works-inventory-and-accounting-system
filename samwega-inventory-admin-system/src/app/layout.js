// src/app/layout.js
import "./globals.css";
import GlobalAuthListener from "../components/GlobalAuthListener";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Samwega Works Ltd - Store Team",
  description: "Inventory Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <GlobalAuthListener />
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}