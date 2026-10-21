import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-providers";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import Tracker from "@/components/shared/tracker";
import VgpuFluid from "@/components/three/vgpu-fluid";
import VgpuThemeWipe from "@/components/three/vgpu-theme-wipe";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Samuel Elias Paredes | Backend Developer",
  description: "Portfolio personal de Samuel Paredes",
  openGraph: {
    title: "Samuel Elias Paredes | Backend Developer",
    description: "Portfolio personal de Samuel Paredes",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Tracker />
            <VgpuFluid className="pointer-events-none fixed inset-0 z-40 h-full w-full" />
            <VgpuThemeWipe />
            {children}
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
