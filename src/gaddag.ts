type Dictionary<T> = { [index: string]: T }

function reverse(word: string) {
  return word.split('').reverse().join('');
}

function values<T>(dict: Dictionary<T>): T[] {
  return Object.keys(dict).map(k => dict[k]);
}

function flatten<T>(arrays: T[][]): T[] {
  return [].concat.apply([], arrays);
}

export class GaddagNode {
  private countFlag: Date;
  constructor(public children: Dictionary<GaddagNode> = {}, public isCompleteWord: boolean = false) { }

  public count(flag: Date): number {
    if (this.countFlag != flag) {
      this.countFlag = flag;
      return 1;
    }
    return 0;
  }
}

export class Gaddag {
  public root: GaddagNode;
  public static TurnToken = '>';

  /**
   * Returns the size - the number of nodes of the graph
   */
  public size(): number {
    return Gaddag.sizeNode(this.root, new Date());
  }

  private static sizeNode(node: GaddagNode, flag: Date): number {
    return node.count(flag) + values(node.children)
      .map(n => Gaddag.sizeNode(n, flag))
      .reduce((p, n) => p + n, 0);
  }

  /**
   * Returns all words in the gaddag.
   */
  public allWords(): string[] {
    let size = this.size();
    if (size > 100) {
      throw `GADDAG too large: size ${size}`;
    }
    // Just find all suffix paths
    return this.wordsForSuffix("");
  }

  /**
   * Return all words starting with the provided prefix
   * @param prefix 
   */
  public wordsForPrefix(prefix: string): string[] {
    return Gaddag.wordsForPrefixFromNode(prefix, reverse(prefix), this.root);
  }

  private static wordsForPrefixFromNode(prefix: string, xiferp: string, node: GaddagNode): string[] {
    if (xiferp.length === 0) {
      let result = node.isCompleteWord ? [ prefix ] : [];
      if (!(Gaddag.TurnToken in node.children)) { return result; }
      return result.concat(Gaddag.walkSuffixesFromNode(node.children[Gaddag.TurnToken]).map(s => prefix + s));
    }
    let firstChar = xiferp[0];
    if (!(firstChar in node.children)) { return []; }
    return Gaddag.wordsForPrefixFromNode(prefix, xiferp.substr(1), node.children[firstChar]);
  }

  private static walkSuffixesFromNode(node: GaddagNode): string[] {
    if (node.isCompleteWord) { return ['']; }
    return flatten(Object.keys(node.children).map(k => Gaddag.walkSuffixesFromNode(node.children[k]).map(r => k + r)));
  }

  /**
   * Return all words ending with the provided suffix
   * @param suffix 
   */
  public wordsForSuffix(suffix: string): string[] {
    return Gaddag.wordsForSuffixFromNode(suffix, reverse(suffix), this.root);
  }

  private static wordsForSuffixFromNode(suffix: string, xiffus: string, node: GaddagNode): string[] {
    if (xiffus.length === 0) {
      let result = node.isCompleteWord ? [ suffix ] : [];
      return result.concat( // If the suffix alone is a complete word, include it in the results
        flatten( // For each child node, find *their* suffixes, flatten, and prepend them to the suffixes found so far
          Object.keys(node.children)
            .filter(key => key != Gaddag.TurnToken) // We want only the complete suffix paths - no turns
            .map(key => Gaddag.wordsForSuffixFromNode(key + suffix, xiffus, node.children[key]))))
    }
    let firstChar = xiffus[0];
    if (!(firstChar in node.children)) { return []; }
    return Gaddag.wordsForSuffixFromNode(suffix, xiffus.substr(1), node.children[firstChar]);
  }

  /**
   * 
   * @param word 
   */
  public checkWord(word: string): boolean {
    return Gaddag.checkWordNode(reverse(word), this.root);
  }

  private static checkWordNode(word: string, node: GaddagNode): boolean {
    let firstChar = word[0];
    if (!(firstChar in node.children)) { return false; }
    let nextNode = node.children[firstChar];
    if (word.length === 1 && !nextNode.isCompleteWord) { return false; } 
    if (word.length === 1 && nextNode.isCompleteWord) { return true; }
    return Gaddag.checkWordNode(word.substr(1), nextNode);
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
      let nextPrefix = reversed.slice(start);
      let newFinalLetter = reversed[start-1];
      let previousFinalLetter = reversed[start-2];

      let nextBaseNode = this.addPath(this.root, nextPrefix); // ksa
      let nextCaseTurn = nextBaseNode.children[Gaddag.TurnToken] || new GaddagNode({});
      nextBaseNode.children[Gaddag.TurnToken] = nextCaseTurn;
      let nextNode = this.addPath(nextCaseTurn, newFinalLetter) // e
      nextNode.children[previousFinalLetter] = previousNode;
      previousNode = nextNode;
    }
  }

  private addPath(startingNode: GaddagNode, word: string) {
    return word.split('').reduce((prevNode, char) => {
      if ( !(char in prevNode.children) ) {
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
