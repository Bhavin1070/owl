import { VNode, patch } from "./vdom";
import { Fiber } from "./fiber";
import { scheduler } from "./scheduler";
import { RenderContext, renderTemplate } from "./qweb";

// -----------------------------------------------------------------------------
// mount
// -----------------------------------------------------------------------------

interface MountConfig {
  target: HTMLElement;
}

export function mount(fiber: Fiber, config: MountConfig): Promise<VNode> {
  return scheduler.addFiber(fiber).then((vnode) => {
    patch(config.target, vnode);
    return vnode;
  });
}

// -----------------------------------------------------------------------------
// render
// -----------------------------------------------------------------------------

export function render(template: string, context: RenderContext = {}): Fiber {
  const fiber = new Fiber(null);
  renderTemplate(template, fiber, context);
  return fiber;
}
