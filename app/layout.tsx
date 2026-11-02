import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sleep or Serum: check last night before you buy that eye cream",
  description:
    "Upload a selfie, enter last night's sleep, and get a transparent verdict: sleep first, or choose a product. Powered by the YouCam AI Skin Analysis API.",
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
