import {
  patch,
  update,
  NodeType,
  VTextNode,
  VContentNode,
  VNode,
  VDOMNode,
} from "../../src/____v2/vdom";

function textNode(text: string): VTextNode {
  return {
    type: NodeType.Text,
    text,
    el: null,
  };
}

function domNode(tag: string, children: VNode[]): VDOMNode<any> {
  return {
    type: NodeType.DOM,
    tag: tag,
    el: null,
    children: children,
  };
}

function contentNode(children: VNode[]): VContentNode<any> {
  return {
    type: NodeType.Content,
    children,
    data: null
  };
}

let fixture: HTMLElement;

beforeEach(() => {
  fixture = document.createElement("div");
});

describe("patch function", () => {
  test("can make a simple text node", () => {
    const vnode = textNode("abc");
    expect(vnode.el).toBeNull();
    patch(fixture, vnode);
    expect(vnode.el).toEqual(document.createTextNode("abc"));
    expect(fixture.innerHTML).toBe("abc");
  });

  test("can patch into a fragment", () => {
    const vnode = textNode("abc");
    expect(vnode.el).toBeNull();
    const fragment = document.createDocumentFragment();
    patch(fragment, vnode);
    expect(vnode.el).toEqual(document.createTextNode("abc"));
    fixture.appendChild(fragment);
    expect(fixture.innerHTML).toBe("abc");
  });

  test("can make a simple dom node", () => {
    const vnode = domNode("div", []);
    expect(vnode.el).toBeNull();
    patch(fixture, vnode);
    expect(vnode.el).toEqual(document.createElement("div"));
    expect(fixture.innerHTML).toBe("<div></div>");
  });

  test("can make a dom node with text content", () => {
    const vnode = domNode("div", [textNode("abc")]);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("<div>abc</div>");
  });

  test("can build on an empty content node", () => {
    const vnode = contentNode([]);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("");
  });

  test("can build on an non empty content node", () => {
    const vnode = contentNode([textNode("abc"), domNode("div", [])]);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("abc<div></div>");
  });

  test("content node in a dom node in a content node", () => {
    const vnode = contentNode([
      textNode("abc"),
      contentNode([domNode("span", [textNode("text")])]),
    ]);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("abc<span>text</span>");
  });
});

describe("update function", () => {
  test("can update some text content", async () => {
    const vnode = textNode("abc");
    patch(fixture, vnode);
    const text = fixture.childNodes[0];
    expect(text).toEqual(document.createTextNode("abc"));

    update(vnode, textNode("def"));
    expect(fixture.innerHTML).toBe("def");
    expect(fixture.childNodes[0]).toBe(text);
  });

  test("can update a text inside a div content", async () => {
    const vnode = domNode("div", [textNode("abc")]);
    patch(fixture, vnode);
    const text = fixture.childNodes[0].childNodes[0];
    expect(fixture.innerHTML).toBe("<div>abc</div>");
    expect(text).toEqual(document.createTextNode("abc"));

    update(vnode, domNode("div", [textNode("def")]));
    expect(fixture.innerHTML).toBe("<div>def</div>");
    expect(fixture.childNodes[0].childNodes[0]).toBe(text);
  });

  test("can transform a dom node into a different dom node type", async () => {
    let vnode: VNode = domNode("div", [textNode("abc")]);
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("<div>abc</div>");

    vnode = update(vnode, domNode("span", [textNode("def")]));

    expect(fixture.innerHTML).toBe("<span>def</span>");
  });

  test("can transform a text node into a dom node", async () => {
    const vnode = textNode("abc");
    patch(fixture, vnode);
    expect(fixture.innerHTML).toBe("abc");

    update(vnode, domNode("span", [textNode("def")]));
    expect(fixture.innerHTML).toBe("<span>def</span>");
  });

  test("can transform a content node into another content node", async () => {
    const oldvnode = contentNode([domNode('div', [textNode("abc")])]);
    const newvnode = contentNode([domNode('div', [textNode("def")])]);
    patch(fixture, oldvnode);
    expect(fixture.innerHTML).toBe("<div>abc</div>");

    update(oldvnode, newvnode);
    expect(fixture.innerHTML).toBe("<div>def</div>");
  });


  test("can update two text nodes", async () => {
    const oldvnode = contentNode([ textNode('abc'), textNode('def')]);
    const newvnode = contentNode([ textNode('abc'), textNode('ghi')]);
    patch(fixture, oldvnode);
    expect(fixture.innerHTML).toBe("abcdef");

    const t1 = fixture.childNodes[0];
    const t2 = fixture.childNodes[1];
    expect(t2.textContent).toBe('def');
    update(oldvnode, newvnode);
    expect(fixture.innerHTML).toBe("abcghi");
    expect(fixture.childNodes[0]).toBe(t1);
    expect(fixture.childNodes[1]).toBe(t2);
    expect(t2.textContent).toBe('ghi');

  });

});
