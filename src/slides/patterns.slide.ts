import * as d3 from 'd3';
import { Dictionary, Gaddag, unique } from '../gaddag';

function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>,
  data: any,
  width: number,
  height: number,
  wordList: string[],
  pattern: string
) {
    let uniquePatternComponents = unique(pattern.split(''));
    let patternRegex = new RegExp(pattern);
    let componentRegex = new RegExp(uniquePatternComponents.join('|'));
    
    let wordsWithEachComponent = wordList.filter(w => componentRegex.test(w));
    let wordsMatchingPattern = wordsWithEachComponent.filter(w => patternRegex.test(w));
    let wordsMatchingPatternByLength = wordsMatchingPattern.reduce((p: Dictionary<number>, n) => {
      p[n.length] = p[n.length] || 0;
      p[n.length] = p[n.length] + 1;
      return p;
    }, {});
    let wordsBySubPatternComponents = uniquePatternComponents.map((v,i) => {
      let components = pattern.substring(i+1) + pattern.substring(0,i);
      let componentPattern = new RegExp(components.split('').join('|'));
      let wordsMatchingComponentPattern = wordList.filter(w => componentPattern.test(w));
      let wordsMatchingComponentPatternWithTarget = wordsMatchingComponentPattern.filter(w => w.indexOf(v) >= 0);
      return {
        'target': v,
        'given': components,
        'probability': wordsMatchingComponentPatternWithTarget.length / wordsMatchingComponentPattern.length
      };
    });

}

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

    let pattern = 'ing';

    update(frame, data, width, height, wordList, pattern);
  });


}