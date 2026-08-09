import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileNav, SideNav } from "@/components/Nav";
import { Disclaimer } from "@/components/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Invest Copilote — Analyser · Comprendre · Investir",
    template: "%s · Invest Copilote",
  },
  description:
    "Le copilote des débutants en investissement : comprendre les marchés, mesurer ses risques, décider sereinement. Outil d'information — pas un conseil en investissement.",
};

export const viewport: Viewport = {
  themeColor: "#060b18",
};

// Applique le thème mémorisé AVANT le premier rendu (pas de flash). Sombre par défaut.
const themeInit = `try{var t=localStorage.getItem("theme");document.documentElement.classList.toggle("dark",t?t==="dark":true)}catch(e){document.documentElement.classList.add("dark")}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <SideNav />
        <MobileNav />
        <div className="md:pl-60">
          <main className="mx-auto w-full max-w-5xl px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-12">
            {children}
            <footer className="mt-12 border-t border-line pt-4">
              <Disclaimer />
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
