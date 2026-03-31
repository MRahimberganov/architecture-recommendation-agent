"use client";

import { useState } from "react";
import MermaidDiagram from "@/components/MermaidDiagram";

type AnalyzeResult = {
  source?: string;
  summary: string;
  pattern: string;
  services: string[];
  reasoning: string;
  nextSteps: string[];
  costEstimate: string;
  tradeoffs: string[]; 
  diagram: string;
  terraform: {
    providerTf: string;
    variablesTf: string;
    mainTf: string;
    outputsTf: string;
  };
};

export default function Home() {
  const [projectName, setProjectName] = useState("");
  const [industry, setIndustry] = useState("Healthcare");
  const [diagramMode, setDiagramMode] = useState("detailed");
  const [compliance, setCompliance] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleDownloadTerraform = async () => {
    if (!result?.terraform) return;

    try {
      const res = await fetch("/api/download-terraform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          terraform: result.terraform,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate Terraform zip.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "terraform-starter.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Terraform download failed:", error);
      setError("Failed to download Terraform starter.");
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          industry,
          compliance,
          description,
          diagramMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong while analyzing.");
        return;
      }

      if (
        !data ||
        typeof data.summary !== "string" ||
        typeof data.pattern !== "string" ||
        !Array.isArray(data.services) ||
        typeof data.costEstimate !== "string" ||
        typeof data.reasoning !== "string" ||
        !Array.isArray(data.nextSteps) ||
        typeof data.diagram !== "string" ||
        !Array.isArray(data.tradeoffs) ||
        typeof data.terraform !== "object" ||
        typeof data.terraform?.providerTf !== "string" ||
        typeof data.terraform?.variablesTf !== "string" ||
        typeof data.terraform?.mainTf !== "string" ||
        typeof data.terraform?.outputsTf !== "string"
      ) {
        setError("The AI returned an unexpected response format.");
        console.error("Unexpected API response:", data);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Analyze failed:", err);
      setError("Failed to connect to the analysis service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <div className="mb-10">
          <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
            Fortellar Internal Prototype
          </p>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            Architecture Recommendation Agent
          </h1>

          <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
            An internal AI assistant that gathers solution requirements,
            evaluates cloud architecture patterns, and recommends secure,
            scalable designs with implementation guidance.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-semibold">Project Requirements</h2>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="Example: HIPAA-ready customer portal"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option>Healthcare</option>
                  <option>Finance</option>
                  <option>Retail</option>
                  <option>Technology</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Compliance Requirements
                </label>
                <input
                  type="text"
                  placeholder="HIPAA, SOC 2, PCI-DSS"
                  value={compliance}
                  onChange={(e) => setCompliance(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Diagram Mode
                </label>
                <select
                  value={diagramMode}
                  onChange={(e) => setDiagramMode(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option value="simple">Simple</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Describe the workload
                </label>
                <textarea
                  rows={6}
                  placeholder="Describe the system, expected users, integrations, uptime needs, data sensitivity, and anything else important..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Architecture"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-semibold">Recommended Architecture</h2>

            {loading && (
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-6 text-slate-300">
                Analyzing architecture...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
                {error}
              </div>
            )}

            {!loading && !error && !result && (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400">
                Submit the project requirements on the left to generate an
                architecture recommendation.
              </div>
            )}

            {!loading && !error && result && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    {result?.source && (
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-xs text-slate-500">Source:</span>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            result.source === "ai"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {result.source === "ai"
                            ? "AI Generated"
                            : "Demo Mode – AI unavailable"}
                        </span>
                      </div>
                    )}
                  <p className="mb-2 text-sm uppercase tracking-wide text-cyan-300">
                    Summary
                  </p>
                  <p className="text-slate-300">{result.summary}</p>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                  <p className="text-sm text-purple-300">Architecture Type</p>
                  <p className="text-lg font-bold text-purple-400">
                    {result.pattern}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="mb-2 text-sm uppercase tracking-wide text-cyan-300">
                    Suggested Services
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.services.length > 0 ? (
                      result.services.map((service, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-sm text-cyan-300"
                        >
                          {service}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-300">No services returned.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="mb-2 text-sm uppercase tracking-wide text-cyan-300">
                    Why This Fits
                  </p>
                  <p className="text-slate-300">{result.reasoning}</p>
                </div>
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-sm text-green-300">Estimated Monthly Cost</p>
                  <p className="text-xl font-bold text-green-400">
                    {result.costEstimate || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="mb-2 text-sm uppercase tracking-wide text-amber-300">
                    Tradeoffs / Considerations
                  </p>
                  {result.tradeoffs.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-5 text-slate-300">
                      {result.tradeoffs.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-300">No tradeoffs returned.</p>
                  )}
                </div>
                {result?.terraform && (
                  <button
                    type="button"
                    onClick={handleDownloadTerraform}
                    className="w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    Download Terraform Starter
                  </button>
                )}

                {result?.terraform && (
                <>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="mb-3 text-sm uppercase tracking-wide text-cyan-300">
                      Terraform Starter
                    </p>

                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-200">provider.tf</p>
                        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
                          <code>{result.terraform.providerTf}</code>
                        </pre>
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-200">variables.tf</p>
                        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
                          <code>{result.terraform.variablesTf}</code>
                        </pre>
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-200">main.tf</p>
                        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
                          <code>{result.terraform.mainTf}</code>
                        </pre>
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-200">outputs.tf</p>
                        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
                          <code>{result.terraform.outputsTf}</code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="mb-2 text-sm uppercase tracking-wide text-cyan-300">
                      Next Steps
                    </p>
                    {result.nextSteps.length > 0 ? (
                      <ul className="list-disc space-y-1 pl-5 text-slate-300">
                        {result.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-300">No next steps returned.</p>
                    )}
                  </div>

                  {result.diagram && (
                    <div className="mt-6">
                      <h3 className="text-cyan-400 text-sm font-semibold mb-2">
                        INTERACTIVE ARCHITECTURE DIAGRAM (scroll to explore)
                      </h3>
                      <MermaidDiagram chart={result.diagram} />
                    </div>
                  )}
                </>
              )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
