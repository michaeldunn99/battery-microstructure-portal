import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;

const downloads = {
  "compare_physical_batches.py": {
    source: ["scripts", "compare_physical_batches.py"],
    contentType: "text/x-python; charset=utf-8",
  },
  "physical-rerun.json": {
    source: ["validation", "physical-rerun.json"],
    contentType: "application/json; charset=utf-8",
  },
  "physical-method.md": {
    source: ["PHYSICAL_METHOD.md"],
    contentType: "text/markdown; charset=utf-8",
  },
  "extract_physical_features.py": {
    source: ["scripts", "extract_physical_features.py"],
    contentType: "text/x-python; charset=utf-8",
  },
} as const;

export function generateStaticParams() {
  return Object.keys(downloads).map((file) => ({ file }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  if (!Object.prototype.hasOwnProperty.call(downloads, file)) {
    return new Response("File not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const download = downloads[file as keyof typeof downloads];
  const content = await readFile(path.join(process.cwd(), ...download.source), "utf8");

  return new Response(content, {
    headers: {
      "Content-Type": download.contentType,
      "Content-Disposition": `attachment; filename="${file}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
