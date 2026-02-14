import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getNamespace } from "../utils/namespace";
import { loadTemplate, applyTemplate } from "../utils/templateEngine";
import { createFile } from "../utils/file";

export async function generateService(uri: vscode.Uri) {
  const name = await vscode.window.showInputBox({
    prompt: 'Service name (without "Service")',
  });

  if (!name) return;

  const folderPath = uri.fsPath;
  const namespace = getNamespace(folderPath);

  const interfaceName = `I${name}Service`;
  const className = `${name}Service`;

  const interfaceTemplate = loadTemplate("serviceInterface.tpl");
  const classTemplate = loadTemplate("service.tpl");

  const values = {
    namespace,
    name,
    interfaceName,
    className,
  };

  await createFile(
    folderPath,
    `${interfaceName}.cs`,
    applyTemplate(interfaceTemplate, values),
  );

  await createFile(
    folderPath,
    `${className}.cs`,
    applyTemplate(classTemplate, values),
  );

  await registerService(interfaceName, className, namespace);
}

async function registerService(
  interfaceName: string,
  className: string,
  serviceNamespace: string,
) {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) return;

  const programPath = findFileRecursive(workspace.uri.fsPath, "Program.cs");
  if (!programPath) return;

  const document = await vscode.workspace.openTextDocument(programPath);
  const editor = await vscode.window.showTextDocument(document);

  let text = document.getText();

  const registrationLine = `builder.Services.AddScoped<${interfaceName}, ${className}>();`;

  // Prevent duplicate registration
  if (text.includes(registrationLine)) {
    vscode.window.showInformationMessage("Service already registered.");
    return;
  }

  const usingLine = `using ${serviceNamespace};`;

  // Insert using if missing
  if (!text.includes(usingLine)) {
    const firstNonUsingIndex = findFirstNonUsingLine(text);

    await editor.edit((editBuilder) => {
      editBuilder.insert(
        document.positionAt(firstNonUsingIndex),
        `${usingLine}\n`,
      );
    });

    // IMPORTANT: refresh document after edit
    text = document.getText();
  }

  // Find last builder.Services call in updated text
  const servicesMatches = [...text.matchAll(/builder\.Services\.[^\n]+/g)];

  if (servicesMatches.length === 0) {
    vscode.window.showWarningMessage(
      "Could not find builder.Services in Program.cs",
    );
    return;
  }

  const lastMatch = servicesMatches[servicesMatches.length - 1];

  const insertIndex = lastMatch.index! + lastMatch[0].length;

  await editor.edit((editBuilder) => {
    editBuilder.insert(
      document.positionAt(insertIndex),
      `\n${registrationLine}`,
    );
  });

  await vscode.commands.executeCommand("editor.action.formatDocument");
}

function findFileRecursive(dir: string, fileName: string): string | null {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name === fileName) {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const result = findFileRecursive(fullPath, fileName);
      if (result) return result;
    }
  }

  return null;
}

function findFirstNonUsingLine(text: string): number {
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("using ") && lines[i].trim() !== "") {
      return text.indexOf(lines[i]);
    }
  }

  return 0;
}
