import * as vscode from "vscode";
import * as fs from "fs";
import { getNamespace } from "../utils/namespace";
import { loadTemplate, applyTemplate } from "../utils/templateEngine";
import { createFile } from "../utils/file";

export async function generateController(uri?: vscode.Uri) {
  let folderPath: string | undefined;

  if (uri && fs.statSync(uri.fsPath).isDirectory()) {
    folderPath = uri.fsPath;
  } else {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
      vscode.window.showErrorMessage("No workspace folder found.");
      return;
    }
    folderPath = workspace.uri.fsPath;
  }

  const name = await vscode.window.showInputBox({
    prompt: 'Controller name (without "Controller")',
  });

  if (!name) return;

  const namespace = getNamespace(folderPath);
  const template = loadTemplate("controller.tpl");

  const content = applyTemplate(template, {
    namespace,
    name,
  });

  await createFile(folderPath, `${name}Controller.cs`, content);
}
