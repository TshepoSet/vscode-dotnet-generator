import * as fs from "fs";
import * as path from "path";

export function loadTemplate(templateName: string): string {
  const templatePath = path.join(__dirname, "../../templates", templateName);
  return fs.readFileSync(templatePath, "utf-8");
}

export function applyTemplate(
  template: string,
  values: Record<string, string>,
): string {
  let result = template;

  for (const key in values) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, values[key]);
  }

  return result;
}
