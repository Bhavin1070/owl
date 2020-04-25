import { Component, mount, render } from "../../src/____v2/owl2";
import { makeTestFixture } from "../helpers";

let fixture: HTMLElement;

beforeEach(() => {
  fixture = makeTestFixture();
});

describe("owl2", () => {
  // ---------------------------------------------------------------------------
  // simple mounting operation, static content
  // ---------------------------------------------------------------------------
  test("can mount a simple template", async () => {
    const block = await render(`<div>simple block</div>`);
    await mount(block, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>simple block</div>");
  });

  test("can render a simple functional component", async () => {
    function Test() {
      return () => render(`<div>functional component</div>`);
    }

    await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>functional component</div>");
  });

  test("can render a simple class component", async () => {
    class Test extends Component {
      static template = `<div>class component</div>`;
    }

    await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>class component</div>");
  });

  // ---------------------------------------------------------------------------
  // simple mounting operation, only a text node
  // ---------------------------------------------------------------------------
  test("just a template, text node", async () => {
    const block = await render(`simple text node`);
    await mount(block, { target: fixture });
    expect(fixture.innerHTML).toBe("simple text node");
  });

  test("functional component, text node", async () => {
    function Test() {
      return () => render(`simple text node`);
    }

    await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("simple text node");
  });

  test("class component, text node", async () => {
    class Test extends Component {
      static template = `simple text node`;
    }

    await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("simple text node");
  });

  // ---------------------------------------------------------------------------
  // simple mounting operation, multiroot content
  // ---------------------------------------------------------------------------
  test("simple template, multiroot", async () => {
    const block = await render(`<div>a</div><div>b</div>`);
    await mount(block, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>a</div><div>b</div>");
  });

  test("simple functional component, multiroot", async () => {
    function Test() {
      return () => render(`<div>a</div><div>b</div>`);
    }

    await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>a</div><div>b</div>");
  });

  test("simple class component, multiroot", async () => {
    class Test extends Component {
      static template = `<div>a</div><div>b</div>`;
    }

    await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>a</div><div>b</div>");
  });

  // ---------------------------------------------------------------------------
  // simple mounting operation, dynamic content
  // ---------------------------------------------------------------------------
  test("block with dynamic content", async () => {
    const block = await render(`<div>Hello <t t-esc="name"/></div>`, { name: "Alex" });

    await mount(block, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>Hello Alex</div>");
  });

  test("functional component with dynamic content", async () => {
    function Test() {
      return () => render(`<div>Hello <t t-esc="name"/></div>`, { name: "Alex" });
    }

    await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>Hello Alex</div>");
  });

  test("class component with dynamic content", async () => {
    class Test extends Component {
      name = "Alex";
      static template = `<div>Hello <t t-esc="name"/></div>`;
    }

    await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>Hello Alex</div>");
  });

  // ---------------------------------------------------------------------------
  // mounting, then update (on dynamic content)
  // ---------------------------------------------------------------------------
  test("updating a block with dynamic content", async () => {
    const block = await render(`<div>Hello <t t-esc="name"/></div>`, { name: "Alex" });

    await mount(block, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>Hello Alex</div>");

    await render(block, { name: "Lyra" });
    expect(fixture.innerHTML).toBe("<div>Hello Lyra</div>");
  });

  test("updating a functional component with dynamic content", async () => {
    function Test() {
      return () => render(`<div>Hello <t t-esc="name"/></div>`, { name: "Alex" });
    }
    const block = await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>Hello Alex</div>");

    await render(block, { name: "Lyra" });
    expect(fixture.innerHTML).toBe("<div>Hello Lyra</div>");
  });

  test("updating a class component with dynamic content", async () => {
    class Test extends Component {
      name = "Alex";
      static template = `<div>Hello <t t-esc="name"/></div>`;
    }
    const block = await mount(Test, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>Hello Alex</div>");

    await render(block, { name: "Lyra" });
    expect(fixture.innerHTML).toBe("<div>Hello Lyra</div>");
  });
});
