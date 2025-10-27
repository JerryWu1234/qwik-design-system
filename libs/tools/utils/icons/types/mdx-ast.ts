/**
 * Type definitions for MDX AST nodes
 * These types are based on the MDAST and ESTree structures used by remark-mdx
 */

export interface Position {
  start: { offset: number; line: number; column: number };
  end: { offset: number; line: number; column: number };
}

export interface MDXJSXAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value?:
    | string
    | {
        type: "mdxJsxAttributeValueExpression";
        value: string;
        data?: {
          estree?: unknown;
        };
      };
}

export interface MDXJSXElement {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string | null;
  attributes?: MDXJSXAttribute[];
  position?: Position;
  children?: unknown[];
}

export interface ESTreeProgram {
  type: "Program";
  body: ESTreeStatement[];
  sourceType?: string;
}

export interface ESTreeImportDeclaration {
  type: "ImportDeclaration";
  source: {
    value: string;
    type: string;
  };
  specifiers: ESTreeImportSpecifier[];
}

export interface ESTreeImportSpecifier {
  type: "ImportSpecifier" | "ImportNamespaceSpecifier" | "ImportDefaultSpecifier";
  local: {
    name: string;
    type: string;
  };
  imported?: {
    name?: string;
    value?: string;
    type: string;
  };
}

export type ESTreeStatement =
  | ESTreeImportDeclaration
  | { type: string; [key: string]: unknown };

export interface MDXjsEsmNode {
  type: "mdxjsEsm";
  data?: {
    estree?: ESTreeProgram;
  };
  position?: Position;
}

export type MDXNode =
  | MDXJSXElement
  | MDXjsEsmNode
  | { type: string; [key: string]: unknown };
