import * as d3 from 'd3';
import { Gaddag, unique } from '../gaddag';

function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>,
  data: any,
  width: number,
  height: number
) { }

export class InitialState{
  constructor( public dag: Gaddag, public dataLoaded: Promise<string[]>, public expanded: boolean = false) {}
}

export function bootstrap(host: Element, initialState: InitialState) {

  let svg = d3.select(host).select("svg"),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 20, right: 120, bottom: 120, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;

  let frame = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
  
  let data: any[] = [];

  initialState.dataLoaded.then((wordList: string[]) => {
    // let wordsWithFix = initialState.dag.wordsContaining('ing').filter(w => w.length <= 7);
    // let wordsContaining = initialState.dag.wordsForHand('ing????');

    // console.log(wordsWithFix.length);
    // console.log(wordsContaining.filter(w => /i/.test(w) && /n/.test(w) && /g/.test(w)).length);
    // console.log("-----------------");

    let sevenLetterOrLessWords = wordList.filter(w => w.length <= 7);
    let ingWords = sevenLetterOrLessWords.filter(w => /ing/.test(w))
    let wordsWithING = sevenLetterOrLessWords.filter(w => /i/.test(w) && /n/.test(w) && /g/.test(w))
    
    // Partition - words containing "ing" vs "i", "n", and "g"

    update(frame, data, width, height);
  });


}