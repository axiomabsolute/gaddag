import * as fs from 'fs';

import { flatten, Gaddag, GaddagNode, values } from './gaddag';
// import { bingosSample } from './data/bingos-sample';
// import { bingos } from './data/bingos';
import { words } from './data/words';

let wordList = words.words;

let dag = new Gaddag();
console.log("------------------------");
var start = new Date();
wordList.forEach(w => dag.addWord(w));
console.log(`GADDAG Construction Time: ${new Date().getTime() - start.getTime()} ms`);
console.log("------------------------");

// console.log("Saving GADDAG to out.js");
// fs.writeFile('./dist/out.js', JSON.stringify(dag), (err: any) => {
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