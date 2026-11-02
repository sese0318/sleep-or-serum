import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sleep or Serum: check last night before you buy that eye cream",
  description:
    "See five YouCam skin observations beside self-reported sleep, then pause and reassess before a skincare purchase. A transparent cosmetic demo, not a diagnosis.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1430",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
