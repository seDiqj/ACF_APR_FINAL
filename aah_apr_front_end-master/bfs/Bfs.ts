import ShourtcutNode from "@/classes/ShourtcutNode";

class Bfs {
  private childsList: string[] = [];

  public getChildsValues(graph: ShourtcutNode) {
    this.bfs(graph);

    const temp: string[] = this.childsList;
    this.childsList = [];
    return temp;
  }

  private bfs(graph: ShourtcutNode) {
    for (const child of graph.childNodes) {
      this.childsList.push(child.value);
    }

    for (const child of graph.childNodes) {
      this.bfs(child);
    }
  }
}

export default Bfs;
