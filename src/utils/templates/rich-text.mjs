import sanitizeHtml from "sanitize-html";

const blocks = {
  paragraph: "p", bulletList: "ul", orderedList: "ol", listItem: "li",
  taskList: "ul", taskItem: "li", blockquote: "blockquote", codeBlock: "pre",
  table: "table", tableRow: "tr", tableCell: "td", tableHeader: "th",
};
const marks = { bold: "strong", italic: "em", strike: "s", underline: "u", code: "code", highlight: "mark" };

export function renderTemplateDescription(document) {
  return sanitizeHtml(renderNode(document), {
    allowedTags: [...Object.values(blocks), ...Object.values(marks), "h3", "h4", "a", "br", "hr"],
    allowedAttributes: { a: ["href"], ol: ["start"], td: ["colspan", "rowspan"], th: ["colspan", "rowspan"] },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
  });
}

function renderNode(node, depth = 0) {
  if (!node || depth > 30) return "";
  if (node.type === "text") return renderText(node);
  if (node.type === "hardBreak") return "<br>";
  if (node.type === "horizontalRule") return "<hr>";
  const children = (node.content ?? []).map((child) => renderNode(child, depth + 1)).join("");
  const tag = node.type === "heading" ? (Number(node.attrs?.level) > 2 ? "h4" : "h3") : blocks[node.type];
  if (!tag) return children;
  const attributes = ["start", "colspan", "rowspan"].filter((key) => Number.isInteger(node.attrs?.[key]))
    .map((key) => ` ${key}="${node.attrs[key]}"`).join("");
  const checked = node.type === "taskItem" ? (node.attrs?.checked ? "☑ " : "☐ ") : "";
  return `<${tag}${attributes}>${checked}${children}</${tag}>`;
}

function renderText(node) {
  return (node.marks ?? []).reduce((text, mark) => {
    if (mark.type === "link") return `<a href="${escape(mark.attrs?.href ?? "")}">${text}</a>`;
    const tag = marks[mark.type];
    return tag ? `<${tag}>${text}</${tag}>` : text;
  }, escape(node.text ?? ""));
}

function escape(text) {
  return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
