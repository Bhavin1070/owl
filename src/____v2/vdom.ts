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
export interface VDOMNode<T> {
  type: NodeType.DOM;
  tag: string;
  el: HTMLElement | null;
  children: VNode<T>[];
}

export interface VTextNode {
  type: NodeType.Text;
  text: string;
  el: Text | null;
}

export interface VContentNode<T> {
  type: NodeType.Content;
  data: T;
  children: VNode<T>[];
}

export type VNode<T = any> = VDOMNode<T> | VTextNode | VContentNode<T>;

// -----------------------------------------------------------------------------
// patch and update
// -----------------------------------------------------------------------------

export function patch(el: HTMLElement | DocumentFragment, vnode: VNode) {
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

function makeDOMVNode<T>(vnode: VDOMNode<T>): HTMLElement {
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
export function update<T>(oldVNode: VNode<T>, newVNode: VNode<T>): VNode<T> {
  switch (oldVNode.type) {
    case NodeType.Text:
      switch (newVNode.type) {
        case NodeType.Text:
          oldVNode.el!.textContent = newVNode.text;
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
            update(oldVNode.children[0], newVNode.children[0]);
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
      switch (newVNode.type) {
        case NodeType.Content:
          return update(oldVNode.children[0], newVNode.children[0])
      }
      throw new Error("not yet implemented");
  }
}

function updateChildren<T>(oldChildren: VNode<T>[], newChildren: VNode<T>[]) {
  
}