import { Gaddag, keyValuePairs } from '../gaddag';
import { truncate, showTooltip, hideTooltip } from '../browser';
import * as d3 from 'd3';

declare class vega {
  static embed(el: Element | string, spec: string | any, opts?: any): any;
}

let percentValid = (d: {key: string, value: number}) => d.value/Math.pow(26, +d.key);

function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>,
  data: {
    key: string,
    value: number
  }[],
  width: number,
  height: number,
  marginLeft: number,
  x: d3.ScaleBand<string>,
  powerScaleExponent: number,
  aggregate: (datum: {key: string, value: number}) => number
) {
  let y = d3.scalePow();
  y.exponent(powerScaleExponent);
  y.range([height, 0]);
  
  y.domain([0, d3.max(data, w => aggregate ? aggregate(w) : w.value)]);

  d3.select('#toggle-aggregation')
    .text(() => aggregate ? "Show Percent Valid by Length" : "Show Valid Count by Length")

  let barNodes = frame.selectAll('.bar')
      .data(data);

  barNodes
    .enter().append('rect')
    .merge(barNodes)
      .attr('class', 'bar')
      .attr('fill', d3.schemeCategory20[0])
      .attr('x', d => x(d.key))
      .attr('width', x.bandwidth())
      .attr('title', d => `${aggregate ? aggregate(d) : d.value}%`)
      .on('mouseover', d => showTooltip( `${aggregate ? truncate(aggregate(d), 5) : d.value }`))
      .on('mouseout', hideTooltip)
      .transition()
        .attr('y', d => aggregate ? y(aggregate(d)) : y(d.value))
        .attr('height', d => height - y(aggregate ? aggregate(d) : d.value));
    
  frame.select('.left-axis')
    .remove();
  frame.append('g')
    .attr('class', 'left-axis')
    .call(d3.axisLeft(y));
  
  frame.select('.left-axis-label')
    .remove();
  frame
    .append('g')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(-${marginLeft/2},${height/2}) rotate(-90)`)
    .attr('class', 'left-axis-label')
      .append('text')
      .text(aggregate ? "Percent Valid Words" : "Count of Words");
}

export class InitialState{
  constructor( public dataLoaded: Promise<string[]>, public expanded: boolean = false) {}
}

export function bootstrap(host: Element, initialState: InitialState) {

  let svg = d3.select(host).select("svg"),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 20, right: 120, bottom: 120, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;
  
  let shouldAggregate = false;
  
  initialState.dataLoaded.then((wordList) => {
    let wordsByLength = keyValuePairs<number>(wordList.reduce((result: {[length: number]: number}, word) => {
      result[word.length] = result[word.length] || 0;
      result[word.length] = result[word.length] + 1;
      return result;
    }, {}));

  let frame = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  let x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
  
  x.domain(wordsByLength.map(w => w.key));
  
  frame.select('.bottom-axis')
    .remove();
  frame.append('g')
    .attr('class', 'bottom-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));
  
  svg
    .append('g')
    .attr('class', 'bottom-axis-label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${margin.left + rawWidth/2}, ${rawHeight - (margin.bottom/2)})`)
    .append('text')
      .text('Word length');
  
  update(frame, wordsByLength, width, height, margin.left, x, 1, null);

  setTimeout(function(){
    let lastWord = wordsByLength[1];
    shouldAggregate = !shouldAggregate;
    update(frame, wordsByLength, width, height, margin.left, x, 1, shouldAggregate ? percentValid : null);
  }, 3000);

  d3.select('#toggle-aggregation')
    .text(() => shouldAggregate ? "Show Percent Valid by Length" : "Show Valid Count by Length")
    .on('click', () => {
      shouldAggregate = !shouldAggregate;
      let exponent = +d3.select('#axis-power').attr('value');
      update(frame, wordsByLength, width, height, margin.left, x, exponent, shouldAggregate ? percentValid : null);
    });
  
  d3.select('#axis-power')
    .on('input', function(){
      let self: HTMLInputElement = <HTMLInputElement>this;
      d3.select('.current-axis-power')
        .text(self.value);
    })
    .on('change', function() {
      let self: HTMLInputElement = <HTMLInputElement>this;
      update(frame, wordsByLength, width, height, margin.left, x, +self.value, shouldAggregate ? percentValid : null);
    });
  
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
    //   "width": 1(.5);00,
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