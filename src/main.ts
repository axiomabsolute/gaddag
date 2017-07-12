import * as fs from 'fs';

import { Gaddag, GaddagNode } from './gaddag';
import { bingosSample } from './data/bingos-sample';
import { bingos } from './data/bingos';
import { words } from './data/words';

let wordList = words.words;

let dag = new Gaddag();
wordList.forEach(w => dag.addWord(w));
console.log("\n------------------------\n");

console.log("Saving GADDAG to out.js");
var start = new Date();
fs.writeFile('./dist/out.js', JSON.stringify(dag), (err: any) => {
  if (err) {
    console.error(err);
  }
});
console.log(`Time: ${new Date().getTime() - start.getTime()} ms`);
let dagSize = dag.size();

console.log("------------------------\n");

start = new Date();
console.log(`GADDAG Size: ${dagSize} Nodes`);
console.log(`Compression Rate: ${Math.ceil(dag.compressionRate() * 1000)/10}% of original size`);
console.log(`checkWord("red"): ${dag.checkWord('red')}`);
console.log(`checkWord(${wordList[0]}): ${dag.checkWord(wordList[0])}`);
// console.log(`Words: ${dag.allWords()}`);
console.log(`wordsForPrefix("car"): ${dag.wordsForPrefix("car").join(", ")}`);
console.log(`wordsForPrefix("red"): ${dag.wordsForPrefix("red").join(", ")}`);
console.log(`wordsForPrefix(${wordList[0]}): ${dag.wordsForPrefix(wordList[0])}`);
console.log(`wordsForSuffix("er"): ${dag.wordsForSuffix("er")}`);
console.log(`wordsForSuffix("red"): ${dag.wordsForSuffix("red")}`);
console.log(`wordsForSuffix(${wordList[0]}): ${dag.wordsForSuffix(wordList[0])}`);
// words containing has a number of issues... need to rethink the approach...
console.log(`wordsContaining("een"): ${dag.wordsContaining("een")}`)
console.log(`wordsContaining("car"): ${dag.wordsContaining("car")}`)
console.log(`wordsContaining("ee"): ${dag.wordsContaining("ee")}`)
console.log(`wordsContaining("red"): ${dag.wordsContaining("red")}`)
console.log(`wordsContaining(${wordList[0]}): ${dag.wordsContaining(wordList[0])}`)
console.log(`dag.wordsForHand("retinas"): ${dag.wordsForHand("retinas")}`);
console.log(`Time: ${new Date().getTime() - start.getTime()} ms`);

console.log("\n------------------------");