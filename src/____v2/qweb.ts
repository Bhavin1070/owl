import { Fiber } from "./fiber";
import { VNode, NodeType, VDOMNode, VTextNode } from "./vdom";

export interface RenderContext {
  [key: string]: any;
}

type CompiledTemplate = (fiber: Fiber, context: RenderContext) => VNode;

const templates: { [name: string]: CompiledTemplate } = {};

export function renderTemplate(template: string, fiber: Fiber, context: RenderContext): VNode {
  let fn = templates[template];
  if (!fn) {
    throw new Error("does not work...");
  }
  return fn(fiber, context);
}

// demo templates
templates["<div>simple vnode</div>"] = function (fiber: Fiber, context: RenderContext): VNode {
  const result = fiber.vnode;
  const vn1: VDOMNode = { type: NodeType.DOM, tag: "div", el: null, children: [] };
  result.children.push(vn1);
  const vn2: VTextNode = { type: NodeType.Text, text: "simple vnode", el: null };
  vn1.children.push(vn2);
  return result;
};
