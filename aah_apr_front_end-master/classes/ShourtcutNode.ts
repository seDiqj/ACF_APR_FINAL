class ShourtcutNode {
  private type: string;
  public value: string;
  public childNodes: ShourtcutNode[];

  constructor(type: string, value: string, childNodes?: ShourtcutNode[]) {
    this.type = type;
    this.value = value;
    this.childNodes = childNodes ?? [];
  }

  public addChild(child: ShourtcutNode): void {
    this.childNodes.push(child);
  }

  public addChilds(childList: ShourtcutNode[]): void {
    this.childNodes = [...this.childNodes, ...childList];
  }

  public removeLatestChild(): void {
    this.childNodes.pop();
  }

  public hasAnyChild(): boolean {
    return this.childNodes.length >= 1;
  }
}

export default ShourtcutNode;
