import { Gaddag, GaddagNode } from './gaddag';

let wordList = [
    "cardamom",
    "careen",
    "greener"
]

let dag = new Gaddag();
wordList.forEach(w => dag.addWord(w));
// console.log(JSON.stringify(dag));
let dagSize = dag.size();
console.log("\n------------------------\n");

console.log(`GADDAG Size: ${dagSize} Nodes`);
console.log(`checkWord("red"): ${dag.checkWord('red')}`);
console.log(`checkWord(${wordList[0]}): ${dag.checkWord(wordList[0])}`);
console.log(`Words: ${dag.allWords()}`);
console.log(`wordsForPrefix("car"): ${dag.wordsForPrefix("car").join(", ")}`);
console.log(`wordsForPrefix("red"): ${dag.wordsForPrefix("red").join(", ")}`);
console.log(`wordsForPrefix(${wordList[0]}): ${dag.wordsForPrefix(wordList[0])}`);
console.log(`wordsForSuffix("een"): ${dag.wordsForSuffix("een")}`);
console.log(`wordsForSuffix("red"): ${dag.wordsForSuffix("red")}`);
console.log(`wordsForSuffix(${wordList[0]}): ${dag.wordsForSuffix(wordList[0])}`);

console.log("\n------------------------");