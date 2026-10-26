// Builds public/Mridula-Rao-Resume.pdf from src/content/profile.md with headless Chrome,
// using the same A4 layout as Mridula's tailored resumes. Run: npm run resume
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const md = fs.readFileSync(path.join(root, "src/content/profile.md"), "utf8");
const out = path.join(root, "public/Mridula-Rao-Resume.pdf");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// Pre-PM role, left off Senior PM resumes.
const SKIP_ROLES = ["Sr. Associate"];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Splits "## Heading" sections into { heading: body }.
const sections = Object.fromEntries(
  md.split(/^## /m).slice(1).map((block) => {
    const [heading, ...rest] = block.split("\n");
    return [heading.trim(), rest.join("\n").trim()];
  }),
);
const bullets = (text) => text.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));

const jobs = sections.Experience.split(/^### /m).slice(1).map((block) => {
  const lines = block.split("\n");
  const [role, company] = lines[0].split(" — ");
  return { role: role.trim(), company: company.trim(), dates: lines[1].trim(), bullets: bullets(block) };
}).filter((j) => !SKIP_ROLES.some((r) => j.role.startsWith(r)));

const skills = bullets(sections.Skills).map((l) => {
  const i = l.indexOf(":");
  return [l.slice(0, i), l.slice(i + 1).trim()];
});

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Mridula Rao — Resume</title><style>
@page { size: A4; margin: 12mm 15mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; color: #111; line-height: 1.35; }
.header { border-bottom: 1.5pt solid #111; padding-bottom: 5pt; margin-bottom: 8pt; }
.header h1 { font-size: 17pt; font-weight: 700; letter-spacing: 0.3pt; line-height: 1.2; }
.contact-row { display: flex; flex-wrap: wrap; margin-top: 3pt; font-size: 8pt; color: #444; }
.contact-row span + span::before { content: " · "; color: #999; padding: 0 3pt; }
.section { margin-bottom: 7pt; }
.section-title { font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4pt; color: #111; border-bottom: 0.75pt solid #bbb; padding-bottom: 2pt; margin-bottom: 5pt; }
.summary { font-size: 9pt; line-height: 1.45; color: #222; }
.job { margin-bottom: 7pt; page-break-inside: avoid; }
.job-header { width: 100%; border-collapse: collapse; margin-bottom: 2pt; }
.job-header td { padding: 0; vertical-align: baseline; }
.job-header td.left { font-size: 9.5pt; font-weight: 700; }
.job-header td.right { font-size: 8pt; color: #555; font-style: italic; text-align: right; white-space: nowrap; width: 1%; padding-left: 8pt; padding-right: 3pt; }
ul { padding-left: 13pt; margin-top: 2pt; }
ul li { font-size: 9pt; line-height: 1.4; margin-bottom: 1.5pt; color: #222; }
.skills-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
.skills-table tr { vertical-align: top; }
.skills-table td { padding: 1pt 0; }
.skills-table td.sk-label { font-weight: 700; white-space: nowrap; width: 100pt; padding-right: 8pt; color: #111; }
.skills-table td.sk-val { color: #222; line-height: 1.35; }
.edu-entry { font-size: 9pt; line-height: 1.5; }
</style></head><body>
<div class="header">
  <h1>Mridula Rao</h1>
  <div class="contact-row"><span>Bengaluru, India · open to relocation</span><span>aludrim@gmail.com</span><span>linkedin.com/in/mridularao5</span></div>
</div>
<div class="section"><div class="section-title">Summary</div><p class="summary">${esc(sections.Summary)}</p></div>
<div class="section"><div class="section-title">Experience</div>
${jobs.map((j) => `<div class="job"><table class="job-header"><tr><td class="left">${esc(j.role)} &mdash; ${esc(j.company)}</td><td class="right">${esc(j.dates)}</td></tr></table>
<ul>${j.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>`).join("\n")}
</div>
<div class="section"><div class="section-title">Skills</div><table class="skills-table">
${skills.map(([k, v]) => `<tr><td class="sk-label">${esc(k)}</td><td class="sk-val">${esc(v)}</td></tr>`).join("")}
</table></div>
<div class="section"><div class="section-title">Education &amp; Certifications</div>
${bullets(sections.Education).map((e) => `<div class="edu-entry">${esc(e)}</div>`).join("")}
<div class="edu-entry">${bullets(sections.Certifications).map(esc).join(" &nbsp;&middot;&nbsp; ")}</div>
</div>
</body></html>`;

const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "resume-")), "resume.html");
fs.writeFileSync(tmp, html);
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${out}`, `file://${tmp}`], { stdio: "ignore" });
console.log(`Wrote ${path.relative(root, out)}`);
