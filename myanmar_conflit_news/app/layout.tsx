import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Myanmar Conflict Dashboard | ACLED Data Analysis",
  description:
    "Comprehensive analysis of conflict events in Myanmar based on ACLED (Armed Conflict Location & Event Data Project) data. Track events, fatalities, and regional impacts with real-time statistics and interactive visualizations.",
  keywords: [
    "Myanmar",
    "conflict",
    "ACLED",
    "data analysis",
    "violence",
    "protests",
    "fatalities",
    "regional analysis",
    "conflict monitoring",
    "Southeast Asia",
  ],
  authors: [{ name: "Myanmar Conflict Dashboard" }],
  openGraph: {
    title: "Myanmar Conflict Dashboard | ACLED Data Analysis",
    description:
      "Track and analyze conflict events in Myanmar with comprehensive ACLED data, statistics, and visualizations.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Myanmar Conflict Dashboard | ACLED Data Analysis",
    description:
      "Comprehensive analysis of conflict events in Myanmar based on ACLED data.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when ready
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
