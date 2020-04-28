import { VContentNode, NodeType } from "./vdom";

export class Fiber {
  static nextId: number = 1;

  id = Fiber.nextId++;
  root: Fiber;
  isCompleted: boolean = false;
  counter: number = 0;
  vnode: VContentNode = { type: NodeType.Content, children: [] };

  constructor(parent: Fiber | null) {
    this.root = parent || this;
  }
}
