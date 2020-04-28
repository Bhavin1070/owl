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

/**
 * This function assumes that oldvnode has been patched first (and so, has valid
 * html or text elements)
 * 
 * It returns a vnode which matches the newVNode structure, and properly patched.
 * It most likely is oldVNode, but it could be the new one in some cases
 */
export function update(oldVNode: VNode, newVNode: VNode): VNode {
  if (newVNode.type !== oldVNode.type) {
    return oldVNode;
  }
  switch (oldVNode.type) {
    case NodeType.Text:
      //   if (target.type === NodeType.Text) {
      oldVNode.el!.textContent = (newVNode as VTextNode).text;
      //   }
      break;
    case NodeType.DOM:
      //   if (target.type === NodeType.DOM) {
      update(oldVNode.children[0], (newVNode as VDOMNode).children[0]);
    //   }
  }
  return oldVNode;
}
