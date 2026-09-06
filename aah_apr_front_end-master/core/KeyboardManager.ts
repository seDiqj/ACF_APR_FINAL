"use client";

import Hash from "@/classes/Hash";
import ShourtcutNode from "@/classes/ShourtcutNode";
import Dfs from "@/dfs/Dfs";
import Lexer from "@/lexer/lexer";
import Parser from "@/parser/parser";
import "@/types/ShourtcutifyTypes";

class KeyboardManager {
  /**
   * All registred shortcut graphs for keydown event.
   */

  private registeredKeysGraphToKeydownEvent: ShourtcutNode[] = [];

  /**
   * All registred shortcut graphs for keyup event.
   */

  private registeredKeysGraphToKeyupEvent: ShourtcutNode[] = [];

  /**
   * Lexer class instance for toknizing the shortcut.
   */

  private lexerInstance: Lexer = new Lexer();

  /**
   * Dfs class instance to perform depth first search algorithm on shortcut graph.
   */

  private dfs: Dfs = new Dfs();

  /**
   * Dictionary for saving all keydown callbacks and connecting them to spicific hash.
   */

  private keyDownMap: Partial<Record<string, VoidFunction>> = {};

  /**
   * Dictionary for saving all keyup callbacks and connecting them to spicific hash.
   */

  private keyUpMap: Partial<Record<string, VoidFunction>> = {};

  /**
   * Shortcuts that should be prevent.
   */

  private shouldPreventKeys: string[] = [];

  /**
   * All keys which are pressed at the same time will be placed into this array.
   */

  private pressedKeys: string[] = [];

  /**
   * All keys which are released will be placed into this array.
   */

  private releasedKeys: string[] = [];

  /**
   * Amount of time that indicats when the garbage collector method should clear the releasedKeys array.
   */

  private garbageCollectorTimeout: number = 0;

  /**
   * Keyboard instance to make it available globaly in entire class.
   */

  private globalEvent: KeyboardEvent | null = null;

  /**
   * Binding the main handler and add keydown and keyup event on window.
   */

  constructor() {
    this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
    window.addEventListener("keydown", this.handleKeyboardEvent);
    window.addEventListener("keyup", this.handleKeyboardEvent);
  }

  /**
   * Register's shortcuts according to (type) parameter.
   *
   * @param key
   * @param callback
   * @param type
   */

  public registerKey(
    key: string,
    callback: VoidFunction,
    type: "keydown" | "keyup" = "keydown"
  ) {
    const keyGraph: ShourtcutNode = this.getKeyGraph(key);
    const keyHash: string = this.getGraphHash(keyGraph);
    if (type == "keydown" && !this.keyDownMap[keyHash]) {
      this.registeredKeysGraphToKeydownEvent.push(keyGraph);
      this.keyDownMap[keyHash] = callback;
    } else if (type == "keyup" && !this.keyUpMap[keyHash]) {
      this.registeredKeysGraphToKeyupEvent.push(keyGraph);
      this.keyUpMap[keyHash] = callback;
    } else {
      throw new Error(
        `Invalid Event Type Error: Expected (keydown or keyup) but got ${type}`
      );
    }
  }

  /**
   * Register's the keys that should prevent its default action.
   *
   * @param key
   */

  public registerShouldPrevents(key: string | string[]) {
    if (Array.isArray(key)) {
      for (const k of key) {
        const keyHash: string = this.getKeyHash(k);
        this.shouldPreventKeys.push(keyHash);
      }
    } else {
      const keyHash: string = this.getKeyHash(key);
      this.shouldPreventKeys.push(keyHash);
    }
  }

  /**
   * Main event handler.
   *
   * It will decides that which one of the events (keydown | keyup) should be take care of.
   *
   * @param e
   */

  private handleKeyboardEvent(e: KeyboardEvent) {
    this.globalEvent = e;
    const key = e.key.toLowerCase();
    if (e.type == "keydown" && this.pressedKeys.at(-1) != key) {
      this.takeCareOfKeyDownEvent(key);
    } else if (e.type == "keyup") {
      this.takeCareOfKeyUpEvent(key);
    }
  }

  /**
   * Handles the keydown events.
   *
   * @param key
   */

  private takeCareOfKeyDownEvent(key: string) {
    this.pressedKeys.push(key);

    const shourtcut: string = this.pressedKeys.join("->");

    const callback: VoidFunction | null =
      this.getKeyDownEventCallback(shourtcut);

    if (callback) {
      this.globalEvent?.preventDefault();
      callback();
    }
  }

  /**
   * Handls the keyup events.
   *
   * @param key
   */

  private takeCareOfKeyUpEvent(key: string) {
    this.pressedKeys = this.pressedKeys.slice(0, this.pressedKeys.length - 1);

    this.releasedKeys.push(key);

    this.garbageCollectorTimeout = 3000;

    const shourtcut: string = this.releasedKeys.join("->");

    const callback: VoidFunction | null = this.getKeyUpEventCallback(shourtcut);

    if (callback) {
      this.globalEvent?.preventDefault();
      callback();
      this.garbageCollector();
    } else {
      setTimeout(() => this.garbageCollector(), this.garbageCollectorTimeout);
    }
  }

  /**
   * Searchs for spicific key, callback in registeredKeysGraphToKeydownEvent array.
   *
   * @param key
   * @returns VoidFunction | null
   */

  private getKeyDownEventCallback(key: string): VoidFunction | null {
    const correspondingGraph: ShourtcutNode | false = this.dfs.findShourtcut(
      this.registeredKeysGraphToKeydownEvent,
      key
    );

    if (correspondingGraph) {
      const graphHash: string = this.getGraphHash(correspondingGraph);
      if (this.keyDownMap[graphHash]) {
        return this.keyDownMap[graphHash];
      }
    }

    return null;
  }

  /**
   * Searchs for spicific key, callback in registeredKeysGraphToKeyupEvent array.
   *
   * @param key
   * @returns VoidFunction | null
   */

  private getKeyUpEventCallback(key: string): VoidFunction | null {
    const correspondingGraph: ShourtcutNode | false = this.dfs.findShourtcut(
      this.registeredKeysGraphToKeyupEvent,
      key
    );

    if (correspondingGraph) {
      const graphHash: string = this.getGraphHash(correspondingGraph);
      if (this.keyUpMap[graphHash]) {
        return this.keyUpMap[graphHash];
      }
    }

    return null;
  }

  /**
   * Will clear the releasedKeys and pressedKeys arrays.
   *
   * @returns void
   */

  private garbageCollector(): void {
    this.releasedKeys = [];
    this.pressedKeys = [];
  }

  /**
   * Returns the hash of key graph as its own hash.
   *
   * @param key
   * @returns string
   */

  private getKeyHash(key: string): string {
    return this.getGraphHash(this.getKeyGraph(key));
  }

  /**
   * Returns graph's hash
   *
   * @param graph
   * @returns string
   */

  private getGraphHash(graph: ShourtcutNode): string {
    return new Hash().getNodeHash(graph);
  }

  /**
   * Returns key graph.
   *
   * @param key
   * @returns ShortcutNode
   */

  private getKeyGraph(key: string): ShourtcutNode {
    return new Parser().parse(this.getTokanizedKey(key));
  }

  /**
   * Returns tokanized version of key.
   *
   * @param key
   * @returns array
   */

  private getTokanizedKey(key: string): string[] {
    return this.lexerInstance.getFullyString(key);
  }

  /**
   * Removes all events from window.
   */

  public destroy() {
    window.removeEventListener("keydown", this.handleKeyboardEvent);
    window.removeEventListener("keyup", this.handleKeyboardEvent);
  }
}

export default KeyboardManager;
