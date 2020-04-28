import { patch, NodeType, VTextNode, VContentNode, VNode, VDOMNode } from "../../src/____v2/vdom2";

function textNode(text: string): VTextNode {
  return {
    type: NodeType.Text,
    text,
    el: null,
  };
}

function domNode(tag: string, children: VNode[]): VDOMNode {
  return {
    type: NodeType.DOM,
    tag: tag,
    el: null,
    children: children,
  };
}

function contentNode(children: VNode[]): VContentNode {
  return {
    type: NodeType.Content,
    children,
  };
}

let fixture: HTMLElement;

beforeEach(() => {
  fixture = document.createElement("div");
});

// function getHtml(vnode: VNode): string {
//   let div = document.createElement("div");
//   switch (vnode.type) {
//     case NodeType.Text:
//     case NodeType.DOM:
//       if (vnode.el) {
//         div.appendChild(vnode.el);
//       }
//       break;
//     case NodeType.Content:
//       for (let el of getEls(vnode)) {
//         div.appendChild(el);
//       }
//       break;
//   }
//   return div.innerHTML;
// }

// function getEls(vnode: VContentNode): (HTMLElement | Text)[] {
//   const result: (HTMLElement | Text)[] = [];
//   for (let child of vnode.children) {
//     if (child.type === NodeType.Content) {
//       result.push(...getEls(child));
//     } else if (child.el) {
//       result.push(child.el);
//     }
//   }
//   return result;
// }

describe("vdom2", () => {
  test("can make a simple text node", async () => {
    const vnode = textNode("abc");
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("abc");
  });

  test("can make a simple dom node", async () => {
    const vnode = domNode("div", []);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("<div></div>");
  });

  test("can make a dom node with text content", async () => {
    const vnode = domNode("div", [textNode("abc")]);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("<div>abc</div>");
  });

  test("can build on an empty content node", async () => {
    const vnode = contentNode([]);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("");
  });

  test("can build on an non empty content node", async () => {
    const vnode = contentNode([textNode("abc"), domNode("div", [])]);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("abc<div></div>");
  });

  test("content node in a dom node in a content node", async () => {
    const vnode = contentNode([
      textNode("abc"),
      contentNode([domNode("span", [textNode("text")])]),
    ]);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("abc<span>text</span>");
  });
});
