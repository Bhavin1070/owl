// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export class Component {
  static template: string;
}

// -----------------------------------------------------------------------------
// Mounting
// -----------------------------------------------------------------------------

type Fn = (env, props) => FnInstance;
type FnInstance = (props: any) => Promise<VNode>;

interface MountConfig {
  target: HTMLElement;
}

type OwlElement = Fn | typeof Component | VNode;

export async function mount(C: OwlElement, config: MountConfig): Promise<VNode> {
  // Build a Block
  let node: VNode;
  if (typeof C === "object") {
    node = C;
  } else if (C.prototype instanceof Component) {
    node = await buildFromComponent(C as typeof Component);
  } else {
    node = await buildFromFn(C as Fn);
  }
  // patch it to the target
  patch(node, config.target);
  return node;
}

function buildFromComponent(C: typeof Component): Promise<VNode> {
  let template: string = C.template;
  const c = new C();
  return qweb.render(template, c);
}

function buildFromFn(fn: Fn): Promise<VNode> {
  const instance = fn({}, {});
  return instance({});
}

export function render(template: string, context?: RenderContext): Promise<VNode>;
export function render(block: VNode, context?: RenderContext): Promise<VNode>;
export function render(elem: string | VNode, context: RenderContext = {}): Promise<VNode> {
  if (typeof elem === "string") {
    return qweb.render(elem, context);
  }
  elem.context = context;
  elem.builder.update(elem, context);
  return Promise.resolve(elem);
}

// -----------------------------------------------------------------------------
// QWeb Engine
// -----------------------------------------------------------------------------

interface RenderContext {
  [key: string]: any;
}

type RawTemplate = string;
type CompiledTemplate = (context: RenderContext) => VNode;

// todo: make this a class (??)
interface Builder {
  id: number;
  elems: HTMLElement[];
  fragments: DocumentFragment[];
  texts: Text[];
  initialize(this: Builder, node: VNode);
  update(node: VNode, context);
}

class VNode {
  context: RenderContext;
  builder: Builder;
  root: HTMLElement | DocumentFragment | Text | null = null;
  elems: HTMLElement[] = [];
  texts: Text[] = [];

  constructor(builderId: number, context: RenderContext) {
    this.builder = qweb.builders[builderId];
    this.context = context;
  }
}

interface QWeb {
  rawTemplates: { [name: string]: RawTemplate };
  templates: { [name: string]: CompiledTemplate };
  builders: { [id: number]: Builder };

  render(template: string, context?: RenderContext): Promise<VNode>;
  compile(template: string): CompiledTemplate;
}

const qweb: QWeb = {
  rawTemplates: {},
  templates: {},
  builders: {},

  async render(template: string, context: RenderContext = {}): Promise<VNode> {
    let fn = qweb.templates[template];
    if (!fn) {
      fn = qweb.compile(template);
    }
    return fn(context);
  },

  compile(template: string): CompiledTemplate {
    const ct = compiledTemplates[template];
    if (!ct) {
      throw new Error("BOOM");
    }
    for (let b of ct.blocks) {
      qweb.builders[b.id] = b;
    }
    qweb.templates[template] = ct.fn;
    return ct.fn;
  },
};

// -----------------------------------------------------------------------------
// Tree Diff Engine
// ----------------------------------------------------------------------------

function patch(node: VNode, target: HTMLElement) {
  node.builder.initialize(node);
  target.appendChild(node.root!);
}

// -----------------------------------------------------------------------------
// TEMP STUFF
// -----------------------------------------------------------------------------
interface CT {
  blocks: Builder[];
  fn: CompiledTemplate;
}
const compiledTemplates: { [str: string]: CT } = {};

// <div>simple block</div>
compiledTemplates["<div>simple block</div>"] = {
  blocks: [
    {
      id: 1,
      elems: [makeEl("<div>simple block</div>")],
      fragments: [],
      texts: [],
      initialize(node: VNode) {
        node.root = this.elems[0].cloneNode(true) as HTMLElement;
      },
      update() {},
    },
  ],
  fn: (context: RenderContext) => {
    return new VNode(1, context);
  },
};

// <div>functional component</div>
compiledTemplates["<div>functional component</div>"] = {
  blocks: [
    {
      id: 2,
      elems: [makeEl("<div>functional component</div>")],
      fragments: [],
      texts: [],
      initialize(node: VNode) {
        node.root = this.elems[0].cloneNode(true) as HTMLElement;
      },
      update() {},
    },
  ],
  fn: (context: RenderContext) => {
    return new VNode(2, context);
  },
};

// <div>class component</div>
compiledTemplates["<div>class component</div>"] = {
  blocks: [
    {
      id: 3,
      elems: [makeEl("<div>class component</div>")],
      fragments: [],
      texts: [],
      initialize(node: VNode) {
        node.root = this.elems[0].cloneNode(true) as HTMLElement;
      },
      update() {},
    },
  ],
  fn: (context: RenderContext) => {
    return new VNode(3, context);
  },
};

// <div>Hello <t t-esc="name"/></div>
compiledTemplates['<div>Hello <t t-esc="name"/></div>'] = {
  blocks: [
    {
      id: 4,
      elems: [makeEl("<div>Hello </div>")],
      fragments: [],
      texts: [],
      initialize(node: VNode) {
        const context = node.context;
        const el1 = this.elems[0].cloneNode(true) as HTMLElement;
        const textNode1 = document.createTextNode(context.name);
        el1.appendChild(textNode1);
        node.texts.push(textNode1);
        node.root = el1;
      },
      update(node: VNode, context: RenderContext) {
        node.texts[0].textContent = context.name;
      },
    },
  ],
  fn: (context: RenderContext) => {
    return new VNode(4, context);
  },
};

// simple text node
compiledTemplates["simple text node"] = {
  blocks: [
    {
      id: 5,
      elems: [],
      fragments: [],
      texts: [document.createTextNode("simple text node")],
      initialize(node: VNode) {
        node.root = this.texts[0].cloneNode(true) as Text;
      },
      update() {},
    },
  ],
  fn: (context: RenderContext) => {
    return new VNode(5, context);
  },
};

// multi root template
const f = document.createDocumentFragment();
f.appendChild(makeEl("<div>a</div>"));
f.appendChild(makeEl("<div>b</div>"));

compiledTemplates["<div>a</div><div>b</div>"] = {
  blocks: [
    {
      id: 6,
      elems: [],
      fragments: [f],
      texts: [],
      initialize(node: VNode) {
        node.root = this.fragments[0].cloneNode(true) as DocumentFragment;
      },
      update() {},
    },
  ],
  fn: (context: RenderContext) => {
    return new VNode(6, context);
  },
};

function makeEl(str: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = str;
  return div.children[0] as HTMLElement;
}
