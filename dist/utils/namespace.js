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
exports.getNamespace = getNamespace;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getNamespace(folderPath) {
    const projectRoot = findNearestCsproj(folderPath);
    if (!projectRoot) {
        console.warn("No .csproj found upward from:", folderPath);
        return "";
    }
    const csprojPath = findCsprojInDirectory(projectRoot);
    const rootNamespace = getRootNamespace(csprojPath);
    const relative = path.relative(projectRoot, folderPath);
    const folderNamespace = relative
        .split(path.sep)
        .filter((p) => p !== "" && p !== "src")
        .join(".");
    if (!folderNamespace)
        return rootNamespace;
    return `${rootNamespace}.${folderNamespace}`;
}
function findNearestCsproj(startDir) {
    let current = startDir;
    while (true) {
        const entries = fs.readdirSync(current);
        const csproj = entries.find((f) => f.endsWith(".csproj"));
        if (csproj)
            return current;
        const parent = path.dirname(current);
        if (parent === current)
            break; // reached filesystem root
        current = parent;
    }
    return null;
}
function findCsprojInDirectory(dir) {
    const files = fs.readdirSync(dir);
    const csproj = files.find((f) => f.endsWith(".csproj"));
    if (!csproj)
        throw new Error("No .csproj found in project root");
    return path.join(dir, csproj);
}
function getRootNamespace(csprojPath) {
    const content = fs.readFileSync(csprojPath, "utf-8");
    const match = content.match(/<RootNamespace>(.*?)<\/RootNamespace>/);
    if (match)
        return match[1];
    return path.basename(csprojPath, ".csproj");
}
