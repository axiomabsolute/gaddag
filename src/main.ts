import * as fs from 'fs';

import { flatten, Gaddag, GaddagNode, values } from './gaddag';
// import { bingosSample } from './data/bingos-sample';
// import { bingos } from './data/bingos';
// import { words } from './data/words';

let wordList: string[] = JSON.parse(fs.readFileSync('src/data/words.json', 'utf8')).words;

let dag = new Gaddag();
console.log("------------------------");
var start = new Date();
wordList.forEach(w => dag.addWord(w));
console.log(`GADDAG Construction Time: ${new Date().getTime() - start.getTime()} ms`);
console.log("------------------------");

// console.log("Saving GADDAG to out.json");
// fs.writeFile('./dist/out.json', JSON.stringify(dag), (err: any) => {
//   if (err) {
//     console.error(err);
//   }
// });
// console.log(`Time: ${new Date().getTime() - start.getTime()} ms`);
// let dagSize = dag.size();

// console.log("------------------------");

// start = new Date();
// console.log(`GADDAG Size: ${dagSize} Nodes`);
// console.log(`Compression Rate: ${Math.ceil(dag.compressionRate() * 1000)/10}% of original size`);
// console.log(`checkWord("red"): ${dag.checkWord('red')}`);
// console.log(`checkWord(${wordList[0]}): ${dag.checkWord(wordList[0])}`);
// console.log(`wordsForPrefix("car"): ${dag.wordsForPrefix("car").join(", ")}`);
// console.log(`wordsForPrefix("red"): ${dag.wordsForPrefix("red").join(", ")}`);
// console.log(`wordsForPrefix(${wordList[0]}): ${dag.wordsForPrefix(wordList[0])}`);
// console.log(`wordsForSuffix("er"): ${dag.wordsForSuffix("er")}`);
// console.log(`wordsForSuffix("red"): ${dag.wordsForSuffix("red")}`);
// console.log(`wordsForSuffix(${wordList[0]}): ${dag.wordsForSuffix(wordList[0])}`);
// console.log(`wordsContaining("een"): ${dag.wordsContaining("een")}`)
// console.log(`wordsContaining("car"): ${dag.wordsContaining("car")}`)
// console.log(`wordsContaining("ee"): ${dag.wordsContaining("ee")}`)
// console.log(`wordsContaining("red"): ${dag.wordsContaining("red")}`)
// console.log(`wordsContaining(${wordList[0]}): ${dag.wordsContaining(wordList[0])}`)
// console.log(`dag.wordsForHand("retinas"): ${dag.wordsForHand("retinas")}`);
// console.log(`Time: ${new Date().getTime() - start.getTime()} ms`);

// console.log(`Number of nodes: ${dag.getNodes().length}`);
// console.log(`Number of edges: ${dag.getEdges().length}`);
// console.log(`Number of words: ${dag.allWords().length}`);

// console.log(`Depth: ${Object.keys(dag.getNodesByDepth()).length}`);

// let lengthN = 3;
// let wordsOfLengthN = dag.wordsOfLength(lengthN);
// let wordListOfLengthN = wordList.filter(w => w.length == lengthN);
// console.log(`Words of length ${lengthN}: ${wordsOfLengthN}`);
// console.log("------------------------");
// console.log(`Count of words of length ${lengthN}: ${wordsOfLengthN.length}`);
// console.log(`Count of words of length should be ${lengthN}: ${wordListOfLengthN.length}`);
// console.log(`Complete?: ${wordListOfLengthN.every(w => wordsOfLengthN.indexOf(w) > -1) && wordListOfLengthN.length === wordsOfLengthN.length}`);

// console.log(`Expects graph ${dag.allWords().filter(w => w.length == 7).length}`);
// console.log(`Expects wordlist ${wordList.filter(w => w.length == 7).length}`);

// console.log("\n------------------------");

let pattern = 'ing';
let completePatternRegex = new RegExp(pattern).compile();
let componentRegex = new RegExp(pattern.split('').join('|')).compile();
let iReg = /i/.compile();
let nReg = /n/.compile();
let gReg = /g/.compile();
console.log('Finding ing words naively')
start = new Date();
let naiveWordsWithIng = wordList.filter(w => w.indexOf(pattern) >= 0);
let naiveWordsWithING = wordList.filter(w => w.indexOf('i') >= 0 && w.indexOf('n') >= 0 && w.indexOf('g') >= 0);
console.log(`Time: ${new Date().getTime() - start.getTime()} ms`);
console.log("\n------------------------");
console.log('Finding ing words with regexes')

start = new Date();
let wordsWithIng = wordList.filter(w => completePatternRegex.test(w));
let wordsWithING = wordList.filter(w => componentRegex.test(w));
console.log(`Time: ${new Date().getTime() - start.getTime()} ms`);
console.log("\n------------------------");

console.log('Finding ing words with dag')
start = new Date();
let dagWordsWithIng = dag.wordsContaining('ing');
let dagWordsWithING = dag.wordsForHand('ing???????', true);
console.log(`Time: ${new Date().getTime() - start.getTime()} ms`);
console.log("\n------------------------");

console.log(`Words with 'ing' with regex: ${wordsWithIng.length}`);
console.log(`Words with 'i', 'n', 'g' with regex: ${wordsWithING.length}`);
console.log(`Words with 'ing' with dag: ${dagWordsWithIng.length}`);
console.log(`Words with 'i', 'n', 'g' with dag: ${dagWordsWithING.length}`);
console.log("\n------------------------");