import * as d3 from 'd3';

export const clabbersSlideInitialState = { expanded: true };

export function clabbersSlide(host: Element, initialState: { expanded: boolean }) {
  let data = (<HTMLInputElement>host.querySelector('#anagram-letters')).value
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

  let introNodes = frame
    .selectAll('.intro-node')
    .data(data)
    .enter().append('g')
      .attr('class', 'intro-node')
      .attr('transform', (d, i) => `translate(${200 + (i * 50)},${200})`);

  introNodes
    .append('circle')
    .attr('class', 'anagram-node')
    .attr('r', 20)
    .style('fill', (d, i) => colorScale[i]);

  introNodes
    .exit().remove();

  introNodes
    .append('text')
    .style('text-anchor', 'middle')
    .attr('dy', 3)
    .text(d => d.token);

  function anagram() {
    frame.selectAll('.intro-node')
      .sort((a, b) => d3.ascending(Math.random(), Math.random()))
      .transition().duration(700)
      .attr('transform', (d, i) => `translate(${200 + (i * 50)},${200})`);
  }

  d3.select(host).select('#anagram-letters')
    .on('change', function(){
      let data = ((<HTMLInputElement>this).value)
          .split('')
          .map((c, i) => {
            return { token: c, end: i };
          });
      introNodes.data(data);
    });

  svg.on('click', anagram);

  setTimeout(() => {
    frame.selectAll('.intro-node')
      .data(data)
      .transition().duration(700)
      .attr('transform', (d, i) => `translate(${200 + (d.end * 50)},${200})`)
  }, 3000);

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
}