import * as vscode from "vscode";
import { getNamespace } from "../utils/namespace";
import { loadTemplate, applyTemplate } from "../utils/templateEngine";
import { createFile } from "../utils/file";

export async function generateClass(uri: vscode.Uri) {
  const name = await vscode.window.showInputBox({ prompt: "Class name" });
  if (!name) return;

  const namespace = getNamespace(uri.fsPath);
  const template = loadTemplate("class.tpl");

  const content = applyTemplate(template, {
    namespace,
    name,
  });

  await createFile(uri.fsPath, `${name}.cs`, content);
}
