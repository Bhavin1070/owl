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

type OwlElement = Fn | typeof Component | VNode | string;

export async function mount(C: OwlElement, config: MountConfig): Promise<VNode> {
  // Build a Block
  let node: VNode;
  if (typeof C === "object") {
    node = C;
  } else if (typeof C === "string") {
    node = await render(C, config);
  } else if (C.prototype instanceof Component) {
    node = await buildFromComponent(C as typeof Component);
  } else {
    node = await buildFromFn(C as Fn);
  }
  // patch it to the target
  const fiber = new Fiber(null, node, config.target);
  return scheduler.addFiber(fiber);
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
// Fiber
// -----------------------------------------------------------------------------

class Fiber {
  static nextId: number = 1;
  id = Fiber.nextId++;
  root: Fiber;
  error: Error | null = null;
  isCompleted: boolean = false;
  counter: number = 0;
  vnode: VNode;
  target: HTMLElement | DocumentFragment | null;

  constructor(parent: Fiber | null, vnode: VNode, target: HTMLElement | DocumentFragment | null) {
    this.root = parent || this;
    this.vnode = vnode;
    this.target = target;
  }

  cancel() {}

  complete() {
    const vnode = this.vnode;
    vnode.builder.initialize(vnode);
    this.target!.appendChild(vnode.root!);
  }

  handleError(error: Error) {}
}
// -----------------------------------------------------------------------------
// Scheduler
// -----------------------------------------------------------------------------
interface Task {
  fiber: Fiber;
  callback: (err?: Error) => void;
}

const scheduler = {
  tasks: {} as { [id: number]: Task },
  isRunning: false,
  taskCount: 0,

  start() {
    this.isRunning = true;
    this.scheduleTasks();
  },

  stop() {
    this.isRunning = false;
  },

  addFiber(fiber: Fiber): Promise<VNode> {
    // if the fiber was remapped into a larger rendering fiber, it may not be a
    // root fiber.  But we only want to register root fibers
    fiber = fiber.root;
    return new Promise((resolve, reject) => {
      if (fiber.error) {
        return reject(fiber.error);
      }
      this.taskCount++;
      this.tasks[fiber.id] = {
        fiber,
        callback: () => {
          if (fiber.error) {
            return reject(fiber.error);
          }
          resolve(fiber.vnode);
        },
      };
      if (!this.isRunning) {
        this.start();
      }
    });
  },

  rejectFiber(fiber: Fiber, reason: string) {
    fiber = fiber.root;
    const task = this.tasks[fiber.id];
    if (task) {
      delete this.tasks[fiber.id];
      this.taskCount--;
      fiber.cancel();
      fiber.error = new Error(reason);
      task.callback();
    }
  },

  /**
   * Process all current tasks. This only applies to the fibers that are ready.
   * Other tasks are left unchanged.
   */
  flush() {
    for (let id in this.tasks) {
      let task = this.tasks[id];
      if (task.fiber.isCompleted) {
        task.callback();
        delete this.tasks[id];
        this.taskCount--;
      }
      if (task.fiber.counter === 0) {
        if (!task.fiber.error) {
          try {
            task.fiber.complete();
          } catch (e) {
            task.fiber.handleError(e);
          }
        }
        task.callback();
        delete this.tasks[id];
      }
    }
    if (this.taskCount === 0) {
      this.stop();
    }
  },

  scheduleTasks() {
    requestAnimationFrame(() => {
      this.flush();
      if (this.isRunning) {
        this.scheduleTasks();
      }
    });
  },
};

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
      throw new Error("BOOM" + template);
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

// function patch(node: VNode, target: HTMLElement) {
//   node.builder.initialize(node);
//   target.appendChild(node.root!);
// }

// -----------------------------------------------------------------------------
// TEMP STUFF
// -----------------------------------------------------------------------------
interface CT {
  blocks: Builder[];
  fn: CompiledTemplate;
}
const compiledTemplates: { [str: string]: CT } = {};

// <div>simple vnode</div>
compiledTemplates["<div>simple vnode</div>"] = {
  blocks: [
    {
      id: 1,
      elems: [makeEl("<div>simple vnode</div>")],
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
