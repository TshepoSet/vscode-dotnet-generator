import * as vscode from "vscode";

export async function generateConstructor() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const text = document.getText();

  const classMatch = text.match(/class\s+(\w+)/);
  if (!classMatch) {
    vscode.window.showInformationMessage("No class found.");
    return;
  }

  const className = classMatch[1];

  // Prevent duplicate constructor
  const constructorRegex = new RegExp(`public\\s+${className}\\s*\\(`);
  if (constructorRegex.test(text)) {
    vscode.window.showInformationMessage("Constructor already exists.");
    return;
  }

  // Find private readonly fields
  const fieldRegex = /private readonly\s+([\w<>,\s]+)\s+_(\w+);/g;

  const fields: { type: string; name: string }[] = [];
  let match;

  while ((match = fieldRegex.exec(text)) !== null) {
    fields.push({
      type: match[1].trim(),
      name: match[2],
    });
  }

  if (fields.length === 0) {
    vscode.window.showInformationMessage("No private readonly fields found.");
    return;
  }

  // Build constructor parameters
  const parameters = fields.map((f) => `${f.type} ${f.name}`).join(", ");

  // Build assignments
  const assignments = fields
    .map((f) => `        _${f.name} = ${f.name};`)
    .join("\n");

  const constructor = `

    public ${className}(${parameters})
    {
${assignments}
    }
`;

  // Find class body opening brace
  const classIndex = text.indexOf(`class ${className}`);
  const openBraceIndex = text.indexOf("{", classIndex);

  if (openBraceIndex === -1) return;

  // Match braces to find class closing brace
  let braceCount = 0;
  let closeBraceIndex = -1;

  for (let i = openBraceIndex; i < text.length; i++) {
    if (text[i] === "{") braceCount++;
    if (text[i] === "}") braceCount--;

    if (braceCount === 0) {
      closeBraceIndex = i;
      break;
    }
  }

  if (closeBraceIndex === -1) return;

  // Insert after last field (cleaner layout)
  let lastFieldIndex = -1;
  const fieldMatchAll = [...text.matchAll(fieldRegex)];

  if (fieldMatchAll.length > 0) {
    const lastMatch = fieldMatchAll[fieldMatchAll.length - 1];
    lastFieldIndex = lastMatch.index! + lastMatch[0].length;
  }

  let insertPosition;

  if (lastFieldIndex !== -1) {
    insertPosition = document.positionAt(lastFieldIndex);
  } else {
    insertPosition = document.positionAt(closeBraceIndex);
  }

  await editor.edit((editBuilder) => {
    editBuilder.insert(insertPosition, constructor);
  });

  await vscode.commands.executeCommand("editor.action.formatDocument");
}
