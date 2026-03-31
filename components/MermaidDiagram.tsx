"use client";

import { useEffect, useState } from "react";
import mermaid from "mermaid";

type MermaidDiagramProps = {
  chart: string;
};

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
        });

        const id = `mermaid-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

        const result = await mermaid.render(id, chart);

        if (isMounted) {
          setSvg(result.svg);
        }
      } catch (error) {
        console.error("Mermaid render error:", error);
        if (isMounted) {
          setSvg("");
        }
      }
    };

    if (chart) {
      renderDiagram();
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-slate-800 bg-slate-950 p-6">
      {svg ? (
        <div className="min-w-max">
          <div
            className="[&>svg]:h-auto [&>svg]:max-w-none [&>svg]:min-w-[900px]"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      ) : (
        <p className="text-slate-400">Unable to render architecture diagram.</p>
      )}
    </div>
  );
}