import * as d3 from 'd3';
import { Dictionary, Gaddag, unique, flatten } from '../gaddag';
import { Fix, showVegaTooltip, hideTooltip } from '../browser';

declare class vega {
  static embed(el: Element | string | string, spec: string | any, opts?: any): Promise<any>;
  static changeset(): any;
}

function update(
  host: Element | string,
  width: number,
  height: number,
  wordList: string[],
  fixes: Fix[],
  pattern: string
) {
    let uniquePatternComponents = unique(pattern.split(''));
    
    let wordsWithEachComponent = wordList.filter(w => uniquePatternComponents.every(c => w.indexOf(c) >= 0));
    let wordsMatchingPattern = wordsWithEachComponent.filter(w => w.match(pattern));
    let wordsMatchingPatternObjects = wordsMatchingPattern.map(w => { return { value: w} });
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
    wordsBySubPatternComponents.push({
      'label': `p(${pattern})|${pattern}`,
      'target': `"${pattern}"`,
      'given': `${pattern}`,
      'probability': (wordsMatchingPattern.length / wordsWithEachComponent.length) * 100
    });
    let wordsMatchingPatternByFix = flatten(
      fixes.filter(f => f.fix !== pattern).map(fix => wordsMatchingPattern.filter(w => fix.test(w)).map(w => {
        return {word: w, fix: fix.fix, fixType: fix.fixType, formattedFix: fix.formattedFix};
    })));

    let spec: any = {
      "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
      "config": {
        "axis": {
          "titleFontSize": 14
        }
      },
      "hconcat": [
        {
          "data": {
            "values": wordsBySubPatternComponents
          },
          "width": 50 + 25*wordsBySubPatternComponents.length,
          "height": 500,
          "mark": "bar",
          "tooltip": { "field": "probability", "type": "quantitative" },
          "transform": [
            { "calculate": "'Pattern: ' + datum.label + '<br/>Probability: '+format(datum.probability, '.2f') + '%'", "as": "formattedTooltip" }
          ],
          "encoding": {
            "x": {
              "axis": { "title": "Pattern" },
              "field": "label",
              "type": "nominal",
              "sort": {
                "op": "max",
                "field": "probability",
                "order": "descending"
              }
            },
            "y": {
              "axis": { "title": "Probability" },
              "field": "probability",
              "type": "quantitative"
            },
            "tooltip": {
              "field": "formattedTooltip",
              "type": "nominal"
            }
          }
        },
        {
          "data": {
            "values": wordsMatchingPatternByFix
          },
          "width": 850,
          "height": 500,
          "mark": "bar",
          "transform": [
            { "calculate": "'Pattern: ' + datum.formattedFix + '<br />' + datum.fixType + '<br />Count: @count'", "as": "formattedTooltip" }
          ],
          "encoding": {
            "x": {
              "axis": { "title": "Pattern" },
              "field": "formattedFix",
              "type": "nominal",
              "sort": {
                "op": "count",
                "field": "formattedFix",
                "order": "descending"
              }
            },
            "y": {
              "axis": { "title": "Count" },
              "aggregate": "count",
              "type": "quantitative",
              "scale": { "type": "log" }
            },
            "color": { 
              "field": "fixType",
              "type": "nominal"
             },
            "tooltip": {
              "field": "formattedTooltip",
              "type": "nominal"
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

    vega.embed(host, spec, opts).then(view => {
      view.view.tooltipHandler(function(event: MouseEvent, item: any, text: string) {
          if (text) {
            if (text.match('@count')) {
              text = text.replace('@count', item.datum['count_*']);
            }
            showVegaTooltip(text, event);
          } else {
            hideTooltip();
          }
        });
        return view;
      });
}

export class InitialState{
  constructor( public dataLoaded: Promise<[string[], Fix[]]>, public expanded: boolean = false) {}
}

export function bootstrap(host: Element, initialState: InitialState) {

  let svg = d3.select(host).select("svg"),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 20, right: 120, bottom: 120, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;

  let patternElement = <HTMLInputElement>host.querySelector('#word-pattern');
  let updateButton = d3.select(host).select('update-button');

  initialState.dataLoaded.then(function([rawWordList, fixes]){
    let wordList = rawWordList.filter(w => w.length >= 4);
    let viewPromise = update('.slide-visual', width, height, wordList, fixes, patternElement.value.toLowerCase())
    d3.select(document.querySelector('.update-button'))
      .on('click', function() {

        update('.slide-visual', width, height, wordList, fixes, patternElement.value.toLowerCase());
      });
  });


}