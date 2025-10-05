import { ensureDir, exists } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { resolve } from "https://deno.land/std@0.224.0/path/mod.ts";
import { Window } from "happy-dom";

const coverageHtmlPath = resolve("coverage", "index.html");
const badgeFile = resolve(".github", "coverage-badge.json");

if (!(await exists(coverageHtmlPath))) {
  console.error("Coverage HTML not found at coverage/index.html, run npm run test:coverage first");
  Deno.exit(1);
}

const html = await Deno.readTextFile(coverageHtmlPath);
const window = new Window();
const document = window.document;
document.body.innerHTML = html;

const statementDivs = Array.from(document.querySelectorAll(".fl.pad1y.space-right2"));
const statementDiv = statementDivs.find(div => {
  const quietElement = div.querySelector(".quiet");
  return quietElement?.textContent?.trim() === "Statements";
});

if (!statementDiv) {
  console.error("Could not find statements coverage in the HTML");
  Deno.exit(1);
}

const strongElement = statementDiv.querySelector(".strong");
if (!strongElement?.textContent) {
  console.error("Could not read coverage percentage");
  Deno.exit(1);
}

const coverageText = strongElement.textContent.trim();

if (!coverageText) {
  console.error("Coverage percentage text is empty");
  Deno.exit(1);
}

const badgeJson = {
  schemaVersion: 1,
  label: "coverage",
  message: coverageText,
  color: "blue"
};

await ensureDir(resolve(".github"));
await Deno.writeFile(badgeFile, new TextEncoder().encode(JSON.stringify(badgeJson, null, 2)));
console.log("Coverage badge created successfully!");