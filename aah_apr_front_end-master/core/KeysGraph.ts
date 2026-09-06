export default class KeyGraph {
  private graph: Record<string, string[]> = {};

  public addNewNode(node: string): void {
    this.graph[node] = [];
  }

  public addEdge(from: string, to: string, directed: boolean = false): void {
    this.graph[from].push(to);
    if (directed) {
      this.graph[to].push(from);
    }
  }

  public removeNode(node: string): void {
    delete this.graph[node];
  }

  public removeEdge(from: string, to: string, directed: boolean = false) {
    this.graph[from].filter((item) => item != to);
    if (directed) {
      this.graph[to].filter((item) => item != from);
    }
  }
}
