const rules = [
  {
    type: "structural",
    check: (line) => line.startsWith("##"),
    action: (line) => `<h2>${line.replace("##", "")}</h2>`,
  },
  {
    type: "structural",
    check: (line) => line.startsWith("#"),
    action: (line) => `<h1>${line.replace("#", "")}</h1>`,
  },
  {
    type: "structural",
    check: (line) => line.startsWith(">"),
    action: (line) => `<blockquote>${line.replace(">", "")}</blockquote>`,
  },
  {
    type: "structural",
    check: (line) => line.startsWith("*"),
    action: (line, lines, idx) => {
      let res = "";
      if (idx === 0 || !lines[idx - 1].startsWith("*")) {
        res += "<ul>";
      }
      res += `<li>${line.replace("*", "")}</li>`;
      if (idx === 0 || !lines[idx + 1].startsWith("*")) {
        res += "</ul>";
      }
      return res;
    },
  },
  // ordered list
  {
    type: "structural",
    check: (line) => line.match(/\d./g),
    action: (line, lines, idx) => {
      let res = "";
      if (lines[idx].match(/\d./)) {
        if (!lines[idx - 1].match(/\d./)) {
          res += "<ol>";
        }
        res += `<li>${line.replace(/\d./, "")}</li>`;
        if (!lines[idx + 1].match(/\d./)) {
          res += "</ol>";
        }
      }
      return res;
    },
  },
  // bold
  {
    type: "decorative",
    check: (line) => line.match(/(\*\*)(.*)(\*\*)/),
    action: (line) => {
      while (true) {
        const match = line.match(/(\*\*)(.*?)(\*\*)/);
        if (!match) break;
        start = line.substring(0, match.index);
        end = line.substring(match.index + match[0].length);
        line = `${start}<strong>${match[2]}</strong>${end}`;
      }
      return line;
    },
  },
  // italic
  {
    type: "decorative",
    check: (line) =>
      line.match(/((?<!\*)\*(?![*\s]))((?:[^*]*[^*\s])?)\*(?!\*)/),
    action: (line) => {
      while (true) {
        const match = line.match(
          /((?<!\*)\*(?![*\s]))((?:[^*]*[^*\s])?)\*(?!\*)/
        );
        if (!match) break;
        start = line.substring(0, match.index);
        end = line.substring(match.index + match[0].length);
        line = `${start}<i>${match[2]}</i>${end}`;
      }
      return line;
    },
  },
  // Strikethrough
  {
    type: "decorative",
    check: (line) => line.match(/(~~)(.*)(~~)/),
    action: (line) => {
      while (true) {
        const match = line.match(/(~~)(.*)(~~)/);
        if (!match) break;
        start = line.substring(0, match.index);
        end = line.substring(match.index + match[0].length);
        line = `${start}<s>${match[2]}</s>${end}`;
      }
      return line;
    },
  },
  // Link
  {
    type: "decorative",
    check: (line) => line.match(/(\[)(.*)(])(.*)(\()(.*)\)/),
    action: (line) => {
      while (true) {
        const match = line.match(/(\[)(.*)(])(.*)(\()(.*)\)/);
        if (!match) break;
        start = line.substring(0, match.index);
        end = line.substring(match.index + match[0].length);
        line = `${start}<a href=${match[6]}>${match[2]}</a>${end}`;
      }
      return line;
    },
  },
];

function parse(text) {
  const lines = this.getLines(text);
  const structureRules = rules.filter((r) => r.type === "structural");
  const decorativeRules = rules.filter((r) => r.type === "decorative");
  const result = [];
  for (let [i, line] of lines.entries()) {
    for (const drule of decorativeRules) {
      if (drule && drule.check(line)) {
        line = drule.action(line, lines, i);
      }
    }
    let foundRule = false;
    for (const rule of structureRules) {
      if (rule.check(line)) {
        result.push(rule.action(line, lines, i));
        foundRule = true;
        break;
      }
    }
    if (!foundRule) {
      result.push(line);
    }
  }
  return result.join("");
}

function getLines(text) {
  return text.split("\n");
}

text = `# Sample Markdown
This is some basic, sample markdown.

## Second Heading

Ordered lists:
1. One
1. Two
1. Three

Unordered lists:
* a
* b
* c
* d

> Blockquote

And **bold**, *italics*, and even *italics and later **bold***. Even ~~strikethrough~~. [A link](https://markdowntohtml.com) to somewhere.
`;

const ele = document.getElementById("parser");
ele.innerHTML = parse(text);
