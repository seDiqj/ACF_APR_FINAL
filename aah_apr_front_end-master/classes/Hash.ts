import Bfs from "@/bfs/Bfs";
import ShourtcutNode from "./ShourtcutNode";

class Hash {
  private bfsInstance: Bfs = new Bfs();

  private graphHash: string = "";

  public getNodeHash(node: ShourtcutNode) {
    const childsValues: string[] = this.bfsInstance.getChildsValues(node);

    for (const value of childsValues) {
      this.graphHash += value.charCodeAt(0).toString();
    }

    const temp: string = this.graphHash;
    this.graphHash = "";
    return temp;
  }
}

export default Hash;
