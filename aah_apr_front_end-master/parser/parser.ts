import ShourtcutNode from "@/classes/ShourtcutNode";
import ShourtcutifyConstants from "@/constants/ShourtcutifyConstants";

class Parser {
  /**
   * The initial Node for each graph.
   */

  private initNode: ShourtcutNode = new ShourtcutNode("initialNode", "init");

  /**
   * All the nodes that were already been as leafs of the created graph so far but is replaced by new nodes.
   */

  private beforeLatest: ShourtcutNode[] = [];

  /**
   * Current leafs of created graph so far.
   */

  private currentLatest: ShourtcutNode[] = [this.initNode];

  /**
   * Shortcutify constants instance for detecting each terminal.
   */

  private constants: ShourtcutifyConstants = new ShourtcutifyConstants();

  /**
   * Input tokanized array.
   * We will set it to be globaly available on entire class.
   */

  private tokanizedArray: string[] = [];

  /**
   * Generates the graph AST.
   * 
   * @param tokanizedArray 
   * @returns void
   */

  public parse(tokanizedArray: string[]) {
    this.tokanizedArray = tokanizedArray;

    let counter: number = 0;

    let loopSwitch: boolean = true;

    while (loopSwitch) {
      if (this.constants.isOpenAccToGrammer(tokanizedArray[counter])) {
        const corresponingClosingTagIndex: number | null =
          this.findClosingTagIndix(this.tokanizedArray, counter);

        if (corresponingClosingTagIndex) {
          const result: {
            hgNodes: ShourtcutNode[];
            hgLeafs: ShourtcutNode[];
          } = this.handleGroup(
            this.tokanizedArray.slice(counter, corresponingClosingTagIndex + 1)
          );

          if (
            counter == 0 ||
            this.constants.isArrowAccToGrammer(this.tokanizedArray[counter - 1])
          ) {
            for (const node of this.currentLatest) {
              node.addChilds(result.hgNodes);
            }

            this.beforeLatest = this.currentLatest;
            this.currentLatest = result.hgLeafs;
          } else if (
            this.constants.isOrTerminalAccToGrammer(
              this.tokanizedArray[counter - 1]
            )
          ) {
            for (const node of this.beforeLatest) {
              node.addChilds(result.hgNodes);
            }

            this.currentLatest = [...this.currentLatest, ...result.hgLeafs];
          }

          counter = corresponingClosingTagIndex + 1;

          if (counter >= this.tokanizedArray.length) {
            loopSwitch = false;
          }
        }
      } else if (
        this.constants.isKeyAccToGrammer(this.tokanizedArray[counter])
      ) {
        if (
          counter === 0 ||
          this.constants.isArrowAccToGrammer(this.tokanizedArray[counter - 1])
        ) {
          const newNode: ShourtcutNode = new ShourtcutNode(
            "key",
            this.tokanizedArray[counter]
          );

          for (const node of this.currentLatest) {
            node.addChild(newNode);
          }

          this.beforeLatest = this.currentLatest;
          this.currentLatest = [newNode];
        } else if (
          this.constants.isOrTerminalAccToGrammer(
            this.tokanizedArray[counter - 1]
          )
        ) {
          const newNode: ShourtcutNode = new ShourtcutNode(
            "key",
            this.tokanizedArray[counter]
          );

          if (this.beforeLatest.length != 0) {
            for (const node of this.beforeLatest) {
              node.addChild(newNode);
            }

            this.currentLatest = [...this.currentLatest, newNode];
          }
        }

        counter++;
        if (counter >= this.tokanizedArray.length) {
          loopSwitch = false;
        }
      } else if (
        this.constants.isArrowAccToGrammer(this.tokanizedArray[counter]) ||
        this.constants.isOrTerminalAccToGrammer(this.tokanizedArray[counter])
      ) {
        counter++;

        if (counter >= this.tokanizedArray.length) {
          loopSwitch = false;
        }
      }
    }

    const init: ShourtcutNode = this.initNode;
    this.initNode = new ShourtcutNode("initialNode", "init");
    this.beforeLatest = [];
    this.currentLatest = [];
    return init;
  }

  /**
   * Generates a group AST and returns the generated nodes and leafs.
   * 
   * @param group
   * @returns hgNodes: Brunches of created sub graph.
   * @returns hgLeafs: Leafs of created sub graph.
   */

  private handleGroup(group: string[]): {hgNodes: ShourtcutNode[];hgLeafs: ShourtcutNode[];} {
    let localNodes: ShourtcutNode[] = [];
    let localBeforeLatest: ShourtcutNode[] = [];
    let localCurrentLatest: ShourtcutNode[] = [];

    let loopSwitch: boolean = true;

    // Remove the start and the end of the input array which are open and closing tags.
    const final: string[] = group.slice(1, group.length - 1);

    // Index counter.
    let counter = 0;

    while (loopSwitch) {

      if (this.constants.isOpenAccToGrammer(final[counter])) {
        const corresponingClosingTagIndex: number | null =
          this.findClosingTagIndix(final, counter);

        if (corresponingClosingTagIndex) {
          const result: {
            hgNodes: ShourtcutNode[];
            hgLeafs: ShourtcutNode[];
          } = this.handleGroup(
            final.slice(counter, corresponingClosingTagIndex + 1)
          );

          if (counter === 0) {
            localNodes = [...localNodes, ...result.hgNodes];
            localCurrentLatest = [...localCurrentLatest, ...result.hgLeafs];
          } else if (this.constants.isArrowAccToGrammer(final[counter - 1])) {
            for (const node of localCurrentLatest) {
              node.addChilds(result.hgNodes);
            }

            localBeforeLatest = localCurrentLatest;
            localCurrentLatest = result.hgLeafs;
          } else if (
            this.constants.isOrTerminalAccToGrammer(final[counter - 1])
          ) {
            if (localBeforeLatest.length != 0) {
              for (const node of localBeforeLatest) {
                node.addChilds(result.hgNodes);
              }
            } else {
              localNodes = [...localNodes, ...result.hgNodes];
            }

            localCurrentLatest = [...localCurrentLatest, ...result.hgLeafs];
          }

          counter = corresponingClosingTagIndex + 1;

          if (counter >= final.length) {
            loopSwitch = false;
          }
        }
      } else if (this.constants.isKeyAccToGrammer(final[counter])) {
        if (counter === 0) {
          const newNode: ShourtcutNode = new ShourtcutNode(
            "key",
            final[counter]
          );

          localNodes = [newNode];
          localCurrentLatest = [newNode];
        } else if (this.constants.isArrowAccToGrammer(final[counter - 1])) {
          const newNode: ShourtcutNode = new ShourtcutNode(
            "key",
            final[counter]
          );

          for (const node of localCurrentLatest) {
            node.addChild(newNode);
          }

          localBeforeLatest = localCurrentLatest;
          localCurrentLatest = [newNode];
        } else if (
          this.constants.isOrTerminalAccToGrammer(final[counter - 1])
        ) {
          const newNode: ShourtcutNode = new ShourtcutNode(
            "key",
            final[counter]
          );

          if (localBeforeLatest.length != 0) {
            for (const node of localBeforeLatest) {
              node.addChild(newNode);
            }

            localCurrentLatest = [...localCurrentLatest, newNode];
          } else {
            localNodes = [...localNodes, newNode];
            localCurrentLatest = [...localCurrentLatest, newNode];
          }
        }

        counter++;

        if (counter >= final.length) {
          loopSwitch = false;
        }
      } else if (
        this.constants.isArrowAccToGrammer(final[counter]) ||
        this.constants.isOrTerminalAccToGrammer(final[counter])
      ) {
        counter++;

        if (counter >= final.length) {
          loopSwitch = false;
        }
      }
    }
    return {
      hgNodes: localNodes,
      hgLeafs: localCurrentLatest,
    };
  }

  /**
   *
   * Returns the closing tag of a spicific open tag.
   *
   * @param tokens
   * @param indexOfOpenTag
   * @returns number : index of corresponing closing tag | null
   */

  public findClosingTagIndix(tokens: string[],indexOfOpenTag: number): number | null {
    // Number of open tags that the algorithm finds on its way when searching for closing tag.
    let numOfOpenTags: number = 0;

    for (let i: number = indexOfOpenTag + 1; i < tokens.length; i++) {
      // If the current token is a open tag increase the value of numOfOpenTags variable and continue.
      if (this.constants.isOpenAccToGrammer(tokens[i])) {
        numOfOpenTags++;
        continue;
      } else if (this.constants.isCloseAccToGrammer(tokens[i])) {
        /**
         * If the current token is a closing tag but the value of numOfOpenTags variable is no equal to zero
         * decrese the value of it and continue.
         *
         * otherwise return the i which will be the index of founded closing tag in toknized array.
         */
        if (numOfOpenTags != 0) {
          numOfOpenTags--;
          continue;
        } else if (numOfOpenTags == 0) {
          return i;
        }
      }
    }

    // If the corresponding closing tag was not found return null.

    return null;
  }
}

export default Parser;
