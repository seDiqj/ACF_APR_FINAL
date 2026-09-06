import StringHelperNode from "./StringHelperNode";

class StringHelperDfs {
  private initNode: StringHelperNode = new StringHelperNode("init");
  private counter: number = 0;
  private counterFlag: boolean = false;

  /**
   *
   * Dfs to check if the input word is a valid word or not.
   *
   * @param node
   * @param searchForChar
   */
  public dfs(searchForChar: string): boolean {
    let isValid: boolean = true;
    let current: StringHelperNode = this.initNode;
    searchForChar = this.removeNoises(searchForChar);

    for (const index in Array.from(searchForChar)) {
      const next = current.nextNodes.find(
        (node) => node.label == searchForChar[index]
      );
      if (next) {
        current = next;

        if (current.nextNodes.length > 0) {
          if (Number(index) == searchForChar.length - 1) {
            if (current.validFlag) {
              break;
            } else {
              isValid = false;
              break;
            }
          }
        }

        continue;
      } else {
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   *
   * Method to creating the graph of each word.
   *
   * @param wordToLearn
   */
  public learn(wordToLearn: string | string[]) {
    let current: StringHelperNode = this.initNode;

    for (const char of wordToLearn) {
      if (current.nextNodes.find((node) => node.label == char)) {
        current = current.nextNodes.find((node) => node.label == char)!;
        continue;
      } else {
        current = current.addNode(new StringHelperNode(char));
        continue;
      }
    }

    current.validFlag = true;
  }

  /**
   * Prints the created graph.
   */
  public printGraph() {
    console.log(this.initNode);
  }

  public numberOfNodes() {
    if (this.counterFlag) {
      console.log(this.counter);
      return;
    }
    this.counterFlag = true;
    this.countNodes(this.initNode);
    console.log(this.counter);
  }

  public getNumberOfNodes() {
    return this.counter;
  }

  private countNodes(node: StringHelperNode) {
    this.counter += node.nextNodes.length;
    for (const nextNode of node.nextNodes) {
      this.countNodes(nextNode);
    }
  }

  private removeNoises(str: string): string {
    return str.toLowerCase();
  }
}

export default StringHelperDfs;

