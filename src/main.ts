import { Gaddag, GaddagNode } from './gaddag';

let wordList = [
    "asked"
]

let dag = new Gaddag();
wordList.forEach(w => dag.addWord(w));
console.log(JSON.stringify(dag));
console.log("------------------------")
console.log(dag.size());