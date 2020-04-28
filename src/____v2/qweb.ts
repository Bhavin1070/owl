import { Fiber } from "./fiber";
import { VNode, NodeType, VDOMNode, VTextNode, VContentNode } from "./vdom";

export interface RenderContext {
  [key: string]: any;
}

type CompiledTemplate = (fiber: Fiber, context: RenderContext) => VNode;

const templates: { [name: string]: CompiledTemplate } = {};

export function renderTemplate(template: string, fiber: Fiber, context: RenderContext): VNode {
  let fn = templates[template];
  if (!fn) {
    throw new Error("qweb not implemented yet...");
  }
  return fn(fiber, context);
}

// demo templates
templates["<div>simple vnode</div>"] = function (fiber: Fiber, context: RenderContext): VNode {
  const result: VContentNode = { type: NodeType.Content, children: [], data: fiber };
  const vn1: VDOMNode = { type: NodeType.DOM, tag: "div", el: null, children: [] };
  result.children.push(vn1);
  const vn2: VTextNode = { type: NodeType.Text, text: "simple vnode", el: null };
  vn1.children.push(vn2);
  return result;
};

templates["simple text node"] = function (fiber: Fiber, context: RenderContext): VNode {
  const result: VContentNode = { type: NodeType.Content, children: [], data: fiber };
  const vn1: VTextNode = { type: NodeType.Text, text: "simple text node", el: null };
  result.children.push(vn1);
  return result;
};

templates["<div>a</div><div>b</div>"] = function (fiber: Fiber, context: RenderContext): VNode {
  const result: VContentNode = { type: NodeType.Content, children: [], data: fiber };
  const vn1: VDOMNode = { type: NodeType.DOM, tag: "div", el: null, children: [] };
  result.children.push(vn1);
  const vn2: VTextNode = { type: NodeType.Text, text: "a", el: null };
  vn1.children.push(vn2);
  const vn3: VDOMNode = { type: NodeType.DOM, tag: "div", el: null, children: [] };
  result.children.push(vn3);
  const vn4: VTextNode = { type: NodeType.Text, text: "b", el: null };
  vn3.children.push(vn4);

  return result;
};

templates[`<div>Hello <t t-esc="name"/></div>`] = function (
  fiber: Fiber,
  context: RenderContext
): VNode {
  const result: VContentNode = { type: NodeType.Content, children: [], data: fiber };
  const vn1: VDOMNode = { type: NodeType.DOM, tag: "div", el: null, children: [] };
  result.children.push(vn1);
  const vn2: VTextNode = { type: NodeType.Text, text: "Hello ", el: null };
  vn1.children.push(vn2);
  const vn3: VTextNode = { type: NodeType.Text, text: context.name, el: null };
  vn1.children.push(vn3);
  return result;
};
