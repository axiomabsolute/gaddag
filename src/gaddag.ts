type Dictionary<T> = { [index: string]: T }

function reverse(word: string) {
  return word.split('').reverse().join('');
}

function values<T>(dict: Dictionary<T>): T[] {
  return Object.keys(dict).map(k => dict[k]);
}

export class GaddagNode {
  constructor(public children: Dictionary<GaddagNode> = {}, public isCompleteWord: boolean = false) { }
}

export class Gaddag {
  public root: GaddagNode;
  public static TurnToken = '>';

  /**
   * Returns all words in the gaddag.
   */
  public allWords(): string[] {
    return [];
  }

  /**
   * 
   * @param word 
   */
  public wordsForPrefix(word: string): string[] {
    return [];
  }

  /**
   * 
   * @param word 
   */
  public checkWord(word: string): boolean {
    return false;
  }

  /**
   * Adds a word to the gaddag
   */
  public addWord(word: string) {
    let reversed = reverse(word); // asked -> deksa
    let degenerateCaseNode = this.addPath(this.root, reversed);
    degenerateCaseNode.isCompleteWord = true;

    let baseCaseNode = this.addPath(this.root, reversed.slice(1)) // eksa
    let baseCaseTurn = new GaddagNode({});
    baseCaseNode.children[Gaddag.TurnToken] = baseCaseTurn;
    let previousNode = this.addPath(baseCaseTurn, word.slice(-1)); // d
    previousNode.isCompleteWord = true;

    for (var start = 2; start < reversed.length; start++) {
      let nextBaseNode = this.addPath(this.root, reversed.slice(start)); // ksa
      let nextCaseTurn = new GaddagNode({});
      nextBaseNode.children[Gaddag.TurnToken] = nextCaseTurn;
      let nextNode = this.addPath(nextCaseTurn, word.slice(-1 * start, (-1 * start) + 1)) // e
      nextNode.children[word[start + 1]] = previousNode;
      previousNode = nextNode;
    }
  }

  private addPath(startingNode: GaddagNode, word: string) {
    return word.split('').reduce((prevNode, char) => {
      if (!prevNode.children[char]) {
        let newNode = new GaddagNode();
        prevNode.children[char] = newNode;
        return newNode;
      }
      return prevNode.children[char];
    }, startingNode);
  }

  constructor() {
    this.root = new GaddagNode();
  }
}
