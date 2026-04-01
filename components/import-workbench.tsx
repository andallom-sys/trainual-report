"use client";

import { useState, useTransition } from "react";

type PreviewResponse = {
  preview: Array<Record<string, unknown>>;
  summary: {
    completions?: number;
    mappings?: number;
  };
};

export function ImportWorkbench() {
  const [trainualText, setTrainualText] = useState("");
  const [mappingText, setMappingText] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>, target: "trainual" | "mapping") {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    if (target === "trainual") {
      setTrainualText(text);
    } else {
      setMappingText(text);
    }
  }

  function previewImport() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/imports/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainualText, mappingText })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Unable to preview import.");
        return;
      }
      setPreview(data);
    });
  }

  function commitImport() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/imports/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainualText, mappingText })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Unable to complete import.");
        return;
      }
      setMessage("Import completed successfully.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <UploadCard
          title="Trainual completion file"
          description="Upload the Users Report export with completion percentages and reporting lines."
          onChange={(event) => handleFile(event, "trainual")}
          loaded={Boolean(trainualText)}
        />
        <UploadCard
          title="Manager mapping file"
          description="Upload the Active Employees per Manager export from the HR system."
          onChange={(event) => handleFile(event, "mapping")}
          loaded={Boolean(mappingText)}
        />
      </div>

      <div className="rounded-[24px] border border-nao-line bg-white p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">Import flow</p>
        <h3 className="mt-1 text-2xl font-semibold text-nao-ink">Preview and commit the upload</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          The preview parses both files, matches employees by ID when available, and falls back to email or employee name when needed.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending || !trainualText || !mappingText}
            onClick={previewImport}
            className="rounded-full bg-nao-teal px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? "Working..." : "Preview import"}
          </button>
          <button
            type="button"
            disabled={isPending || !preview}
            onClick={commitImport}
            className="rounded-full border border-nao-line px-5 py-3 text-sm font-semibold text-nao-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Commit import
          </button>
        </div>

        {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
      </div>

      {preview ? (
        <div className="rounded-[24px] border border-nao-line bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">Preview summary</p>
              <h3 className="mt-1 text-2xl font-semibold text-nao-ink">Matched data before import</h3>
            </div>
            <div className="rounded-2xl bg-nao-soft px-4 py-3 text-sm font-medium text-nao-ink">
              Completion rows: {preview.summary.completions ?? 0}
            </div>
            <div className="rounded-2xl bg-nao-soft px-4 py-3 text-sm font-medium text-nao-ink">
              Mapping rows: {preview.summary.mappings ?? 0}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {Object.keys(preview.preview[0] ?? {}).map((key) => (
                    <th key={key} className="border-b border-nao-line px-4 py-3">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, valueIndex) => (
                      <td key={valueIndex} className="border-b border-nao-line px-4 py-3 text-slate-700">
                        {String(value ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UploadCard({
  title,
  description,
  onChange,
  loaded
}: {
  title: string;
  description: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loaded: boolean;
}) {
  return (
    <label className="block rounded-[24px] border border-dashed border-nao-line bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">{title}</p>
      <h3 className="mt-1 text-2xl font-semibold text-nao-ink">{loaded ? "File loaded" : "Select a CSV file"}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <input className="mt-5 block w-full text-sm text-slate-600" type="file" accept=".csv" onChange={onChange} />
    </label>
  );
}
