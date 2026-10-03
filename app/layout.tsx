import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Electrode microstructure analysis",
  description:
    "SEM measurements, batch comparisons and physical interpretation for electrode material analysis.",
  openGraph: {
    title: "Electrode microstructure analysis",
    description:
      "Physical descriptors, measurement methods and sampling uncertainty.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-canvas font-sans antialiased text-zinc-950 flex flex-col">
        {children}
      </body>
    </html>
  );
}
