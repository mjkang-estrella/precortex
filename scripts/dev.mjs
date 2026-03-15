import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const rootDir = process.cwd();

const mimeTypes = new Map([
    [".css", "text/css; charset=utf-8"],
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".mjs", "text/javascript; charset=utf-8"],
    [".svg", "image/svg+xml"],
]);

const compiler = spawn("npx", ["tsc", "--project", "tsconfig.json", "--watch", "--preserveWatchOutput"], {
    cwd: rootDir,
    stdio: "inherit",
});

compiler.on("exit", (code) => {
    if (closing) return;
    console.error(`TypeScript watcher exited with code ${code ?? 0}`);
    process.exit(code ?? 1);
});

const server = http.createServer(async (request, response) => {
    const requestPath = new URL(request.url || "/", `http://${host}:${port}`).pathname;
    const normalizedPath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, "");
    let filePath = path.join(rootDir, normalizedPath);

    try {
        const fileStats = existsSync(filePath) ? await stat(filePath) : null;
        if (fileStats?.isDirectory()) {
            filePath = path.join(filePath, "index.html");
        }

        if (!existsSync(filePath)) {
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("Not found");
            return;
        }

        const ext = path.extname(filePath);
        response.writeHead(200, {
            "Content-Type": mimeTypes.get(ext) || "application/octet-stream",
            "Cache-Control": "no-store",
        });
        createReadStream(filePath).pipe(response);
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Internal server error");
        console.error(error);
    }
});

let closing = false;

function shutdown(exitCode = 0) {
    if (closing) return;
    closing = true;
    server.close(() => {
        compiler.kill("SIGINT");
        process.exit(exitCode);
    });
}

server.listen(port, host, () => {
    console.log(`Dev server running at http://${host}:${port}`);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
