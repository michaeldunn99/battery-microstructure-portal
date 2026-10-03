import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Battery Microstructure Characterization & QC Portal",
  description:
    "Physics-grounded 2D morphological profiling, 3D grain-boundary reconstruction, and TauFactor directional tortuosity analysis for battery electrode quality control.",
  openGraph: {
    title: "Battery Microstructure Characterization & QC Portal",
    description:
      "Interactive 3D orthoslice inspection, feature reduction guide, and candidate batch acceptance protocol.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
