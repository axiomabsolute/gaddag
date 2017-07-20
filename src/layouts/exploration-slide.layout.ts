import * as d3 from 'd3';

export function layout(host: Element, initialState: { expanded: boolean }) {
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