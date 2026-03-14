import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rajthakor-rgb.github.io/SwipeUp-AI-Academy/"),
  title: "SwipeUp AI Academy - AI Learning for Business Students",
  description: "Simulation-based AI literacy programme for university business students. Master AI tools through real-world business cases.",
  keywords: ["AI", "Artificial Intelligence", "Business Students", "Education", "SwipeUp", "AI Literacy", "Learning"],
  authors: [{ name: "SwipeUp AI Society" }],
  icons: {
    icon: "/SwipeUp-AI-Academy/swipeup-logo.jpeg",
    apple: "/SwipeUp-AI-Academy/swipeup-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
