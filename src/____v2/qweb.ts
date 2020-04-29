import { Fiber } from "./fiber";
import { NodeType, VDOMNode, VTextNode } from "./vdom";
import { VTree, Meta } from "./owl";

export interface RenderContext {
  [key: string]: any;
}

type CompiledTemplate = (meta: Meta, context: RenderContext) => VTree;

const templates: { [name: string]: CompiledTemplate } = {};

export function renderTemplate(template: string, fiber: Fiber, context: RenderContext): VTree {
  let fn = templates[template];
  if (!fn) {
    throw new Error("qweb not implemented yet...");
  }
  const meta = { fiber, template };
  return fn(meta, context);
}

// demo templates
templates["<div>simple vnode</div>"] = function (data: Meta, context: RenderContext): VTree {
  const result: VTree = { type: NodeType.Content, children: [], data };
  const vn1: VDOMNode<Meta> = { type: NodeType.DOM, tag: "div", el: null, children: [] };
  result.children.push(vn1);
  const vn2: VTextNode = { type: NodeType.Text, text: "simple vnode", el: null };
  vn1.children.push(vn2);
  return result;
};

templates["simple text node"] = function (data: Meta, context: RenderContext): VTree {
  const result: VTree = { type: NodeType.Content, children: [], data };
  const vn1: VTextNode = { type: NodeType.Text, text: "simple text node", el: null };
  result.children.push(vn1);
  return result;
};

templates["<div>a</div><div>b</div>"] = function (data: Meta, context: RenderContext): VTree {
  const result: VTree = { type: NodeType.Content, children: [], data };
  const vn1: VDOMNode<Meta> = { type: NodeType.DOM, tag: "div", el: null, children: [] };
  result.children.push(vn1);
  const vn2: VTextNode = { type: NodeType.Text, text: "a", el: null };
  vn1.children.push(vn2);
  const vn3: VDOMNode<Meta> = { type: NodeType.DOM, tag: "div", el: null, children: [] };
  result.children.push(vn3);
  const vn4: VTextNode = { type: NodeType.Text, text: "b", el: null };
  vn3.children.push(vn4);

  return result;
};

templates[`<div>Hello <t t-esc="name"/></div>`] = function (
  data: Meta,
  context: RenderContext
): VTree {
  const result: VTree = { type: NodeType.Content, children: [], data };
  const vn1: VDOMNode<Meta> = { type: NodeType.DOM, tag: "div", el: null, children: [] };
  result.children.push(vn1);
  const vn2: VTextNode = { type: NodeType.Text, text: "Hello ", el: null };
  vn1.children.push(vn2);
  const vn3: VTextNode = { type: NodeType.Text, text: context.name, el: null };
  vn1.children.push(vn3);
  return result;
};
