import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const description =
  "Senior Product Manager, 15+ years. Chat with an AI that knows my career, or check my fit for your role.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ask-mridula.vercel.app"),
  title: "Mridula Rao · Ask My Resume",
  description,
  openGraph: { title: "Mridula Rao · Senior Product Manager", description, type: "profile" },
  twitter: { card: "summary_large_image", title: "Mridula Rao · Senior Product Manager", description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${bricolage.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
