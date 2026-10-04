import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Electrode microstructure analysis",
  description:
    "Combined BSE, Inlens and ETD/SE analysis: 13 physical descriptors, porosity uncertainty and batch assignments for nine test samples.",
  openGraph: {
    title: "Electrode microstructure analysis",
    description:
      "Electrode phase fractions, pore geometry, silicon-region measurements and reproducible batch comparisons.",
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
