import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { UserProvider } from "./contexts/UserContext";

const robotoHeading = Roboto({ subsets: ['latin'], variable: '--font-heading' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

export const metadata: Metadata = {
  // ─── Core ───────────────────────────────────────────────
  title: {
    default: "ExaminerMax - Online Exam Platform",
    template: "%s | ExaminerMax",
  },
  description:
    "ExaminerMax is a powerful SaaS-based online examination platform. Create, manage & conduct secure exams with real-time results, auto evaluation, and anti-cheating features — built for companies, institutes & recruiters.",

  keywords: [
    "online exam platform",
    "exam software",
    "conduct exams online",
    "secure exam system",
    "exam SaaS India",
    "student assessment platform",
    "online test system",
    "proctored exam software",
    "auto evaluation system",
    "anti-cheating exam tool",
    "recruitment exam platform",
    "ExaminerMax",
    "sqrock",
  ],

  // ─── Identity ────────────────────────────────────────────
  applicationName: "ExaminerMax",
  authors: [{ name: "ExaminerMax Team", url: "https://sqrock.cloud" }],
  creator: "ExaminerMax",
  publisher: "Sqrock",
  generator: "Next.js",
  category: "Technology",
  classification: "Online Examination Software",

  // ─── Canonical & Alternates ──────────────────────────────
  metadataBase: new URL("https://www.examinermax.sqrock.cloud"),
  alternates: {
    canonical: "https://www.examinermax.sqrock.cloud",
  },

  // ─── Indexing ────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ─── Icons ───────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },

  // ─── Open Graph ──────────────────────────────────────────
  openGraph: {
    title: "ExaminerMax - Conduct Exams Effortlessly",
    description:
      "Create, manage and evaluate exams with ExaminerMax. Secure, scalable and built for companies, institutes & recruiters. Auto-grading, anti-cheating & real-time analytics.",
    url: "https://www.examinermax.sqrock.cloud",
    siteName: "ExaminerMax",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExaminerMax - Online Exam Platform",
        type: "image/png",
      },
    ],
  },

  // ─── Twitter / X ─────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "ExaminerMax - Online Exam Platform",
    description:
      "A modern SaaS platform to conduct secure online exams with auto evaluation and anti-cheating. Built for companies & institutes.",
    images: [
      {
        url: "/og-image.png",
        alt: "ExaminerMax Platform Preview",
      },
    ],
    creator: "@examinermax", // update if you have a handle
    site: "@examinermax",
  },

  // ─── Site Verification ───────────────────────────────────
  verification: {
    google: "YOUR_GOOGLE_SITE_VERIFICATION_CODE", // Search Console se milega
    // yandex: "YOUR_YANDEX_CODE",
    // bing: "YOUR_BING_CODE",
  },

  // ─── Extra Meta ──────────────────────────────────────────
  other: {
    "msapplication-TileColor": "#0f0f0f",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster/>
        <NextTopLoader color="red"/>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
