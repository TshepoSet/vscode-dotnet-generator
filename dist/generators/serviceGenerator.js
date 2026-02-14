"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateService = generateService;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const namespace_1 = require("../utils/namespace");
const templateEngine_1 = require("../utils/templateEngine");
const file_1 = require("../utils/file");
async function generateService(uri) {
    const name = await vscode.window.showInputBox({
        prompt: 'Service name (without "Service")',
    });
    if (!name)
        return;
    const folderPath = uri.fsPath;
    const namespace = (0, namespace_1.getNamespace)(folderPath);
    const interfaceName = `I${name}Service`;
    const className = `${name}Service`;
    const interfaceTemplate = (0, templateEngine_1.loadTemplate)("serviceInterface.tpl");
    const classTemplate = (0, templateEngine_1.loadTemplate)("service.tpl");
    const values = {
        namespace,
        name,
        interfaceName,
        className,
    };
    await (0, file_1.createFile)(folderPath, `${interfaceName}.cs`, (0, templateEngine_1.applyTemplate)(interfaceTemplate, values));
    await (0, file_1.createFile)(folderPath, `${className}.cs`, (0, templateEngine_1.applyTemplate)(classTemplate, values));
    await registerService(interfaceName, className, namespace);
}
async function registerService(interfaceName, className, serviceNamespace) {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace)
        return;
    const programPath = findFileRecursive(workspace.uri.fsPath, "Program.cs");
    if (!programPath)
        return;
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
            editBuilder.insert(document.positionAt(firstNonUsingIndex), `${usingLine}\n`);
        });
        // IMPORTANT: refresh document after edit
        text = document.getText();
    }
    // Find last builder.Services call in updated text
    const servicesMatches = [...text.matchAll(/builder\.Services\.[^\n]+/g)];
    if (servicesMatches.length === 0) {
        vscode.window.showWarningMessage("Could not find builder.Services in Program.cs");
        return;
    }
    const lastMatch = servicesMatches[servicesMatches.length - 1];
    const insertIndex = lastMatch.index + lastMatch[0].length;
    await editor.edit((editBuilder) => {
        editBuilder.insert(document.positionAt(insertIndex), `\n${registrationLine}`);
    });
    await vscode.commands.executeCommand("editor.action.formatDocument");
}
function findFileRecursive(dir, fileName) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isFile() && entry.name === fileName) {
            return fullPath;
        }
        if (entry.isDirectory()) {
            const result = findFileRecursive(fullPath, fileName);
            if (result)
                return result;
        }
    }
    return null;
}
function findFirstNonUsingLine(text) {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].startsWith("using ") && lines[i].trim() !== "") {
            return text.indexOf(lines[i]);
        }
    }
    return 0;
}
