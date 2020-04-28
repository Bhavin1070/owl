/**
 * Owl 2 VDOM
 */

export const enum NodeType {
  DOM,
  Text,
  Content,
}
export interface VDOMNode {
  type: NodeType.DOM;
  tag: string;
  el: HTMLElement | null;
  children: VNode[];
}

export interface VTextNode {
  type: NodeType.Text;
  text: string;
  el: Text | null;
}

export interface VContentNode {
  type: NodeType.Content;
  children: VNode[];
}

export type VNode = VDOMNode | VTextNode | VContentNode;

export function patch(el: HTMLElement, vnode: VNode) {
  switch (vnode.type) {
    case NodeType.Text:
      const textEl = document.createTextNode(vnode.text);
      vnode.el = textEl;
      el.appendChild(textEl);
      break;
    case NodeType.DOM:
      let htmlEl = document.createElement(vnode.tag);
      vnode.el = htmlEl;
      el.appendChild(htmlEl);
      for (let child of vnode.children) {
        patch(htmlEl, child);
      }
      break;
    case NodeType.Content:
      for (let child of vnode.children) {
        patch(el, child);
      }
      break;
  }
}

export function update(vnode: VContentNode, target: VContentNode) {}
