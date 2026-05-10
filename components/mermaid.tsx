"use client";

import { useEffect, useId, useState } from "react";

type MermaidProps = {
  chart: string;
};

type MermaidTheme = "default" | "dark";

const mermaidThemeVariables = {
  default: {
    background: "transparent",
    primaryColor: "#fafafa",
    primaryTextColor: "#171717",
    primaryBorderColor: "#d4d4d4",
    secondaryColor: "#f5f5f5",
    secondaryTextColor: "#171717",
    secondaryBorderColor: "#d4d4d4",
    tertiaryColor: "#ffffff",
    tertiaryTextColor: "#171717",
    tertiaryBorderColor: "#e5e5e5",
    mainBkg: "#fafafa",
    secondBkg: "#f5f5f5",
    nodeBorder: "#d4d4d4",
    clusterBkg: "#f5f5f5",
    clusterBorder: "#d4d4d4",
    edgeLabelBackground: "#ffffff",
    lineColor: "#737373",
    textColor: "#171717",
    titleColor: "#171717",
    labelTextColor: "#171717",
    actorBkg: "#fafafa",
    actorBorder: "#d4d4d4",
    actorTextColor: "#171717",
    actorLineColor: "#d4d4d4",
    signalColor: "#737373",
    signalTextColor: "#171717",
    activationBkgColor: "#f5f5f5",
    activationBorderColor: "#404040",
    noteBkgColor: "#f5f5f5",
    noteBorderColor: "#d4d4d4",
    noteTextColor: "#171717",
  },
  dark: {
    background: "transparent",
    primaryColor: "#171717",
    primaryTextColor: "#fafafa",
    primaryBorderColor: "#404040",
    secondaryColor: "#262626",
    secondaryTextColor: "#fafafa",
    secondaryBorderColor: "#404040",
    tertiaryColor: "#0a0a0a",
    tertiaryTextColor: "#fafafa",
    tertiaryBorderColor: "#262626",
    mainBkg: "#171717",
    secondBkg: "#262626",
    nodeBorder: "#404040",
    clusterBkg: "#171717",
    clusterBorder: "#404040",
    edgeLabelBackground: "#0a0a0a",
    lineColor: "#a3a3a3",
    textColor: "#fafafa",
    titleColor: "#fafafa",
    labelTextColor: "#fafafa",
    actorBkg: "#171717",
    actorBorder: "#404040",
    actorTextColor: "#fafafa",
    actorLineColor: "#404040",
    signalColor: "#a3a3a3",
    signalTextColor: "#fafafa",
    activationBkgColor: "#262626",
    activationBorderColor: "#e5e5e5",
    noteBkgColor: "#262626",
    noteBorderColor: "#525252",
    noteTextColor: "#fafafa",
  },
} satisfies Record<MermaidTheme, Record<string, string>>;

const mermaidThemeCSS = `
  .node rect,
  .node polygon,
  .node circle,
  .node ellipse,
  .cluster rect,
  .actor {
    rx: 6px;
    ry: 6px;
  }

  .node rect,
  .node polygon,
  .node circle,
  .node ellipse,
  .cluster rect,
  .actor {
    filter: drop-shadow(0 1px 2px color-mix(in oklab, var(--color-fd-foreground) 10%, transparent));
  }

  .edgeLabel,
  .labelBkg {
    border-radius: 6px;
  }
`;

function getMermaidTheme(): MermaidTheme {
  if (typeof document === "undefined") return "default";
  return document.documentElement.classList.contains("dark") ? "dark" : "default";
}

export function Mermaid({ chart }: MermaidProps) {
  const id = useId().replaceAll(":", "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState(getMermaidTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getMermaidTheme());
    });

    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      try {
        setError(null);
        setSvg(null);

        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          flowchart: {
            curve: "basis",
            nodeSpacing: 48,
            padding: 16,
            rankSpacing: 56,
          },
          fontFamily: "inherit",
          securityLevel: "strict",
          sequence: {
            actorMargin: 48,
            boxMargin: 12,
            messageMargin: 36,
          },
          startOnLoad: false,
          theme: "base",
          themeCSS: mermaidThemeCSS,
          themeVariables: mermaidThemeVariables[theme],
        });

        const result = await mermaid.render(`mermaid-${id}`, chart);
        if (!cancelled) setSvg(result.svg);
      } catch (reason) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Mermaid render failed");
        }
      }
    }

    void renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, id, theme]);

  if (error) {
    return (
      <div className="not-prose my-6 rounded-md border border-fd-border/80 bg-fd-card p-4 text-sm">
        <p className="font-medium text-fd-foreground">Mermaid 图表渲染失败</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-fd-muted-foreground">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-md border border-fd-border/80 bg-fd-card/70 p-4">
      {svg ? (
        <div
          aria-label="Mermaid diagram"
          className="min-w-max [&_svg]:mx-auto [&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svg }}
          role="img"
        />
      ) : (
        <div className="text-sm text-fd-muted-foreground">正在渲染 Mermaid 图表...</div>
      )}
    </div>
  );
}
