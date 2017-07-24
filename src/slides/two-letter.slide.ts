import { event, select } from 'd3';
import { Dictionary, Gaddag, keyValuePairs, values } from '../gaddag';

let d3 = { event, select };

const letters: string[] = [];
let i = 'a'.charCodeAt(0);
let j = 'z'.charCodeAt(0);
for(;i <= j; i++) {
  letters.push(String.fromCharCode(i));
}
let cellSize = 20,
    axisMargin = 20,
    isWordColor = 'red',
    nonWordColor = 'black',
    baseCharCode = 'a'.charCodeAt(0),
    cellPadding = 3,
    cellRadius = Math.round((cellSize - (cellPadding * 2))/2);


function truncate(value: number, decimals: number) {
  decimals = decimals || 0;
  let shift = 10 * decimals;
  return Math.round(value * shift)/shift;
}

function range(start: number, max:number) {
  let result = [];
  for(;start<max;start++){
    result.push(start);
  }
  return result;
}

var tooltip = d3.select(".tooltip")				
  .style("opacity", 0);
  

function showTooltip(value: string) {
  tooltip.transition()		
          .duration(200)		
          .style("opacity", .9);		
  tooltip.html(value)	
          .style("left", (d3.event.pageX) + "px")		
          .style("top", (d3.event.pageY - 28) + "px");	
}

function hideTooltip() {
  tooltip.transition()		
    .duration(500)		
    .style("opacity", 0);	
}

let kvData: {key: string, value: number}[] = [];


function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>,
  data: Dictionary<number>,
  isWordColor: string,
  nonWordColor: string,
  collapseSecondLetter: boolean,
  topAxis: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>
) {
  kvData.splice(0, kvData.length);
  if (!collapseSecondLetter) {
    kvData.push(...keyValuePairs(data));
  } else {
    let collapsedValues = keyValuePairs(data).reduce( (p: {[index: string]: number}, n) => {
      p[n.key[0]] = p[n.key[0]] || 0;
      p[n.key[0]] = p[n.key[0]] + n.value;
      return p;
    }, {});
    kvData.push(...keyValuePairs(collapsedValues));
  }

  let oneLetterWords= kvData.filter(kv => kv.key.length == 1);
  let twoLetterWords = kvData.filter(kv => kv.key.length == 2);

  let twoLetterWordNodes = frame.selectAll('.two-letter-word')
    .data(twoLetterWords)
  
  twoLetterWordNodes.enter()
    .append('circle')
    .merge(twoLetterWordNodes)
    .on('mouseover', d => showTooltip(`${d.key} - ${d.value ? 'valid' : 'invalid'}`))
    .on('mouseout', hideTooltip)
    .attr('class', 'two-letter-word')
    .attr('title', d => d.key)
    .attr('r', cellRadius)
    .attr('dx', cellPadding)
    .attr('dy', cellPadding)
    .attr('fill', d => d.value ? isWordColor : nonWordColor)
    .attr('transform', (d, i) => {
      return `translate(0,${(d.key.charCodeAt(0) - baseCharCode) * cellSize})`;
    })
    .transition()
    .attr('transform', (d, i) => {
      return `translate(${(d.key.charCodeAt(1) - baseCharCode) * cellSize},${(d.key.charCodeAt(0) - baseCharCode) * cellSize})`;
    });
  
  twoLetterWordNodes.exit()
    .transition()
    .attr('transform', (d: {key: string}) => `translate(0,${(d.key.charCodeAt(0) - baseCharCode) * cellSize})`)
    .remove();

  let oneLetterWordNodes = frame.selectAll('.one-letter-word')
    .data(oneLetterWords)
  
  oneLetterWordNodes.enter()
    .append('rect')
    .merge(oneLetterWordNodes)
    .on('mouseover', d => showTooltip(`${d.value} (~${truncate(d.value/26, 2)}%)`))
    .on('mouseout', hideTooltip)
    .attr('class', 'one-letter-word')
    .attr('title', d => d.value)
    .attr('height', cellRadius)
    .attr('width', 0)
    .attr('dx', cellPadding)
    .attr('dy', cellPadding)
    .attr('fill', d => d.value ? isWordColor : nonWordColor)
    .attr('transform', (d, i) => {
      return `translate(0,${cellPadding + (d.key.charCodeAt(0) - baseCharCode) * cellSize})`;
    })
    .transition()
    .attr('width', d => d.value * cellSize);
  
  oneLetterWordNodes.exit()
    .transition()
    .attr('width', 0)
    .remove();
  
  let topAxisLabels = collapseSecondLetter ?  range(1,27).map(i => `${i}`) : letters;
  let topAxisTitle = collapseSecondLetter ? 'Count of 2-Letter Words Starting With' : 'Second Letter';

  topAxis.selectAll('.letter').remove();
  topAxis.selectAll('.letter')
    .data(topAxisLabels).enter()
    .append('text')
    .attr('class', 'letter')
    .attr('transform', (d, i) => `translate(${i*cellSize},${axisMargin})`)
    .text(d => d);
  
  topAxis.select('.top-axis-label').remove();
  
  topAxis
    .append('g')
    .attr('class', 'top-axis-label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${13*cellSize},0)`)
    .append('text')
      .text(topAxisTitle);
}

export class InitialState{
  constructor(public gaddag: Gaddag, public dagDataLoaded: Promise<string[]>, public expanded: boolean = false) {}
}

export function bootstrap(host: Element, initialState: InitialState) {
  let svg = d3.select(host).select("svg"),
    twoLetterPlaysPlaceholder = host.querySelector('.two-letter-plays'),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;

  initialState.dagDataLoaded.then(() => {
    let twoLetterWords = Dictionary.ToLookup(initialState.gaddag.wordsOfLength(2), i => i, i => true);

    let data = new Dictionary<number>();
    letters.forEach( l1 => letters.forEach(l2 => {
      let key = `${l1}${l2}`;
      data[key] = twoLetterWords[key] ? 1 : 0;
    }));

    let frame = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    let leftAxis = frame
      .append('g')
      .attr('class', 'left-axis')
      .attr('transform', `translate(0,${cellSize + axisMargin})`);
    
    let gridArea = frame
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${cellSize + axisMargin + cellPadding},${cellSize + axisMargin - (cellSize / 2)})`);
    
    let topAxis = frame
      .append('g')
      .attr('class', 'top-axis')
      .attr('transform', `translate(${cellSize + axisMargin},0)`);

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
    
    let validTwoLetterPlays = values(data).filter(f => f).length;
    twoLetterPlaysPlaceholder
      .innerHTML = `${validTwoLetterPlays} (about ${truncate(values(data).filter(f => f).length / (26*26), 2)}%)`;
    
    let previousCollapseFirstLetter = false;
    topAxis.on('click', function() {
      update(gridArea, data, isWordColor, nonWordColor, !previousCollapseFirstLetter, topAxis);
      previousCollapseFirstLetter = !previousCollapseFirstLetter;
    })
    
    update(gridArea, data, isWordColor, nonWordColor, false, topAxis);
  });
}