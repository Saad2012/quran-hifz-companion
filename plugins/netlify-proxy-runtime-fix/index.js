import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceServerDir = path.resolve(".next", "server");
const targetServerDir = path.resolve(
  ".netlify",
  "edge-functions",
  "___netlify-edge-handler-node-middleware",
  "server",
  ".next",
  "server",
);

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function patchGeneratedEntry(entryPath, serverDir) {
  if (!(await pathExists(entryPath))) {
    return;
  }

  const entrySource = await readFile(entryPath, "utf8");
  const absoluteServerDir = serverDir.replace(/\\/g, "/");
  const patchedSource = entrySource.replaceAll(
    'require("./',
    `require("${absoluteServerDir}/`,
  );

  if (patchedSource !== entrySource) {
    await writeFile(entryPath, patchedSource, "utf8");
  }
}

export async function onBuild() {
  const runtimePath = path.join(sourceServerDir, "webpack-runtime.js");
  const chunksPath = path.join(sourceServerDir, "chunks");

  if (!(await pathExists(runtimePath))) {
    console.log("[netlify-proxy-runtime-fix] Skipping: webpack runtime not found.");
    return;
  }

  await mkdir(targetServerDir, { recursive: true });
  await cp(runtimePath, path.join(targetServerDir, "webpack-runtime.js"));

  if (await pathExists(chunksPath)) {
    await cp(chunksPath, path.join(targetServerDir, "chunks"), {
      recursive: true,
      force: true,
    });
  }

  await patchGeneratedEntry(path.join(targetServerDir, "middleware.js"), targetServerDir);
  await patchGeneratedEntry(path.join(targetServerDir, "proxy.js"), targetServerDir);

  console.log("[netlify-proxy-runtime-fix] Copied proxy runtime support files.");
}
