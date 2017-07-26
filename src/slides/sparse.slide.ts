import { Gaddag, keyValuePairs } from '../gaddag';
import { axisBottom, axisLeft, max as d3Max, scaleBand, ScaleBand, scaleLinear, scalePow, select } from 'd3';

declare class vega {
  static embed(el: Element | string, spec: string | any, opts?: any): any;
}

function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>,
  data: {
    key: string,
    value: number
  }[],
  width: number,
  height: number,
  x: ScaleBand<string>,
  aggregate: (datum: {key: string, value: number}) => number
) {
  let y = (aggregate !== null ? scalePow() : scaleLinear())
    .range([height, 0]);
  
  console.log(d3Max(data, w => aggregate ? aggregate(w) : w.value));
  y.domain([0, d3Max(data, w => aggregate ? aggregate(w) : w.value)]);

  let barNodes = frame.selectAll('.bar')
      .data(data);

  barNodes
    .enter().append('rect')
    .merge(barNodes)
      .attr('class', 'bar')
      .attr('fill', 'black')
      .attr('x', d => x(d.key))
      .attr('width', x.bandwidth())
      .attr('y', d => aggregate ? y(aggregate(d)) : y(d.value))
      .attr('title', d => `${aggregate ? aggregate(d) : d.value}%`)
      .attr('height', d => height - y(aggregate ? aggregate(d) : d.value));
    
  frame.select('.left-axis')
    .remove();
  frame.append('g')
    .attr('class', 'left-axis')
    .call(axisLeft(y));
}

export class InitialState{
  constructor( public dataLoaded: Promise<string[]>, public expanded: boolean = false) {}
}

export function bootstrap(host: Element, initialState: InitialState) {

  let svg = select(host).select("svg"),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;
  
  initialState.dataLoaded.then((wordList) => {
    let wordsByLength = keyValuePairs<number>(wordList.reduce((result: {[length: number]: number}, word) => {
      result[word.length] = result[word.length] || 0;
      result[word.length] = result[word.length] + 1;
      return result;
    }, {}));

  let frame = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  let x = scaleBand()
    .range([0, width])
    .padding(0.1);
  
  x.domain(wordsByLength.map(w => w.key));
  
  frame.select('.bottom-axis')
    .remove();
  frame.append('g')
    .attr('class', 'bottom-axis')
    .attr('transform', `translate(0,${height})`)
    .call(axisBottom(x));
  
  update(frame, wordsByLength, width, height, x, null);

  setTimeout(function(){
    let lastWord = wordsByLength[1];
    update(frame, wordsByLength, width, height, x, d => d.value/Math.pow(26, +d.key));
  }, 3000);
  
  // let x = scaleBand()
  //   .range([0, width])
  //   .padding(0.1);
  
  // let y = scaleLinear()
  //   .range([height, 0]);
  
  // x.domain(wordsByLength.map(w => w.key));
  // y.domain([0, d3Max(wordsByLength, w => w.value)]);

  // frame.selectAll('.bar')
  //     .data(wordsByLength)
  //   .enter().append('rect')
  //     .attr('class', 'bar')
  //     .attr('fill', 'black')
  //     .attr('x', d => x(d.key))
  //     .attr('width', x.bandwidth())
  //     .attr('y', d => y(d.value))
  //     .attr('height', d => height - y(d.value));
    
  // frame.append('g')
  //   .attr('transform', `translate(0,${height})`)
  //   .call(axisBottom(x));
  
  // frame.append('g')
  //   .call(axisLeft(y));

    // let spec = {
    //   "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
    //   "width": 1000,
    //   "height": 600,
    //   "data": {
    //     "values": keyValuePairs<number>(wordsByLength)
    //   },
    //   "mark": "bar",
    //   "encoding": {
    //     "x": {"field": "key", "type": "ordinal", "sort": "none"},
    //     "y": {"field": "value", "type": "quantitative"}
    //   }
    // };
    // vega.embed('.slide-visual', spec);
  });
}