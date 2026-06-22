import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Outfit,
} from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { getMe } from "@/app/actions/auth";
import { getInstanceBranding } from "@/app/actions/instance";
import { AuthProvider } from "@/components/auth-provider";
import { BrandingProvider } from "@/components/branding-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { MeshBackground } from "@/components/ui/mesh-background";
import { brandingThemeCss } from "@/lib/branding-css";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_THEME, isTheme, resolveTheme, THEME_COOKIE } from "@/lib/theme";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getInstanceBranding();
  const title = branding.metaTitle ?? `${branding.name} — ${branding.tagline}`;
  const description = branding.metaDescription ?? branding.tagline;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s · ${branding.name}`,
    },
    description,
    applicationName: branding.name,
    keywords: [
      "open-source e-learning",
      "self-hosted LMS",
      "GPL v3 learning platform",
      "Moodle alternative",
      "educational data sovereignty",
      "Docker LMS",
      "block course editor",
      "learner leaderboard",
      branding.name,
    ],
    authors: [
      { name: "Codestar Project", url: "https://github.com/CodeStar-Project" },
    ],
    creator: "Codestar Project",
    publisher: "Codestar Project",
    category: "education",
    alternates: { canonical: SITE_URL },
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: branding.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: { icon: branding.favicon ?? "/favicon.ico" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1422" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Codestar",
  url: SITE_URL,
  description: "Open-source self-hosted e-learning platform under GPL v3.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Linux, macOS, Windows (WSL2)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  license: "https://www.gnu.org/licenses/gpl-3.0.html",
  codeRepository: "https://github.com/CodeStar-Project",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [locale, messages, branding, me, cookieStore] = await Promise.all([
    getLocale(),
    getMessages(),
    getInstanceBranding(),
    getMe(),
    cookies(),
  ]);

  const themeCookie = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME;
  const resolvedTheme = resolveTheme(theme);

  return (
    <html
      lang={locale}
      data-theme={resolvedTheme}
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${outfit.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text font-sans">
        {/* Branding tokens (accent, theme colors, fonts) override globals.css
            for both light/dark. React hoists this <style> to <head>; the
            html[data-theme] selectors win by specificity regardless of order. */}
        <style
          id="branding-theme"
          dangerouslySetInnerHTML={{ __html: brandingThemeCss(branding) }}
        />
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MeshBackground />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider initialTheme={theme} initialResolved={resolvedTheme}>
            <BrandingProvider branding={branding}>
              <AuthProvider initialUser={me}>{children}</AuthProvider>
            </BrandingProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
