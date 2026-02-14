import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export async function createFile(
  folderPath: string,
  fileName: string,
  content: string,
) {
  const filePath = path.join(folderPath, fileName);

  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(filePath),
    Buffer.from(content, "utf8"),
  );

  const doc = await vscode.workspace.openTextDocument(filePath);
  const editor = await vscode.window.showTextDocument(doc);

  // Format the document
  await vscode.commands.executeCommand("editor.action.formatDocument");

  await doc.save();
}
