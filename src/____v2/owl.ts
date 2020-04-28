import { VNode, patch, VContentNode } from "./vdom";
import { Fiber } from "./fiber";
import { scheduler } from "./scheduler";
import { RenderContext, renderTemplate } from "./qweb";
import { Component } from "./component";

// -----------------------------------------------------------------------------
// mount
// -----------------------------------------------------------------------------
type Fn = (env, props) => FnInstance;
type FnInstance = (props: any) => VNode;

interface MountConfig {
  target: HTMLElement;
}

export function mount(fn: Fn, config: MountConfig): Promise<VNode>;
export function mount(vnode: VNode, config: MountConfig): Promise<VNode>;
export function mount(Comp: typeof Component, config: MountConfig): Promise<VNode>;
export function mount(elem: any, config: MountConfig): Promise<VNode> {
  let vnode: VContentNode;

  if (typeof elem === "object") {
    vnode = elem;
  } else if (elem.prototype instanceof Component) {
    let template: string = (elem as typeof Component).template;
    const c = new (elem as typeof Component)();
    vnode = render(template, c) as VContentNode;
  } else {
    const fnInstance = (elem as Fn)({}, {});
    vnode = fnInstance({}) as VContentNode;
  }
  const fiber = vnode.data;
  return scheduler.addFiber(fiber).then(() => {
    patch(config.target, vnode);
    return vnode;
  });
}

// -----------------------------------------------------------------------------
// render
// -----------------------------------------------------------------------------

export function render(template: string, context: RenderContext = {}): VNode {
  const fiber = new Fiber(null);
  return renderTemplate(template, fiber, context);
}
