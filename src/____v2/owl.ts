import { patch, VContentNode, update as updateVNode } from "./vdom";
import { Fiber } from "./fiber";
import { scheduler } from "./scheduler";
import { RenderContext, renderTemplate } from "./qweb";
import { Component } from "./component";

export interface Meta {
  fiber: Fiber;
  template: string;
}

export type VTree = VContentNode<Meta>;

// -----------------------------------------------------------------------------
// mount
// -----------------------------------------------------------------------------
type Fn = (env, props) => FnInstance;
type FnInstance = (props: any) => VTree;

interface MountConfig {
  target: HTMLElement;
}

export function mount(fn: Fn, config: MountConfig): Promise<VTree>;
export function mount(vnode: VTree, config: MountConfig): Promise<VTree>;
export function mount(Comp: typeof Component, config: MountConfig): Promise<VTree>;
export function mount(elem: any, config: MountConfig): Promise<VTree> {
  let vnode: VTree;

  if (typeof elem === "object") {
    vnode = elem;
  } else if (elem.prototype instanceof Component) {
    let template: string = (elem as typeof Component).template;
    const c = new (elem as typeof Component)();
    vnode = render(template, c);
  } else {
    const fnInstance = (elem as Fn)({}, {});
    vnode = fnInstance({});
  }
  const fiber = vnode.data.fiber;
  return scheduler.addFiber(fiber).then(() => {
    const fragment = document.createDocumentFragment();
    patch(fragment, vnode);
    config.target.appendChild(fragment);
    return vnode;
  });
}

// -----------------------------------------------------------------------------
// render
// -----------------------------------------------------------------------------

export function render(template: string, context: RenderContext = {}): VTree {
  const fiber = new Fiber(null);
  return renderTemplate(template, fiber, context);
}

// -----------------------------------------------------------------------------
// update
// -----------------------------------------------------------------------------

export function update(vnode: VTree, context: RenderContext = {}): Promise<VTree> {
  const template = vnode.data.template;
  const fiber = new Fiber(null);
  const newVNode = renderTemplate(template, fiber, context);
  return scheduler.addFiber(fiber).then(() => {
    return updateVNode(vnode, newVNode) as VTree;
  });
}
