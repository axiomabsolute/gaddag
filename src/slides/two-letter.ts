import { Dictionary, Gaddag, keyValuePairs, values } from '../gaddag';

import * as d3 from 'd3';

function update(frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>, data: Dictionary<boolean>, cellSize: number) {
  let baseCharCode = 'a'.charCodeAt(0);
  let cellPadding = 3;
  let cellRadius = Math.floor((cellSize - (cellPadding * 2))/2);
  frame.selectAll('.two-letter-word')
    .data(keyValuePairs(data)).enter()
    .append('circle')
    .attr('class', 'two-letter-word')
    .attr('title', d => d.key)
    .attr('r', cellRadius)
    .attr('dx', cellPadding)
    .attr('dy', cellPadding)
    .attr('fill', d => d.value ? 'red' : 'black')
    .attr('transform', (d, i) => {
      return `translate(${(d.key.charCodeAt(1) - baseCharCode) * cellSize},${(d.key.charCodeAt(0) - baseCharCode) * cellSize})`;
    })
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

  let frame = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  let letters: string[] = [];
  let i = 'a'.charCodeAt(0);
  let j = 'z'.charCodeAt(0);
  for(;i <= j; i++) {
    letters.push(String.fromCharCode(i));
  }

  let data = new Dictionary<boolean>();
  letters.forEach( l1 => letters.forEach(l2 => {
    let key = `${l1}${l2}`;
    data[key] = twoLetterWords[key];
  }));

  let cellSize = 20;

  let topAxis = frame
    .append('g')
    .attr('class', 'top-axis')
    .attr('transform', `translate(${cellSize + 20},0)`);

  let leftAxis = frame
    .append('g')
    .attr('class', 'left-axis')
    .attr('transform', `translate(0,${cellSize + 20})`);
  
  let gridArea = frame
    .append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(${cellSize + 5 + 20},${cellSize - 5 + 20})`);
  
  topAxis.selectAll('.letter')
    .data(letters).enter()
    .append('text')
    .attr('transform', (d, i) => `translate(${i*cellSize},20)`)
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
    .attr('transform', (d, i) => `translate(20,${i*cellSize})`)
    .text(d => d);
  
  leftAxis
    .append('g')
    .attr('class', 'left-axis-label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(0,${13*cellSize}) rotate(-90)`)
    .append('text')
      .text('First letter');
  
  host.querySelector('.two-letter-plays')
    .innerHTML = `${values(data).filter(f => f).length}`;
  

  d3.select(host).select('.slide-explorations')
    .classed('slide-explorations--expanded', initialState.expanded);
  d3.select(host).select('.explorations-handle .collapse-status-icon')
    .classed('fa-chevron-up', initialState.expanded)
    .classed('fa-chevron-down', !initialState.expanded);

  d3.select(host).select('.explorations-handle').on('click', () => {
    let isCurrentlyExpanded = d3.select('.slide-explorations').classed('slide-explorations--expanded');
    // Add --expanded
    d3.select('.slide-explorations')
      .classed('slide-explorations--expanded', !isCurrentlyExpanded);
    // Set collapse icon
    d3.select('.explorations-handle .collapse-status-icon')
      .classed('fa-chevron-up', isCurrentlyExpanded)
      .classed('fa-chevron-down', !isCurrentlyExpanded);
  });

  update(gridArea, data, cellSize);
}