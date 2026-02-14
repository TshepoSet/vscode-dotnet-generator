import * as vscode from "vscode";
import { getNamespace } from "../utils/namespace";
import { loadTemplate, applyTemplate } from "../utils/templateEngine";
import { createFile } from "../utils/file";

export async function generateInterface(uri: vscode.Uri) {
  const name = await vscode.window.showInputBox({
    prompt: "Interface name (without I)",
  });
  if (!name) return;

  const interfaceName = `I${name}`;

  const namespace = getNamespace(uri.fsPath);
  const template = loadTemplate("interface.tpl");

  const content = applyTemplate(template, {
    namespace,
    name: interfaceName,
  });

  await createFile(uri.fsPath, `${interfaceName}.cs`, content);
}
