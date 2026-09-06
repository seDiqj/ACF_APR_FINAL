import ShourtcutNode from "@/classes/ShourtcutNode";

class Dfs {
  /**
   * Saves the shortcut that has been found so far.
   */

  private currentFoundShourtcut: string[] = [];

  /**
   * The expected shortcut that dfs should search for.
   *
   * We set this property make the expectation available in entir class.
   */

  private expectedShourtcut: string = "";

  /**
   * Switch for checking if the expected shortcut is found or not.
   */

  private found: boolean = false;

  /**
   *
   * The base method to search for expected shortcut.
   *
   * When the user clicks on one or more keys it will searchs the for corresponding shourtcut throw the graph list.
   *
   * @param graphsList
   * @param expectedShourtcut
   * @returns initNode | false
   */

  public findShourtcut(
    graphsList: ShourtcutNode[],
    expectedShourtcut: string
  ): ShourtcutNode | false {
    // Setting the expected shortcut to expectedShortcut property to be available globaly on entire class.
    this.expectedShourtcut = expectedShourtcut;

    // The first node will be initNode which is just a helper node for graph and will be not effective on shortcut searching.
    for (const initNode of graphsList) {
      this.dfs(initNode);

      /**
       * If found property is true it means that the current graph is the one which we are searching for so we will return it.
       *
       * In this case we will also empty the currentFoundShortcut property and set the found property to false
       * which if we use a single instance of this class it should be empty in first iterations.
       *
       */

      if (this.found) {
        this.currentFoundShourtcut = [];
        this.found = false;
        return initNode;
      }
    }

    /**
     * If the code reaches to this point it means that the expected shortcut was not found so we will set the
     * currentFoundShourtcut to a empty array and return false.
     */

    this.currentFoundShourtcut = [];
    return false;
  }

  private dfs(node: ShourtcutNode) {
    if (this.found) {
      return;
    }
    for (const child of node.childNodes) {
      this.currentFoundShourtcut.push(child.value);
      if (child.childNodes.length == 0) {
        if (this.currentFoundShourtcut.join("->") == this.expectedShourtcut) {
          this.found = true;
          this.currentFoundShourtcut = [];
          return;
        } else {
          this.currentFoundShourtcut = this.currentFoundShourtcut.slice(
            0,
            this.currentFoundShourtcut.length - 1
          );
          continue;
        }
      }
      this.dfs(child);
    }
    this.currentFoundShourtcut = this.currentFoundShourtcut.slice(
      0,
      this.currentFoundShourtcut.length - 1
    );
  }
}

export default Dfs;
