"use client";

// Sticky live preview reflecting unsaved branding changes; light/dark shared with the Theme section.

import type * as React from "react";
import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/brand-mark";
import { GlassChip } from "@/components/ui/glass-chip";
import { brandingToCssVars, type ResolvedTheme } from "@/lib/branding-css";
import { cn } from "@/lib/utils";
import type { InstanceBranding } from "@/lib/types";

export function BrandingPreview({
  branding,
  theme,
  onTheme,
}: {
  branding: InstanceBranding;
  theme: ResolvedTheme;
  onTheme: (t: ResolvedTheme) => void;
}) {
  const t = useTranslations("adminSettings.preview");

  const vars = brandingToCssVars(branding, theme) as React.CSSProperties;

  const heroTitle = branding.heroTitle?.trim() || t("heroFallback");
  const heroSubtitle = branding.heroSubtitle?.trim() || branding.tagline;
  const heroCta = branding.heroCta?.trim() || t("ctaFallback");

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          {t("title")}
        </span>
        <div
          role="group"
          aria-label={t("themeSwitch")}
          className="inline-flex rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-0.5"
        >
          {(["light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={theme === mode}
              onClick={() => onTheme(mode)}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1 text-[0.72rem] font-medium capitalize transition-colors duration-150",
                theme === mode
                  ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                  : "text-text-soft hover:text-text"
              )}
            >
              {t(mode)}
            </button>
          ))}
        </div>
      </div>

      {/* Preview canvas — data-theme picks the right glass surfaces; inline
          vars override the raw color/font tokens for descendants. */}
      <div
        data-theme={theme}
        style={vars}
        className="overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--glass-border)]"
      >
        <div
          className="p-5"
          style={{
            background: "var(--color-bg-base-raw)",
            color: "var(--color-text-raw)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BrandMark size={26} logo={branding.logo} accent={branding.accent} />
              <span
                className="text-[0.95rem] font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {branding.name || "Codestar"}
              </span>
            </span>
            <GlassChip size="sm" variant="default">
              {branding.locale?.toUpperCase() || "EN"}
            </GlassChip>
          </div>

          {/* Hero */}
          <div className="mt-5">
            <h3
              className="text-[1.35rem] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {heroTitle}
            </h3>
            <p
              className="mt-1.5 text-[0.85rem]"
              style={{ color: "var(--color-text-soft-raw)" }}
            >
              {heroSubtitle}
            </p>
            <button
              type="button"
              tabIndex={-1}
              className="mt-3 cursor-default rounded-full px-4 py-2 text-[0.8rem] font-semibold"
              style={{
                background: "var(--color-accent-raw)",
                color: "var(--color-accent-fg-raw, #1a1f2e)",
              }}
            >
              {heroCta}
            </button>
          </div>

          {/* Token swatches */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {(
              [
                ["accent", branding.accent],
                ["success", branding.theme[theme].success],
                ["warning", branding.theme[theme].warning],
                ["danger", branding.theme[theme].danger],
                ["tip", branding.theme[theme].tip],
              ] as const
            ).map(([key, color]) => (
              <span
                key={key}
                title={`${key} · ${color}`}
                className="h-6 w-6 rounded-md ring-1 ring-[color:var(--glass-border)]"
                style={{ background: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
