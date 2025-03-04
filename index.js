/**
 * @fileoverview ESLint plugin to enforce using EMPTY_STRING constant instead of empty string literals
 */

"use strict";

module.exports = {
  rules: {
    "no-empty-strings": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Enforce using EMPTY_STRING constant instead of empty string literals",
          category: "Best Practices",
          recommended: true,
        },
        fixable: "code",
        schema: [],
      },
      create(context) {
        return {
          Literal(node) {
            // Check if the node is a string literal and it's empty
            if (typeof node.value === "string" && node.value === "") {
              // Check if we're in a property key position (object key), where we shouldn't apply this rule
              const parent = node.parent;
              if (parent && parent.type === "Property" && parent.key === node && !parent.computed) {
                return;
              }

              context.report({
                node,
                message: "Empty string literals are not allowed. Use EMPTY_STRING from 'consts' instead.",
                fix(fixer) {
                  // Check if EMPTY_STRING is already imported
                  const sourceCode = context.getSourceCode();
                  const importDeclarations = sourceCode.ast.body.filter(
                    (node) => node.type === "ImportDeclaration"
                  );

                  let hasEmptyStringImport = false;
                  
                  if (importDeclarations.length > 0) {
                    // Check if EMPTY_STRING is in the imports
                    for (const importDecl of importDeclarations) {
                      hasEmptyStringImport = importDecl.specifiers.some(
                        (specifier) => 
                          specifier.type === "ImportSpecifier" && 
                          specifier.imported.name === "EMPTY_STRING"
                      );
                      if (hasEmptyStringImport) break;
                    }
                  }

                  // Replace the empty string with EMPTY_STRING
                  return fixer.replaceText(node, "EMPTY_STRING");
                }
              });
            }
          }
        };
      }
    }
  }
};