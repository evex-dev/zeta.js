import ts from "typescript";

type Edit = {
  fileName: string;
  pos: number;
  text: string;
};

const packageRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const configPath = ts.findConfigFile(packageRoot, ts.sys.fileExists, "tsconfig.json");
if (!configPath) {
  throw new Error("Could not find tsconfig.json");
}

const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) {
  throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
}

const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, packageRoot);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const edits: Edit[] = [];

const formatFlags =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  ts.TypeFormatFlags.AddUndefined |
  ts.TypeFormatFlags.WriteTypeArgumentsOfSignature;

for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.fileName.startsWith(packageRoot) || sourceFile.fileName.includes("/node_modules/")) {
    continue;
  }

  visitTopLevel(sourceFile);
}

for (const [fileName, fileEdits] of groupByFile(edits)) {
  const file = Bun.file(fileName);
  let text = await file.text();

  for (const edit of fileEdits.sort((a, b) => b.pos - a.pos)) {
    text = `${text.slice(0, edit.pos)}${edit.text}${text.slice(edit.pos)}`;
  }

  await Bun.write(fileName, text);
}

console.log(`Inserted ${edits.length} explicit public API type annotation(s).`);

function visitTopLevel(sourceFile: ts.SourceFile): void {
  for (const statement of sourceFile.statements) {
    if (ts.isClassDeclaration(statement) && isExported(statement)) {
      annotateClass(sourceFile, statement);
    } else if (ts.isFunctionDeclaration(statement) && isExported(statement)) {
      annotateFunctionLike(sourceFile, statement);
      annotateDefaultedParameters(sourceFile, statement.parameters);
    }
  }
}

function annotateClass(sourceFile: ts.SourceFile, declaration: ts.ClassDeclaration): void {
  for (const member of declaration.members) {
    if (hasModifier(member, ts.SyntaxKind.PrivateKeyword) || hasModifier(member, ts.SyntaxKind.ProtectedKeyword)) {
      continue;
    }

    if (
      ts.isMethodDeclaration(member) ||
      ts.isGetAccessorDeclaration(member) ||
      ts.isSetAccessorDeclaration(member)
    ) {
      annotateFunctionLike(sourceFile, member);
      annotateDefaultedParameters(sourceFile, member.parameters);
    } else if (ts.isPropertyDeclaration(member)) {
      annotateProperty(sourceFile, member);
    } else if (ts.isConstructorDeclaration(member)) {
      annotateDefaultedParameters(sourceFile, member.parameters);
    }
  }
}

function annotateFunctionLike(
  sourceFile: ts.SourceFile,
  declaration: ts.FunctionDeclaration | ts.MethodDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration,
): void {
  if (declaration.type || !declaration.body || ts.isSetAccessorDeclaration(declaration)) {
    return;
  }

  const signature = checker.getSignatureFromDeclaration(declaration);
  if (!signature) {
    return;
  }

  const returnType = checker.typeToString(signature.getReturnType(), declaration, formatFlags);
  const insertPos = findReturnTypeInsertPosition(sourceFile, declaration);
  edits.push({ fileName: sourceFile.fileName, pos: insertPos, text: `: ${returnType}` });
}

function annotateProperty(sourceFile: ts.SourceFile, declaration: ts.PropertyDeclaration): void {
  if (declaration.type || !declaration.name) {
    return;
  }

  const propertyType = checker.typeToString(checker.getTypeAtLocation(declaration.name), declaration, formatFlags);
  const insertPos = declaration.name.getEnd(sourceFile);
  edits.push({ fileName: sourceFile.fileName, pos: insertPos, text: `: ${propertyType}` });
}

function annotateDefaultedParameters(sourceFile: ts.SourceFile, parameters: ts.NodeArray<ts.ParameterDeclaration>): void {
  for (const parameter of parameters) {
    if (parameter.type || !parameter.initializer || !ts.isIdentifier(parameter.name)) {
      continue;
    }

    const parameterType = checker.typeToString(checker.getTypeAtLocation(parameter.name), parameter, formatFlags);
    edits.push({ fileName: sourceFile.fileName, pos: parameter.name.getEnd(sourceFile), text: `: ${parameterType}` });
  }
}

function findReturnTypeInsertPosition(
  sourceFile: ts.SourceFile,
  declaration: ts.FunctionDeclaration | ts.MethodDeclaration | ts.GetAccessorDeclaration,
): number {
  const body = declaration.body;
  if (!body) {
    throw new Error("Expected declaration body.");
  }

  let pos = body.getFullStart();
  const text = sourceFile.text;
  while (pos > 0 && /\s/.test(text[pos - 1] ?? "")) {
    pos -= 1;
  }
  return pos;
}

function isExported(node: ts.Node): boolean {
  return hasModifier(node, ts.SyntaxKind.ExportKeyword);
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && Boolean(ts.getModifiers(node)?.some((modifier) => modifier.kind === kind));
}

function groupByFile(items: Edit[]): Map<string, Edit[]> {
  const grouped = new Map<string, Edit[]>();
  for (const item of items) {
    const group = grouped.get(item.fileName);
    if (group) {
      group.push(item);
    } else {
      grouped.set(item.fileName, [item]);
    }
  }
  return grouped;
}
