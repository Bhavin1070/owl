/**
 * Owl 2 VDOM
 */

// -----------------------------------------------------------------------------
// VDOM Type
// -----------------------------------------------------------------------------

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


// -----------------------------------------------------------------------------
// patch and update
// -----------------------------------------------------------------------------

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

function makeDOMVNode(vnode: VDOMNode): HTMLElement {
  const el = document.createElement(vnode.tag);
  vnode.el = el;
  for (let child of vnode.children) {
    patch(el, child);
  }
  return el;
}

/**
 * This function assumes that oldvnode has been patched first (and so, has valid
 * html or text elements)
 *
 * Also, it can mutate in place one or the other...
 *
 * It returns a vnode which matches the newVNode structure, and properly patched.
 * It most likely is oldVNode, but it could be the new one in some cases
 */
export function update(oldVNode: VNode, newVNode: VNode): VNode {
  switch (oldVNode.type) {
    case NodeType.Text:
      switch (newVNode.type) {
        case NodeType.Text:
          oldVNode.el!.textContent = (newVNode as VTextNode).text;
          return oldVNode;
        case NodeType.DOM:
          oldVNode.el!.replaceWith(makeDOMVNode(newVNode));
          return newVNode;
        case NodeType.Content:
          throw new Error("not yet implemented");
      }
    case NodeType.DOM:
      switch (newVNode.type) {
        case NodeType.DOM:
          if (oldVNode.tag === newVNode.tag) {
            update(oldVNode.children[0], (newVNode as VDOMNode).children[0]);
            return oldVNode;
          } else {
            oldVNode.el!.replaceWith(makeDOMVNode(newVNode));
            return newVNode;
          }
        case NodeType.Text:
        case NodeType.Content:
          throw new Error("not yet implemented");
      }
    case NodeType.Content:
      throw new Error("not yet implemented");
  }
}
