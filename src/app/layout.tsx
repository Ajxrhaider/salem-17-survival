import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Salem-17-Survival | Survive Salem", template: "%s | Salem-17-Survival" },
  description: "You are dropped into 1690s Salem with a modern drone. Convince the magistrate in 5 turns without using modern jargon — or be declared a witch.",
  keywords: ["Salem","Survival Game","AI Game","Next.js","Gemini","Hizaki Labs"],
  authors: [{ name: "John Hizaki", url: "https://hizakilabs.com" }],
  creator: "Hizaki Labs",
  publisher: "Hizaki Labs",
  metadataBase: new URL("https://salem-17-survival.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: { title: "Salem-17-Survival", description: "Survive Salem. Explain a drone to a 1693 magistrate without sounding like a witch. You have 5 turns.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-800 font-inter selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}