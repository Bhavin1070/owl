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
type FnInstance = (props: any) => BlockTree;

interface MountConfig {
  target: HTMLElement;
}

export async function mount(C: Fn | typeof Component | BlockTree, config: MountConfig) {
  // Build a Block
  let tree: BlockTree;
  if (typeof C === "object") {
    tree = C;
  } else if (C.prototype instanceof Component) {
    tree = buildFromComponent(C as typeof Component);
  } else {
    tree = buildFromFn(C as Fn);
  }
  // patch it to the target
  patch(tree, config.target);
}

function buildFromComponent(C: typeof Component): BlockTree {
  let template: string = C.template;
  const c = new C();
  return qweb.render(template, c);
}

function buildFromFn(fn: Fn): BlockTree {
  const instance = fn({}, {});
  return instance({});
}

export function render(template: string, context: RenderContext = {}) {
  return qweb.render(template, context);
}

// -----------------------------------------------------------------------------
// QWeb Engine
// -----------------------------------------------------------------------------

interface RenderContext {
  [key: string]: any;
}

type RawTemplate = string;
type CompiledTemplate = (context: RenderContext) => BlockTree;

interface BuildingBlock {
  id: number;
  el: HTMLElement;
  textNodes: Text[];
  initialize(this: BuildingBlock, blockTree: BlockTree);
  // update(blockTree: BlockTree, context)
}

interface BlockTree {
  context: RenderContext;
  blockId: number;
  el: HTMLElement | null;
}

interface QWeb {
  rawTemplates: { [name: string]: RawTemplate };
  templates: { [name: string]: CompiledTemplate };
  blocks: { [id: number]: BuildingBlock };

  render(template: string, context?: RenderContext): BlockTree;
  compile(template: string): CompiledTemplate;
}

const qweb: QWeb = {
  rawTemplates: {},
  templates: {},
  blocks: {},

  render(template: string, context: RenderContext = {}): BlockTree {
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
      qweb.blocks[b.id] = b;
    }
    qweb.templates[template] = ct.fn;
    return ct.fn;
  },
};

// -----------------------------------------------------------------------------
// Tree Diff Engine
// ----------------------------------------------------------------------------

function patch(tree: BlockTree, target: HTMLElement) {
  const block = qweb.blocks[tree.blockId];
  block.initialize(tree);
  target.appendChild(tree.el!);
}

// -----------------------------------------------------------------------------
// TEMP STUFF
// -----------------------------------------------------------------------------
interface CT {
  blocks: BuildingBlock[];
  fn: CompiledTemplate;
}
const compiledTemplates: { [str: string]: CT } = {};

// <div>simple block</div>
compiledTemplates["<div>simple block</div>"] = {
  blocks: [
    {
      id: 1,
      el: makeEl("<div>simple block</div>"),
      textNodes: [],
      initialize(bt) {
        bt.el = this.el.cloneNode(true) as HTMLElement;
      },
    },
  ],
  fn: (context: RenderContext) => {
    return { blockId: 1, context, el: null };
  },
};

// <div>functional component</div>
compiledTemplates["<div>functional component</div>"] = {
  blocks: [
    {
      id: 2,
      el: makeEl("<div>functional component</div>"),
      textNodes: [],
      initialize(bt) {
        bt.el = this.el.cloneNode(true) as HTMLElement;
      },
    },
  ],
  fn: (context: RenderContext) => {
    return { blockId: 2, context, el: null };
  },
};

// <div>class component</div>
compiledTemplates["<div>class component</div>"] = {
  blocks: [
    {
      id: 3,
      el: makeEl("<div>class component</div>"),
      textNodes: [],
      initialize(bt) {
        bt.el = this.el.cloneNode(true) as HTMLElement;
      },
    },
  ],
  fn: (context: RenderContext) => {
    return { blockId: 3, context, el: null };
  },
};

// <div>Hello <t t-esc="name"/></div>
compiledTemplates['<div>Hello <t t-esc="name"/></div>'] = {
  blocks: [
    {
      id: 4,
      el: makeEl("<div>Hello Alex</div>"),
      textNodes: [],
      initialize(bt) {
        bt.el = this.el.cloneNode(true) as HTMLElement;
      },
    },
  ],
  fn: (context: RenderContext) => {
    return { blockId: 4, context, el: null };
  },
};

function makeEl(str: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = str;
  return div.children[0] as HTMLElement;
}
