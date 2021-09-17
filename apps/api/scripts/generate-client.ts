/* eslint-disable no-console */
import * as ts from 'typescript';
import fs from 'fs';
import Path from 'path';
import prettier from 'prettier';

function getChildren(node: ts.Node) {
  const nodes: ts.Node[] = [];
  ts.forEachChild(node, node => {
    nodes.push(node);
  });
  return nodes;
}

// function showTree(node: ts.Node, indent: string = '    '): void {
//   console.log(indent + ts.SyntaxKind[node.kind]);

//   const children = getChildren(node);

//   if (children.length === 0) {
//     console.log(indent + '    Text: ' + node.getText());
//   }

//   for (let child of children) {
//     showTree(child, indent + '    ');
//   }
// }

const importTypes = {} as { [x: string]: string };
const signatures = [] as string[];

function normalizeReturnType(returnType: string) {
  const reg = /import\(".*?shared\/src\/types"\)\.(\w+)/;
  let match = reg.exec(returnType);
  while (match) {
    importTypes[match[1]] = match[1];
    returnType = returnType.replace(reg, match[1]);
    match = reg.exec(returnType);
  }

  return returnType.replace(/Promise<(.*)>/, '$1');
}

function parseArgs(str: string) {
  let isParamName = true;
  let token = '';
  const names: string[] = [];
  const values: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (isParamName) {
      if (c === ':') {
        isParamName = false;
        names.push(token);
        token = '';
      } else {
        token += c;
      }
    } else {
      if (c === ',') {
        isParamName = true;
        values.push(token);
        token = '';
      } else {
        token += c;
      }
    }
  }
  values.push(token);
  return names.map((name, i) => {
    return {
      name: name.trim(),
      value: values[i].trim(),
    };
  });
}

function checkNode(node: ts.Node, checker: ts.TypeChecker) {
  if (node.kind !== ts.SyntaxKind.FirstStatement) {
    return;
  }
  // FirstStatement
  //    ExportKeyword
  //    VariableDeclarationList
  //      VariableDeclaration
  //        Identifier
  //        CallExpression
  //          Identifier
  //          ObjectLiteralExpression
  //            PropertyAssignment
  //              Identifier
  //              TrueKeyword
  //            PropertyAssignment
  //              Identifier
  //              StringLiteral
  //            PropertyAssignment
  //              Identifier
  //              Identifier

  const [exportKeywordNode, variableDeclarationList] = getChildren(node);
  if (
    !exportKeywordNode ||
    exportKeywordNode.kind !== ts.SyntaxKind.ExportKeyword ||
    !variableDeclarationList ||
    variableDeclarationList.kind !== ts.SyntaxKind.VariableDeclarationList
  ) {
    return;
  }
  const [variableDeclaration] = getChildren(variableDeclarationList);
  const declaration = ts.getNameOfDeclaration(
    variableDeclaration as ts.Declaration
  );
  const exportName =
    (declaration as ts.Identifier).escapedText?.toString() || '';
  if (!exportName.endsWith('Rpc')) {
    return;
  }
  const [, callExpression] = getChildren(variableDeclaration);
  if (
    (
      (callExpression as ts.CallExpression)?.expression as ts.Identifier
    ).escapedText?.toString() !== 'createRpcBinding'
  ) {
    return;
  }

  const [, objectLiteralExpression] = getChildren(callExpression);

  const props = getChildren(objectLiteralExpression) as ts.PropertyAssignment[];

  let returnType = '';
  let signature = '';
  let injectUser = false;
  let args: {
    name: string;
    value: string;
  }[] = [];
  props.forEach(prop => {
    const name = (prop.name as ts.Identifier).escapedText?.toString();

    if (name === 'injectUser') {
      injectUser = true;
    }
    if (name === 'signature') {
      signature = (prop.initializer as any as ts.LiteralLikeNode).text;
    }
    if (name === 'handler') {
      const fn = prop.initializer;
      const contractType = checker.getTypeAtLocation(fn);
      const signature = checker.getSignaturesOfType(contractType, 0)[0];

      returnType = normalizeReturnType(
        checker.typeToString(
          signature.getReturnType(),
          undefined,
          ts.TypeFormatFlags.NoTruncation |
            ts.TypeFormatFlags.UseFullyQualifiedType
          // ts.TypeFormatFlags.WriteClassExpressionAsTypeLiteral |
          // ts.TypeFormatFlags.MultilineObjectLiterals
        )
      );
      const argParam = signature.parameters[0];
      const argType = checker.getTypeOfSymbolAtLocation(
        argParam,
        argParam.valueDeclaration!
      );
      const argSignature = checker.typeToString(
        argType,
        undefined,
        ts.TypeFormatFlags.NoTruncation
      );
      const str = argSignature.substr(1, argSignature.length - 2);
      args = parseArgs(str);
    }
  });
  if (injectUser) {
    args.shift();
  }

  signatures.push(
    `${signature.replace('.', '_')}(
    ${args.map(arg => `${arg.name}: ${arg.value}`).join(', ')}
  ): Promise<${returnType}> {
    return this.call('${signature}', { ${args
      .map(arg => arg.name)
      .join(', ')} })
  }`
  );
}

/** Generate documentation for all classes in a set of .ts files */
function generateDocumentation(
  fileNames: string[],
  options: ts.CompilerOptions
): void {
  console.log(fileNames);
  // Build a program using the set of root file names in fileNames
  const program = ts.createProgram(fileNames, options);

  // Get the checker, we will use it to find more about classes
  const checker = program.getTypeChecker();

  // Visit every sourceFile in the program
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      // if (!sourceFile.fileName.endsWith('register.ts')) {
      //   continue;
      // }
      // Walk the tree to search for classes
      ts.forEachChild(sourceFile, item => {
        checkNode(item, checker);
        // showTree(item);
      });
    }
  }
  const targetPath = Path.join(
    __dirname,
    '../../../packages/shared/src/APIClient.ts'
  );
  let content = fs.readFileSync(targetPath, 'utf8');
  const imports = `import {${Object.keys(importTypes)}} from './types';`;
  content = content
    .replace(/(\/\/ IMPORTS)(.*?)(\/\/ IMPORTS END)/s, `$1\n${imports}\n$3`)
    .replace(
      /(\/\/ SIGNATURES)(.*?)(\/\/ SIGNATURES END)/s,
      `$1\n${signatures.join('\n')}\n$3`
    );

  fs.writeFileSync(
    targetPath,
    // content
    prettier.format(content, {
      ...require('../../../prettier.config'),
      parser: 'typescript',
    })
  );
}

generateDocumentation(process.argv.slice(2), {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.CommonJS,
  strict: true,
  noImplicitAny: true,
  strictNullChecks: true,
  noUnusedLocals: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  esModuleInterop: true,
});
