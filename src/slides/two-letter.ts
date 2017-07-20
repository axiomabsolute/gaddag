import { Dictionary, Gaddag, keyValuePairs, values } from '../gaddag';

import * as d3 from 'd3';

function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>, data: Dictionary<number>,
  cellSize: number,
  isWordColor: string,
  nonWordColor: string
) {
  let baseCharCode = 'a'.charCodeAt(0);
  let cellPadding = 3;
  let cellRadius = Math.floor((cellSize - (cellPadding * 2))/2);
  let wordNodes = frame.selectAll('.two-letter-word')
    .data(keyValuePairs(data))
  
  wordNodes.enter()
    .append('circle')
    .merge(wordNodes)
    .attr('class', 'two-letter-word')
    .attr('title', d => d.key)
    .attr('r', cellRadius)
    .attr('dx', cellPadding)
    .attr('dy', cellPadding)
    .attr('fill', d => d.value ? isWordColor : nonWordColor)
    .attr('transform', (d, i) => {
      return `translate(${(d.key.charCodeAt(1) - baseCharCode) * cellSize},${(d.key.charCodeAt(0) - baseCharCode) * cellSize})`;
    });
  
  wordNodes.exit().remove();

}

export class InitialState{
  constructor(public gaddag: Gaddag, public expanded: boolean = false) {}
}
export const initialState = new InitialState(null);

export function bootstrap(host: Element, initialState: InitialState) {
  let twoLetterWords = Dictionary.ToLookup(initialState.gaddag.wordsOfLength(2), i => i, i => true);

  let svg = d3.select(host).select("svg"),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;

  let cellSize = 20,
      axisMargin = 20,
      isWordColor = 'red',
      nonWordColor = 'black';

  let letters: string[] = [];
  let i = 'a'.charCodeAt(0);
  let j = 'z'.charCodeAt(0);
  for(;i <= j; i++) {
    letters.push(String.fromCharCode(i));
  }

  let data = new Dictionary<number>();
  letters.forEach( l1 => letters.forEach(l2 => {
    let key = `${l1}${l2}`;
    data[key] = twoLetterWords[key] ? 1 : 0;
  }));

  let frame = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  let topAxis = frame
    .append('g')
    .attr('class', 'top-axis')
    .attr('transform', `translate(${cellSize + axisMargin},0)`);

  let leftAxis = frame
    .append('g')
    .attr('class', 'left-axis')
    .attr('transform', `translate(0,${cellSize + axisMargin})`);
  
  let gridArea = frame
    .append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(${cellSize + 5 + axisMargin},${cellSize - 5 + axisMargin})`);
  
  topAxis.selectAll('.letter')
    .data(letters).enter()
    .append('text')
    .attr('transform', (d, i) => `translate(${i*cellSize},${axisMargin})`)
    .text(d => d);
  
  topAxis
    .append('g')
    .attr('class', 'top-axis-label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${13*cellSize},0)`)
    .append('text')
      .text('Second letter');

  leftAxis.selectAll('.letter')
    .data(letters).enter()
    .append('text')
    .attr('transform', (d, i) => `translate(${axisMargin},${i*cellSize})`)
    .text(d => d);
  
  leftAxis
    .append('g')
    .attr('class', 'left-axis-label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(0,${13*cellSize}) rotate(-90)`)
    .append('text')
      .text('First letter');
  
  let legend = frame.append('g')
    .attr('transform', `translate(${26*cellSize + (2 * (axisMargin + cellSize))},${axisMargin+cellSize})`)
    .attr('class', 'legend');

  legend.append('g')
    .attr('text-anchor', 'middle')
      .append('text')
        .text('Legend:');

  let positiveKey = legend.append('g')
    .attr('transform', `translate(0,${cellSize})`)
    .attr('class', 'is-word-key');
  
  positiveKey.append('circle')
    .attr('r', 10)
    .attr('fill', isWordColor);
  
  positiveKey.append('text')
    .text('- is a word')
    .attr('transform', `translate(${cellSize + 5},5)`)
  
  let negativeKey = legend.append('g')
    .attr('transform', `translate(0,${3*cellSize})`)
    .attr('class', 'is-not-word-key');

  negativeKey.append('circle')
    .attr('r', 10)
    .attr('fill', nonWordColor);
  
  negativeKey.append('text')
    .text('- is not a word')
    .attr('transform', `translate(${cellSize + 5},5)`)
  
  
  host.querySelector('.two-letter-plays')
    .innerHTML = `${values(data).filter(f => f).length}`;
  
  update(gridArea, data, cellSize, isWordColor, nonWordColor);
}