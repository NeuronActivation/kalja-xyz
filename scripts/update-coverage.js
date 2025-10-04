import fs from "fs";
import path from "path";
import { Window } from "happy-dom";

const coverageHtmlPath = path.resolve("coverage", "index.html");
const badgeFile = path.resolve(".github", "coverage-badge.json");

if (!fs.existsSync(coverageHtmlPath)) {
  console.error("Coverage HTML not found at coverage/index.html, run npm run test:coverage first");
  process.exit(1);
}

const html = fs.readFileSync(coverageHtmlPath, "utf-8");
const window = new Window();
const document = window.document;
document.body.innerHTML = html;

const statementDivs = Array.from(document.querySelectorAll(".fl.pad1y.space-right2"));
const statementDiv = statementDivs.find(div => div.querySelector(".quiet")?.textContent.trim() === "Statements");

if (!statementDiv) {
  console.error("Could not find statements coverage in the HTML");
  process.exit(1);
}

const coverageText = statementDiv.querySelector(".strong")?.textContent.trim();

if (!coverageText) {
  console.error("Could not read coverage percentage");
  process.exit(1);
}

const badgeJson = {
  schemaVersion: 1,
  label: "coverage",
  message: coverageText,
  color: "blue"
};

fs.writeFileSync(badgeFile, JSON.stringify(badgeJson, null, 2));
console.log("Coverage badge JSON saved to", badgeFile);