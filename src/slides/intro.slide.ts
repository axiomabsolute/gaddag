import { ascending, schemeCategory20, select, selectAll } from 'd3';

let d3 = { ascending, schemeCategory20, select, selectAll };

export const clabbersSlideInitialState = { expanded: true };

function update(colorScale: string[], anagramData: {token: string, end: number}[], frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>) {
  let introNodes = frame
    .selectAll('.intro-node')
    .data(anagramData);

  let introNodesEnter = 
    introNodes.enter().append('g')
      .merge(introNodes)
      .attr('class', 'intro-node')
      .attr('transform', (d, i) => `translate(${200 + (i * 50)},${200})`);

  introNodesEnter
    .append('circle')
    .attr('class', 'anagram-node')
    .attr('r', 20)
    .style('fill', (d, i) => colorScale[i]);

  introNodes
    .exit().remove();

  introNodesEnter
    .append('text')
    .style('text-anchor', 'middle')
    .attr('dy', 3)
    .text((d: any) => d.token);

}

/**
 * Renders a spaced set of circles, each representing the letters of a word, in a random order, then animates them
 * to return the original order. Attaches even handlers for clicking to scramble the word, upding the word based on
 * a new input value, and expanding a section of descriptive explorations.
 * @param host 
 * @param initialState 
 */
export function clabbersSlide(host: Element, initialState: { expanded: boolean }) {
  let anagramData = (<HTMLInputElement>host.querySelector('#anagram-letters')).value
    .toUpperCase()
    .split('')
    .map((c, i) => {
      return { token: c, end: i };
    }).sort((a, b) => d3.ascending(Math.random(), Math.random()));
  var colorScale = d3.schemeCategory20;

  let svg = d3.select(host).select("svg"),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;

  let frame = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  function anagram() {
    frame.selectAll('.intro-node')
      .sort((a, b) => d3.ascending(Math.random(), Math.random()))
      .transition().duration(700)
      .attr('transform', (d, i) => `translate(${200 + (i * 50)},${200})`);
  }

  function scheduleUnscramble() {
    setTimeout(() => {
      frame.selectAll('.intro-node')
        .data(anagramData)
        .transition().duration(700)
        .attr('transform', (d, i) => `translate(${200 + (d.end * 50)},${200})`)
    }, 3000);
  }

  update(colorScale, anagramData, frame);
  scheduleUnscramble();

  d3.select(host).select('#anagram-update-button')
    .on('click', function(){
      let data = ((<HTMLInputElement>document.querySelector('#anagram-letters')).value)
          .toUpperCase()
          .split('')
          .map((c, i) => {
            return { token: c, end: i };
          })
          .sort((a, b) => d3.ascending(Math.random(), Math.random()));
      anagramData.splice(0, anagramData.length);
      anagramData.push(...data);
      update(colorScale, anagramData, frame);
      scheduleUnscramble();
    });

  svg.on('click', anagram);
}