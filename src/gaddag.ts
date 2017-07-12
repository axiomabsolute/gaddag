type Dictionary<T> = { [index: string]: T }

/**
 * Creates a shallow clone of a dictionary 
 * @param dict Dictionary to clone
 */
function cloneDict<T>(dict: Dictionary<T>): Dictionary<T> {
  let result: Dictionary<T> = {};
  Object.getOwnPropertyNames(dict).forEach(k => result[k] = dict[k]);
  return result;
}

/**
 * Reverse a string; reverse('hello') -> 'olleh'
 * @param word Word to reverse
 */
function reverse(word: string) {
  return word.split('').reverse().join('');
}

/**
 * Returns values of a dictionary 
 * @param dict Dict to return values of
 */
function values<T>(dict: Dictionary<T>): T[] {
  return Object.keys(dict).map(k => dict[k]);
}

/**
 * Returns the sum of an array of numbers
 * @param nums Array of numbers to sum
 */
function sum(nums: number[]): number {
  return nums.reduce( (p, n) => p + n, 0);
}

/**
 * Given a nested array, return a flattened array containing all members
 * @param arrays Array of arrays to flatten
 */
function flatten<T>(arrays: T[][]): T[] {
  return [].concat.apply([], arrays);
}

/**
 * Returns a new array with duplicates removed
 * @param arr Array to deduplicate
 */
function unique<T>(arr: T[]): T[] {
  return arr.filter( (v, i) => arr.indexOf(v) === i );
}

/**
 * A single node of a GADDAG data structure
 */
export class GaddagNode {
  private countFlag: Date;
  constructor(public children: Dictionary<GaddagNode> = {}, public isCompleteWord: boolean = false) { }

  /**
   * Sets the counter for this node and returns 1 if the node was not already counted
   * @param flag The flag to use to determine whether a node has been counted
   */
  public count(flag: Date): number {
    if (this.countFlag != flag) {
      this.countFlag = flag;
      return 1;
    }
    return 0;
  }
}

/**
 * A GADDAG data structure
 */
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
    // Just find all suffix paths
    return this.wordsForSuffix("");
  }

  /**
   * Returns all words matching a given hand
   * @param hand Hand to track whlie walking GADDAG
   */
  public wordsForHand(hand: string): string[] {
    let seed: Dictionary<number> = {};
    let letters = hand.split('')
      .reduce( (result, letter) => {
        if (!(letter in result)) {
          result[letter] = 0;
        }
        result[letter] = result[letter] + 1;
        return result;
      }, seed);
      return Gaddag.walkWordsForHandFromNode(letters, this.root, "");
  }

  private static walkWordsForHandFromNode(hand: Dictionary<number>, node: GaddagNode, progress: string): string[] {
    if (sum(values(hand)) === 0) {
      return  node.isCompleteWord ? [progress] : [];
    }
    let childrenInHand = Object.keys(node.children).filter( k => k in hand && hand[k] > 0);
    if (childrenInHand.length === 0) {
      return  node.isCompleteWord ? [progress] : [];
    } 
    return flatten(childrenInHand.map( k => {
      let newHand = cloneDict(hand);
      newHand[k] = newHand[k] - 1;
      return Gaddag.walkWordsForHandFromNode(newHand, node.children[k], k + progress);
    }));
  }

  /**
   * Walk the GADDAG and generate all words containing the substring
   * @param substring Substring to search for
   */
  public wordsContaining(substring: string): string[] {
    return Gaddag.wordsContainingFromNode(substring, reverse(substring), this.root);
  }

  /**
   * Walk the GADDAG treating the substring as a prefix, then starting from the node where the "prefix" has run out,
   * keep walking till a turn is found, then find all prefixes and suffixes and add them to the "prefix"
   * 
   * @param substring 
   * @param gnirtsbus 
   * @param node 
   */
  private static wordsContainingFromNode(substring: string, gnirtsbus: string, node: GaddagNode): string[] {
    if (gnirtsbus.length === 0) {
      let result = node.isCompleteWord ? [ substring ] : [];
      let suffixes = flatten(Object.keys(node.children).map(key => {
        if (key === Gaddag.TurnToken) {
          return Gaddag.walkSuffixesFromNode(node.children[key]).map(s => substring + s);
        }
        return Gaddag.wordsContainingFromNode(key + substring, gnirtsbus, node.children[key]);
      }));
      return unique(result.concat(suffixes));
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
   * Check whether the given word is in the GADDAG
   * @param word Word to check
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
   * Adds a word to the GADDAG
   * @param word Word to add
   */
  public addWord(word: string) {
    if (word.length < 2) { return; }
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
