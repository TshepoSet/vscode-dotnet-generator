import * as vscode from "vscode";
import { generateClass } from "./generators/classGenerator";
import { generateInterface } from "./generators/interfaceGenerator";
import { generateService } from "./generators/serviceGenerator";
import { generateController } from "./generators/controllerGenerator";
import { generateConstructor } from "./generators/constructorGenerator";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("dotnetgen.createClass", generateClass),
    vscode.commands.registerCommand(
      "dotnetgen.createInterface",
      generateInterface,
    ),
    vscode.commands.registerCommand("dotnetgen.createService", generateService),
    vscode.commands.registerCommand(
      "dotnetgen.createController",
      generateController,
    ),
    vscode.commands.registerCommand(
      "dotnetgen.generateConstructor",
      generateConstructor,
    ),
  );
}
