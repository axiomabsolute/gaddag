export class Dictionary<T> {
  [index: string]: T;

  public static ToLookup<T, U>(items: T[], keySelector: (item: T) => string, valueSelector: (item: T) => U): Dictionary<U> {
    return items.reduce((result, item) => {
      result[keySelector(item)] = valueSelector(item);
      return result;
    }, new Dictionary<U>());
  }
}

/**
 * Monotonically increasing ID generator generator
 * @returns A generator which produces a monitonically increasing ID when called
 */
function makeIdGenerator(): () => number {
  var count = -1;
  return () => {
    count = count + 1;
    return count;
  };
}

/**
 * Returns all permutations of a source array
 * @param inputArr array to permute
 * @returns array of permutations of original array items
 */
export function permute<T>(inputArr: T[]) {
  let result: T[][] = [];

  const permuteInner = (arr: T[], m: T[] = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permuteInner(curr.slice(), m.concat(next))
     }
   }
 }

 permuteInner(inputArr)

 return result;
}

/**
 * Creates a shallow clone of a dictionary 
 * @param dict Dictionary to clone
 * @returns Cloned dictionary
 */
function cloneDict<T>(dict: Dictionary<T>): Dictionary<T> {
  let result: Dictionary<T> = {};
  Object.getOwnPropertyNames(dict).forEach(k => result[k] = dict[k]);
  return result;
}

/**
 * Reverse a string; reverse('hello') -> 'olleh'
 * @param word Word to reverse
 * @returns reversed word
 */
function reverse(word: string) {
  return word.split('').reverse().join('');
}

/**
 * Returns values of a dictionary 
 * @param dict Dict to return values of
 * @returns values of the dictionary
 */
export function values<T>(dict: Dictionary<T>): T[] {
  return Object.keys(dict).map(k => dict[k]);
}

/**
 * Returns array of key-value paris
 * @param dict dict to map over
 */
export function keyValuePairs<T>(dict: Dictionary<T>): {key: string, value: T}[] {
  return Object.keys(dict).map(k => { return {key: k, value: dict[k]}; });
}

/**
 * Returns the sum of an array of numbers
 * @param nums Array of numbers to sum
 * @returns sum of values of array
 */
function sum(nums: number[]): number {
  return nums.reduce( (p, n) => p + n, 0);
}

/**
 * Given a nested array, return a flattened array containing all members
 * @param arrays Array of arrays to flatten
 * @returns a flattened array
 */
export function flatten<T>(arrays: T[][]): T[] {
  return [].concat.apply([], arrays);
}

/**
 * Returns a new array with duplicates removed
 * @param arr Array to deduplicate
 * @returns an array of unique members
 */
export function unique<T>(arr: T[]): T[] {
  return arr.filter( (v, i) => arr.indexOf(v) === i );
}

/**
 * Represents an edge in the Gaddag
 */
export class GaddagEdge {
  /**
   * @param source ID of source node
   * @param target ID of target node
   */
  constructor(public source: number, public target: number) { }
}

/**
 * A single node of a GADDAG data structure
 */
export class GaddagNode {
  private countFlag: Date;
  public meta: Dictionary<any>;

  /**
   * Remove all keys from meta data dictionary
   */
  public clearMeta(){
    Object.keys(this.meta).forEach(k => delete this.meta[k]);
  }

  constructor(public id: number, public token: string, public children: Dictionary<GaddagNode> = {}, public isCompleteWord: boolean = false) {
    this.meta = {};
  }

  /**
   * Sets the counter for this node and returns 1 if the node was not already counted
   * @param flag The flag to use to determine whether a node has been counted
   * @returns value to count - 0 if already counted, 1 otherwise
   */
  public count(flag: Date): number {
    if (this.countFlag != flag) {
      this.countFlag = flag;
      return 1;
    }
    return 0;
  }

  /**
   * Determines whether a node should be included, returning false if it has already been visited, otherwise true
   * @param flag The flag to use to determine whether a node has already been included
   * @returns boolean indicating whether the node should be included - false if already visited, true otherwise
   */
  public include(flag: Date): boolean {
    if (this.countFlag != flag) {
      this.countFlag = flag;
      return true
    }
    return false;
  }
}

/**
 * A GADDAG data structure
 */
export class Gaddag {
  private idGenerator: () => number;
  private _root: GaddagNode;
  public get root(): GaddagNode { return this._root; }

  /**
   * Token used to indicate a turn in the GADDAG; a separator between the reversed prefix and normal suffix portions of a path
   */
  public static TurnToken = '>';

  /**
   * Returns the size - the number of nodes of the graph
   * @returns the number of nodes in the graph
   */
  public size(): number {
    return Gaddag.sizeNode(this._root, new Date());
  }

  /**
   * Recursively sums the size of the graph by walking the graph from the given node and setting a flag value
   * on each node to determine whether it has already been counted.
   * @param node node to start from
   * @param flag flag value
   * @return number of nodes accessible from a particular node, relative to the given flag value
   */
  private static sizeNode(node: GaddagNode, flag: Date): number {
    return node.count(flag) + values(node.children)
      .map(n => Gaddag.sizeNode(n, flag))
      .reduce((p, n) => p + n, 0);
  }

  /**
   * Recursively collects all nodes in the Gaddag
   * @returns array of all nodes in the graph
   */
  public getNodes(): GaddagNode[] {
    let result: Dictionary<GaddagNode> = {'root': this._root};
    return values(Gaddag.getNodesFromNode(this._root)
      .reduce( (p, n) => {
        p[n.id] = n;
        return p;
      }, result));
  }

  /**
   * Returns children nodes from given node
   * @param node Node to traverse from
   * @returns array of all nodes from the given node
   */
  private static getNodesFromNode(node: GaddagNode): GaddagNode[] {
    return values(node.children).concat(flatten(values(node.children).map(n => Gaddag.getNodesFromNode(n))));
  }

  /**
   * Recursively builds a map from depth to an array of nodes in the graph with that minimum distance from the root
   * @returns map from depth to array of nodes at that depth
   */
  public getNodesByDepth(): {[depth: string]: GaddagNode[]} {
    let flag = new Date();
    return Gaddag.getNodesByDepthFromNode(this._root, 0, flag);
  }

  /**
   * Recursively builds a map from tree depth to an array of nodes whose shallowest path is at that depth starting from a given
   * node and specified depth.
   * @param node Node to traverse from
   * @param depth Current depth counter
   * @param flag Flag to use when traversing to prevent multiple traversal
   * @returns map of nodes by depth relative to a particular flag from the perspective of a given node
   */
  private static getNodesByDepthFromNode(node: GaddagNode, depth: number, flag: Date): {[depth: string]: GaddagNode[]} {
    let result: {[depth: string]: GaddagNode[]} = {};
    result[depth] = values(node.children).filter(n => n.include(flag));
    result[depth].forEach(n => {
      let intermediary = Gaddag.getNodesByDepthFromNode(n, depth + 1, flag);
      Object.keys(intermediary).forEach(k => {
        result[k] = result[k] || [];
        intermediary[k].forEach(i => result[k].push(i));
      });
    });
    return result;
  }

  /**
   * Recursively collects all edges in the graph
   * @returns array of all edges in the graph
   */
  public getEdges(): GaddagEdge[] {
    let result: Dictionary<GaddagEdge> = {};
    let finalResult = values(Gaddag.getEdgesForNode(this._root)
      .reduce( (p, n) =>{
        p[`${n.source}-${n.target}`] = n;
        return p;
      }, result));
    return finalResult;
  }

  /**
   * Recursively builds an array of the edges for a particular node in the Gaddag
   * @param node Node's edges to traverse
   * @returns array of all eges from the perspective of a given node
   */
  private static getEdgesForNode(node: GaddagNode): GaddagEdge[] {
    return values(node.children).map(c => new GaddagEdge(node.id, c.id))
      .concat(flatten(values(node.children).map(n => Gaddag.getEdgesForNode(n))));
  }

  /**
   * Calculates the unminimized size of the graph as a function of the number of nodes and size of each node
   * @returns calculated unminimized size
   */
  public rawSize(): number {
    return this.allWords().reduce( (p, n) => p + (n.length * n.length), 0);
  }

  /**
   * Calculates the compression rate based off of the unminimized and minimized sizes
   * @return ratio of actual to computed size
   */
  public compressionRate(): number {
    return this.size() / this.rawSize();
  }

  /**
   * Recursively collects all words in the gaddag.
   * @returns array of all words in the graph
   */
  public allWords(): string[] {
    // Just find all suffix paths
    return this.wordsForSuffix("");
  }

  /**
   * Recursively collects all words matching a given hand
   * @param hand Hand to track whlie walking GADDAG
   * @returns array of all matching words
   */
  public wordsForHand(hand: string, mustUseAllNonBlanks: boolean = false): string[] {
    let seed: Dictionary<number> = {};
    // Construct a map of letter frequencies to track remaining hand while traversing graph
    let letters = hand.split('')
      .reduce( (result, letter) => {
        if (!(letter in result)) {
          result[letter] = 0;
        }
        result[letter] = result[letter] + 1;
        return result;
      }, seed);
      return Gaddag.walkWordsForHandFromNode(letters, this._root, "", mustUseAllNonBlanks);
  }

  /**
   * Recurively collects all words matching a given hand by walking the graph and keeping track of remaining
   * hand along the way.
   * @param hand current remaining hand, as a map of letter to count
   * @param node current node of the walk
   * @param progress word as seen thus far in the walk
   * @return array of words from the perspective of given node
   */
  private static walkWordsForHandFromNode(hand: Dictionary<number>, node: GaddagNode, progress: string, mustUseAllNonBlanks: boolean = false): string[] {
    let allNonBlanksUsed = mustUseAllNonBlanks ? sum(Object.keys(hand).filter(k => k !== '?').map(k => hand[k])) === 0 : true;
    if (sum(values(hand)) === 0) {
      return  node.isCompleteWord ? [progress] : [];
    }
    let childrenInHand = Object.keys(node.children).filter(k => k !== Gaddag.TurnToken).filter( k => (k in hand && hand[k] > 0) || ('?' in hand && hand['?'] > 0));
    if (childrenInHand.length === 0) {
      let complete = node.isCompleteWord;
      return (complete && allNonBlanksUsed) ? [progress] : [];
    } 
    return (node.isCompleteWord && allNonBlanksUsed ? [progress] : []).concat(flatten(childrenInHand.map( k => {
      let newHand = cloneDict(hand);
      if (k in newHand && newHand[k] > 0) {
        newHand[k] = newHand[k] - 1;
      } else {
        newHand['?'] = newHand['?'] - 1;
      }
      return Gaddag.walkWordsForHandFromNode(newHand, node.children[k], k + progress, mustUseAllNonBlanks);
    })));
  }

  /**
   * Recursively collects all words containing a given substring
   * @param substring Substring to search for
   * @returns array of all words containing ordered substring
   */
  public wordsContaining(substring: string): string[] {
    return Gaddag.wordsContainingFromNode(substring, reverse(substring), this._root, 0);
  }

  /**
   * Walk the GADDAG treating the substring as a prefix, then starting from the node where the "prefix" has run out,
   * keep walking till a turn is found, then find all prefixes and suffixes and add them to the "prefix"
   * 
   * @param substring substring to search for
   * @param gnirtsbus reversed substring - get it - mutated at each recursive call to track remaining progress
   * @param node current node
   * @returns array of words containing substring from the perspective of the node
   */
  private static wordsContainingFromNode(substring: string, gnirtsbus: string, node: GaddagNode, step: number): string[] {
    if (gnirtsbus.length === 0) {
      node.meta['step'] = step;
      node.meta['result'] = node.isCompleteWord ? 'success' :  'step';
      let result = node.isCompleteWord ? [ substring ] : [];
      let suffixes = flatten(Object.keys(node.children).map(key => {
        if (key === Gaddag.TurnToken) {
          return Gaddag.walkSuffixesFromNode(node.children[key], step + 1).map(s => substring + s);
        }
        return Gaddag.wordsContainingFromNode(key + substring, gnirtsbus, node.children[key], step + 1);
      }));
      return unique(result.concat(suffixes));
    }
    let firstChar = gnirtsbus[0];
    if (!(firstChar in node.children)) {
      node.meta['step'] = step;
      node.meta['result'] = 'halt';
      return [];
    }
    node.meta['step'] = step;
    node.meta['result'] = 'query';
    return Gaddag.wordsContainingFromNode(substring, gnirtsbus.substr(1), node.children[firstChar], step + 1);
  }

  /**
   * Return all words starting with the provided prefix
   * @param prefix 
   */
  public wordsForPrefix(prefix: string): string[] {
    return Gaddag.wordsForPrefixFromNode(prefix, reverse(prefix), this._root, 0);
  }

  private static wordsForPrefixFromNode(prefix: string, xiferp: string, node: GaddagNode, step: number): string[] {
    if (xiferp.length === 0) {
      node.meta['step'] = step;
      node.meta['result'] = node.isCompleteWord ? 
        'success' :
        'step';
      let result = node.isCompleteWord ? [ prefix ] : [];
      if (!(Gaddag.TurnToken in node.children)) {
        node.meta['result'] = 'halt';
        return result;
      }
      node.meta['step'] = step;
      node.meta['result'] = 'step';
      node.children[Gaddag.TurnToken].meta['step'] = step + 1;
      node.children[Gaddag.TurnToken].meta['result'] = 'step';
      return result.concat(Gaddag.walkSuffixesFromNode(node.children[Gaddag.TurnToken], step + 2).map(s => prefix + s));
    }
    let firstChar = xiferp[0];
    if (!(firstChar in node.children)) {
      node.meta['step'] = step;
      node.meta['result'] = 'halt';
      return [];
    }
    node.meta['step'] = step;
    node.meta['result'] = 'query';
    return Gaddag.wordsForPrefixFromNode(prefix, xiferp.substr(1), node.children[firstChar], step + 1);
  }

  private static walkSuffixesFromNode(node: GaddagNode, step: number): string[] {
    if (node.isCompleteWord) {
      node.meta['step'] = step;
      node.meta['result'] = 'success';
      return [''];
    }
    node.meta['step'] = step;
    node.meta['result'] = 'step';
    return flatten(Object.keys(node.children).map(k => Gaddag.walkSuffixesFromNode(node.children[k], step + 1).map(r => k + r)));
  }

  /**
   * Return all words ending with the provided suffix
   * @param suffix 
   */
  public wordsForSuffix(suffix: string): string[] {
    return Gaddag.wordsForSuffixFromNode(suffix, reverse(suffix), this._root, 0);
  }

  private static wordsForSuffixFromNode(suffix: string, xiffus: string, node: GaddagNode, step: number): string[] {
    if (xiffus.length === 0) {
      node.meta['step'] = step;
      node.meta['result'] = node.isCompleteWord ? 'success' : 'step';
      let result = node.isCompleteWord ? [ suffix ] : [];
      if (Gaddag.TurnToken in node.children) {
        node.children[Gaddag.TurnToken].meta['step'] = step + 1;
        node.children[Gaddag.TurnToken].meta['result'] = 'halt';
      }
      return result.concat( // If the suffix alone is a complete word, include it in the results
        flatten( // For each child node, find *their* suffixes, flatten, and prepend them to the suffixes found so far
          Object.keys(node.children)
            .filter(key => key != Gaddag.TurnToken) // We want only the complete suffix paths - no turns
            .map(key => Gaddag.wordsForSuffixFromNode(key + suffix, xiffus, node.children[key], step + 1))))
    }
    let firstChar = xiffus[0];
    if (!(firstChar in node.children)) {
      node.meta['step'] = step;
      node.meta['result'] = 'halt';
      return [];
    }
    node.meta['step'] = step;
    node.meta['result'] = 'query';
    return Gaddag.wordsForSuffixFromNode(suffix, xiffus.substr(1), node.children[firstChar], step + 1);
  }

  /**
   * Check whether the given word is in the GADDAG
   * @param word Word to check
   */
  public checkWord(word: string): boolean {
    return Gaddag.checkWordNode(reverse(word), this._root, 0);
  }

  private static checkWordNode(word: string, node: GaddagNode, step: number): boolean {
    let firstChar = word[0];
    if (!(firstChar in node.children)) {
      node.meta['step'] = step;
      node.meta['result'] = 'halt';
      return false;
    }
    let nextNode = node.children[firstChar];
    if (word.length === 1 && !nextNode.isCompleteWord) {
      node.meta['step'] = step;
      node.meta['result'] = 'halt';
      return false;
    } 
    if (word.length === 1 && nextNode.isCompleteWord) {
      node.meta['step'] = step;
      node.meta['result'] = 'step';
      nextNode.meta['step'] = step + 1;
      nextNode.meta['result'] = 'success';
      return true;
    }
    node.meta['step'] = step;
    node.meta['result'] = 'step';
    return Gaddag.checkWordNode(word.substr(1), nextNode, step + 1);
  }

  /**
   * Adds a word to the GADDAG, re-using existing nodes for words longer than 2 characters.
   * Produces a partially minimized graph.
   * @param word Word to add
   */
  public addWord(word: string) {
    // Minimum of length 2 words
    if (word.length < 2) { return; }
    let reversed = reverse(word); // asked -> deksa
    // Add full prefix path
    let degenerateCaseNode = this.addPath(this._root, reversed);
    degenerateCaseNode.isCompleteWord = true;

    // Add path for prefix + 1 letter suffix
    let baseCaseNode = this.addPath(this._root, reversed.slice(1)) // eksa
    baseCaseNode.children[Gaddag.TurnToken] = baseCaseNode.children[Gaddag.TurnToken] || new GaddagNode(this.idGenerator(), Gaddag.TurnToken, {});
    let baseCaseTurn = baseCaseNode.children[Gaddag.TurnToken];
    let previousNode = this.addPath(baseCaseTurn, word.slice(-1)); // d
    previousNode.isCompleteWord = true;

    // Loop over decreasing prefix, using last removed letter to join next suffix
    // with previous suffix.  See Steven Gordon's 1993 paper "A Faster Scrabble Move Generation Algorithm"
    // for details
    for (var start = 2; start < reversed.length; start++) {
      let nextPrefix = reversed.slice(start);
      let newFinalLetter = reversed[start-1];
      let previousFinalLetter = reversed[start-2];

      let nextBaseNode = this.addPath(this._root, nextPrefix); // ksa
      let nextCaseTurn = nextBaseNode.children[Gaddag.TurnToken] || new GaddagNode(this.idGenerator(), Gaddag.TurnToken, {});
      nextBaseNode.children[Gaddag.TurnToken] = nextCaseTurn;
      let newFinalNode = nextCaseTurn.children[newFinalLetter] || new GaddagNode(this.idGenerator(), newFinalLetter, {}, false);
      newFinalNode.children[previousFinalLetter] = previousNode;
      nextCaseTurn.children[newFinalLetter] = newFinalNode;
      previousNode = newFinalNode;
    }
  }

  /**
   * Given a string and a starting node, add a sequence of nodes and edges to complete the path
   * @param startingNode node to start adding from
   * @param word word to add
   * @returns last node added
   */
  private addPath(startingNode: GaddagNode, word: string): GaddagNode {
    return word.split('').reduce((prevNode, char) => {
      if ( !(char in prevNode.children) ) {
        let newNode = new GaddagNode(this.idGenerator(), char);
        prevNode.children[char] = newNode;
      }
      return prevNode.children[char];
    }, startingNode);
  }

  /**
   * Builds a map from hand permutation (anagram) to valid words found within the hand
   * @param hand hand to permute
   * @returns map of valid words by hand permutation (anagram)
   */
  public wordsForHandByPermutation(hand: string): {[permutation: string]: string[]} {
    let perms = unique(permute(hand.split('')).map(m => m.join('')));
    return perms.reduce( (p: {[key: string]: string[]}, n) => {
      p[n] = this.wordsContaining(n);
      return p;
    }, {});
  }

  /**
   * Recursively collects all words of given length
   * @param length length of word to search for
   */
  public wordsOfLength(length: number): string[] {
    return flatten(values(this._root.children).map( c => Gaddag.wordsOfLengthForNode(c, length-1)));
  }

  /**
   * Recursively collects all words of a given length starting at given node
   * @param node current node
   * @param length remaining length
   */
  private static wordsOfLengthForNode(node: GaddagNode, length: number): string[] {
    let children = values(node.children);
    if (length == 1) {
      if (node.token === Gaddag.TurnToken) {
        return [];
      }
      return children.filter(n => n.isCompleteWord).map(n => n.token + node.token);
    }
    if (node.token === Gaddag.TurnToken) {
      return [];
    }
    return flatten(children.map(n => Gaddag.wordsOfLengthForNode(n, length - 1))).map(r => r + node.token);
  }

  /**
   * Clear the metadata for all nodes in the graph
   */
  public clearMeta(): void {
    this.getNodes().forEach(n => n.clearMeta());
  }

  /**
   * Constructor.
   * Initializes the counter and creates root node.
   */
  constructor() {
    this.idGenerator = makeIdGenerator();
    this._root = new GaddagNode(this.idGenerator(), 'root');
  }
}
