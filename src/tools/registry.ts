import type { SwarmEngine } from "../core/engine";
import type { SwarmCursor, SwarmTask } from "../core/types";

export interface SwarmToolPlugin {
  readonly type: string;
  runLead(
    engine: SwarmEngine,
    cursor: SwarmCursor,
    task: Required<SwarmTask>
  ): Generator<void, void, number>;
  runAssistant?(
    engine: SwarmEngine,
    cursor: SwarmCursor,
    task: Required<SwarmTask>,
    slotIdx: number
  ): Generator<void, void, number>;
}

/**
 * Pluggable Tool Registry allowing custom 2D/3D construction tools and
 * multi-agent squad choreographies to be registered modularly.
 */
export class SwarmToolRegistry {
  private plugins = new Map<string, SwarmToolPlugin>();

  public register(plugin: SwarmToolPlugin): void {
    this.plugins.set(plugin.type, plugin);
  }

  public get(type: string): SwarmToolPlugin | undefined {
    return this.plugins.get(type);
  }

  public has(type: string): boolean {
    return this.plugins.has(type);
  }
}

export const defaultToolRegistry = new SwarmToolRegistry();
