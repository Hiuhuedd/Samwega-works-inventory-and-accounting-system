// src/app/layout.js
import "./globals.css";
import GlobalAuthListener from "../components/GlobalAuthListener";

export const metadata = {
  title: "Samwega Works Ltd - Store Team",
  description: "Inventory Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <GlobalAuthListener />
        <div className="relative min-h-screen bg-white">{children}</div>
      </body>
    </html>
  );
}