import { Gaddag, keyValuePairs } from '../gaddag';

declare class vega {
  static embed(el: Element | string, spec: string | any, opts?: any): any;
}

function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>,
  data: {[length: number]: number},
) {}

export class InitialState{
  constructor( public dataLoaded: Promise<string[]>, public expanded: boolean = false) {}
}

export function bootstrap(host: Element, initialState: InitialState) {
  initialState.dataLoaded.then((wordList) => {
    let wordsByLength = wordList.reduce((result: {[length: number]: number}, word) => {
      result[word.length] = result[word.length] || 0;
      result[word.length] = result[word.length] + 1;
      return result;
    }, {});
    let spec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
      "width": 1000,
      "height": 650,
      "data": {
        "values": keyValuePairs<number>(wordsByLength)
      },
      "mark": "bar",
      "encoding": {
        "x": {"field": "key", "type": "ordinal"},
        "y": {"field": "value", "type": "quantitative"}
      }
    };

    vega.embed('.slide-visual', spec);
  })
}