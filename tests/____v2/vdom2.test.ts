import {
  patch,
  update,
  NodeType,
  VTextNode,
  VContentNode,
  VNode,
  VDOMNode,
} from "../../src/____v2/vdom2";

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

describe("patch function", () => {
  test("can make a simple text node", () => {
    const vnode = textNode("abc");
    expect(vnode.el).toBeNull();
    patch(fixture, vnode);
    expect(vnode.el).toEqual(document.createTextNode("abc"));
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

});
