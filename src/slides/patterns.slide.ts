import * as d3 from 'd3';
import { Dictionary, Gaddag, unique } from '../gaddag';

declare class vega {
  static embed(el: Element | string | string, spec: string | any, opts?: any): Promise<any>;
}

function update(
  host: Element | string,
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
        'label': `p(${v})|${components}`,
        'target': v,
        'given': components,
        'probability': (wordsMatchingComponentPatternWithTarget.length / wordsMatchingComponentPattern.length) * 100
      };
    });

    let spec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
      "config": {
        "axis": {
          "titleFontSize": 14
        }
      },
      "hconcat": [
        {
          "data": {"values": wordsMatchingPattern.map(w => { return { value: w} })},
          "width": 50 + 25*9,
          "height": 570,
          "transform": [
            { "calculate": "length(datum.value)", "as": "length" }
          ],
          "mark": "bar",
          "encoding": {
            "x": {
              "bin": { "step": 1 },
              "field": "length",
              "type": "quantitative",
              "tooltip": {"field": "length", "type": "quantitative"},
            },
            "y": {
              "aggregate": "count",
              "type": "quantitative",
              "tooltip": {"field": "length", "type": "quantitative"},
            }
          }
        },
        {
          "data": {"values": wordsBySubPatternComponents },
          "width": 50 + 25*wordsBySubPatternComponents.length,
          "height": 570,
          "mark": "bar",
          "tooltip": { "field": "probability", "type": "quantitative" },
          "encoding": {
            "x": {
              "field": "label",
              "type": "nominal"
            },
            "y": {
              "field": "probability",
              "type": "quantitative"
            }
          }
        }
      ]
    };

    let opts = {
      renderer: 'svg',
      actions: false,
      height,
      width
    };

    let viewPromise = vega.embed(host, spec, opts);

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

  let data: any[] = [];

  let patternElement = <HTMLInputElement>host.querySelector('#word-pattern');
  let updateButton = d3.select(host).select('update-button');

  initialState.dataLoaded.then(function(wordList: string[]){
    // let wordsWithFix = initialState.dag.wordsContaining('ing').filter(w => w.length <= 7);
    // let wordsContaining = initialState.dag.wordsForHand('ing????');

    // console.log(wordsWithFix.length);
    // console.log(wordsContaining.filter(w => /i/.test(w) && /n/.test(w) && /g/.test(w)).length);
    // console.log("-----------------");

    d3.select(document.querySelector('.update-button'))
      .on('click', function() {

        update('.slide-visual', data, width, height, wordList, patternElement.value);
      });

    update('.slide-visual', data, width, height, wordList, patternElement.value);
  });


}