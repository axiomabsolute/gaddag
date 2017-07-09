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

function unique<T>(arr: T[]): T[] {
  return arr.filter( (v, i) => arr.indexOf(v) === i );
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

  /**
   * Returns the unminimized size
   */
  public rawSize(): number {
    return this.allWords().reduce( (p, n) => p + (n.length * n.length), 0);
  }

  private static sizeNode(node: GaddagNode, flag: Date): number {
    return node.count(flag) + values(node.children)
      .map(n => Gaddag.sizeNode(n, flag))
      .reduce((p, n) => p + n, 0);
  }

  /**
   * Calculates the compression rate based off of the unminimized and minimized sizes
   */
  public compressionRate(): number {
    return this.size() / this.rawSize();
  }

  /**
   * Returns all words in the gaddag.
   */
  public allWords(): string[] {
    let size = this.size();
    if (size > 100000) {
      throw `GADDAG too large: size ${size}`;
    }
    // Just find all suffix paths
    return this.wordsForSuffix("");
  }

  public wordsContaining(substring: string): string[] {
    return Gaddag.wordsContainingFromNode(substring, reverse(substring), this.root);
  }

  /**
   * Walk the GADDAG treating the substring as a prefix, then starting from the node where the "prefix" has run out, find
   * all prefixes and suffixes and add them to the "prefix"
   * 
   * @param substring 
   * @param gnirtsbus 
   * @param node 
   */
  private static wordsContainingFromNode(substring: string, gnirtsbus: string, node: GaddagNode): string[] {
    if (gnirtsbus.length === 0) {
      let result = node.isCompleteWord ? [ substring ] : [];
      let prefixes = Gaddag.wordsForPrefixFromNode(substring, "", node);
      let suffixes = Gaddag.walkSuffixesFromNode(node).map(suff => substring + suff);
      return unique(result.concat(prefixes, suffixes));
    }
    let firstChar = gnirtsbus[0];
    if (!(firstChar in node.children)) { return []; }
    return Gaddag.wordsContainingFromNode(substring, gnirtsbus.substr(1), node.children[firstChar]);
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
