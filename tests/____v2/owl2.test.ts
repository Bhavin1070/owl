import { render, mount, Component } from "../../src/____v2/owl2";
import { makeTestFixture } from "../helpers";

let fixture: HTMLElement;

beforeEach(() => {
  fixture = makeTestFixture();
});

describe("owl2", () => {
  test("can mount a simple template", async () => {
    const block = render(`<div>simple block</div>`);
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

  test("block with dynamic content", async () => {
    const block = render(`<div>Hello <t t-esc="name"/></div>`, { name: "Alex" });

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
});
