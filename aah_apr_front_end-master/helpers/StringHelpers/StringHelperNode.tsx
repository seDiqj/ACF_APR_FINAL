class StringHelperNode {
  /**
   * Main identifier of every node which will be a character.
   */
  public label: string | null = null;

  /**
   * Flag that indicates that if the current graph is a valid word so far or not.
   */
  public validFlag: boolean = false;

  /**
   * Next nodes (childs).
   */
  public nextNodes: StringHelperNode[] = [];

  constructor(label: string) {
    this.label = label;
  }

  /**
   *
   * Adds new node to the nextNodes array and return it.
   *
   * @param node
   * @returns
   */
  public addNode(node: StringHelperNode) {
    this.nextNodes.push(node);
    return node;
  }
}

export default StringHelperNode;
