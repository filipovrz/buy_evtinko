/**
 * Export README / TODO / CHECKPOINT / CHAT_HISTORY to Word 2003 XML (.doc)
 * Compatible with Microsoft Office 2003+.
 *
 * Usage: node scripts/export-office-docs.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "office2003");

const FILES = [
  "README.md",
  "TODO.md",
  "CHECKPOINT.md",
  "CHAT_HISTORY.md",
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mdToWord2003(md, title) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const paragraphs = lines
    .map((line) => {
      const text = escapeXml(line || " ");
      const bold = line.startsWith("#");
      return `<w:p><w:r>${bold ? "<w:rPr><w:b/></w:rPr>" : ""}<w:t>${text || " "}</w:t></w:r></w:p>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument
 xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"
 xmlns:wx="http://schemas.microsoft.com/office/word/2003/auxHint"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xml:space="preserve">
  <o:DocumentProperties>
    <o:Title>${escapeXml(title)}</o:Title>
    <o:Author>Auctions Evtinko Ltd.</o:Author>
    <o:Company>Auctions Evtinko Ltd.</o:Company>
  </o:DocumentProperties>
  <w:body>
    <wx:sect>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>
      <w:p><w:r><w:t>buy-software.evtinko-bg.com — exported ${new Date().toISOString()}</w:t></w:r></w:p>
      ${paragraphs}
    </wx:sect>
  </w:body>
</w:wordDocument>
`;
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

for (const file of FILES) {
  const src = path.join(ROOT, file);
  if (!fs.existsSync(src)) {
    console.warn("Skip missing", file);
    continue;
  }
  const md = fs.readFileSync(src, "utf8");
  const base = path.basename(file, path.extname(file));
  const dest = path.join(OUT, `${base}.doc`);
  fs.writeFileSync(dest, mdToWord2003(md, base), "utf8");
  console.log("Wrote", dest);
}

console.log("Done. Open docs/office2003/*.doc in Office 2003+.");
