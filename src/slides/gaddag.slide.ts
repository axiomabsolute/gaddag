import * as d3 from 'd3';
import { Dictionary, flatten, Gaddag, GaddagEdge, GaddagNode, values } from '../gaddag';
import { Fix } from '../browser';

function diagonal(source: VisualNode, target: VisualNode) {
  return "M" + target.x + "," + target.y
    + "C" + (source.x + 30) + "," + target.y
    + " " + (source.x + 30) + "," + source.y
    + " " + source.x + "," + source.y;
}

let legendItems = [
  { 'result': '', 'description': 'Prefix or Suffix Node', 'color': d3.schemeCategory10[0] },
  { 'result': '', 'description': 'Turn Node', 'color': d3.schemeCategory10[1] },
  { 'result': '', 'description': 'Complete Word', 'color': d3.schemeCategory10[2] },
  { 'result': 'halt', 'description': 'Traversal Failure Point', 'color': d3.schemeCategory10[3] },
  { 'result': 'step', 'description': 'Intermediary Node', 'color': d3.schemeCategory10[4] },
  { 'result': 'success', 'description': 'Matching Word Node', 'color': d3.schemeCategory10[5] },
  { 'result': 'query', 'description': 'Node Matching Query Input', 'color': d3.schemeCategory10[6] },
  { 'result': undefined, 'description': 'Untraversed Node', 'color': '#DDD' },
];

class VisualNode {
  constructor(public node: GaddagNode, public x: number, public y: number) { }
}

function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>,
  width: number,
  height: number,
  dag: Gaddag,
  displaySearchPath: boolean
) {
  console.log(width);
  console.log(height);
  frame.html('');
  let dagEdges = dag.getEdges();
  let root = dag.root;

  let nodesByDepth = [[root]].concat(values(dag.getNodesByDepth()));
  let depth = nodesByDepth.length;
  let breadth = d3.max(nodesByDepth.map(t => t.length));

  let xScale = d3.scaleLinear()
    .domain([0, depth])
    .range([0, width]);

  let yScale = d3.scaleLinear()
    .domain([0, breadth])
    .range([height, 0]);

  let nodeData = flatten(nodesByDepth.map((tier, i) => tier.map((node, j) => new VisualNode(node, xScale(i), yScale(j)))));
  let nodeLookup = Dictionary.ToLookup<VisualNode, VisualNode>(nodeData, vn => '' + vn.node.id, vn => vn);

  let links = frame.selectAll('.link')
    .data(dagEdges);

  links
    .enter().append('path')
    .merge(links)
    .attr('class', 'link')
    .attr('d', d => diagonal(nodeLookup['' + d.source], nodeLookup['' + d.target]));

  let nodes = frame.selectAll('.node')
    .data(nodeData);

  let newNodeGroups = nodes.enter().append('g');

  let nodeGroups = newNodeGroups
    .merge(nodes)
    .attr('class', d => {
      if (d.node === dag.root) {
        return 'node dag-root';
      }
      if (d.node.token === Gaddag.TurnToken) {
        return 'node dag-node node--turn';
      }
      if (d.node.isCompleteWord) {
        return 'node dag-node node--complete-word'
      }
      return 'node dag-node';
    })
    .attr('transform', d => `translate(${d.x},${d.y})`);

  newNodeGroups
    .append('circle')
    .attr('r', '8')
    .attr('fill', (d) => {
      if (d.node.meta['result'] === 'halt') {
        return d3.schemeCategory10[3];
      }
      if (d.node.meta['result'] === 'step') {
        return d3.schemeCategory10[4];
      }
      if (d.node.meta['result'] === 'success') {
        return d3.schemeCategory10[5];
      }
      if (d.node.meta['result'] === 'query') {
        return d3.schemeCategory10[6];
      }
      if (displaySearchPath) {
        return '#DDD';
      }
      if (d.node === dag.root) {
        return 'black';
      }
      if (d.node.token === Gaddag.TurnToken) {
        return d3.schemeCategory10[1];
      }
      if (d.node.isCompleteWord) {
        return d3.schemeCategory10[2];
      }
      return d3.schemeCategory10[0];
    });

  newNodeGroups
    .append('text')
    .attr('dy', 3)
    .attr('x', d => d.node.children ? -12 : 12)
    .style('text-anchor', d => d.node.children ? 'end' : 'start')
    .text(d => d.node.token);


  let anyWindow: any = window;
  anyWindow['dag'] = dag;
}

export class InitialState {
  constructor(public dataLoaded: Promise<[string[], Fix[]]>, public dag: Gaddag, public expanded: boolean = false) { }
}

export function bootstrap(host: Element, initialState: InitialState) {

  let svg = d3.select(host).select("svg"),
    d3Host = d3.select(host),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 60, right: 120, bottom: 120, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;

  svg
    .attr('height', rawHeight)
    .attr('width', rawWidth);

  let frame = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  let legend = svg.append('g')
    .attr('transform', `translate(${width + 20},${margin.top*2})`)
    .attr('class', 'legend');

  initialState.dataLoaded.then(() => {
    let legendTitle = legend
      .append('g')
      .attr('class', 'legend-title')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
        .append('text')
          .text('Legend:');
    legendItems.forEach( (d, i) => {
      let legendItem = legend.append('g')
        .attr('class', 'legend-group-item')
        .attr('transform', () => `translate(5,${(25*(i+1)) + 5})`)

      legendItem.append('circle')
        .attr('r', 10)
        .attr('fill', () => d.color);
      
      legendItem.append('text')
        .text(() => d.description)
        .attr('transform', () => `translate(20,5)`)
    });

    d3.select(document.querySelector('.add-word-button'))
      .on('click', function () {
        let wordToAdd = (<HTMLInputElement>document.querySelector('#add-word')).value;
        if (!wordToAdd) { return; }
        initialState.dag.addWord(wordToAdd);
        initialState.dag.clearMeta();
        update(frame, width, height, initialState.dag, false);
      });

    d3.select(document.querySelector('.check-validity-button'))
      .on('click', function () {
        let wordToCheck = (<HTMLInputElement>document.querySelector('#check-validity')).value;
        if (!wordToCheck) { return; }
        initialState.dag.clearMeta();
        initialState.dag.checkWord(wordToCheck);
        update(frame, width, height, initialState.dag, true);
      });

    d3.select(document.querySelector('.prefix-words-button'))
      .on('click', function () {
        let prefixToSearch = (<HTMLInputElement>document.querySelector('#prefix-words')).value;
        if (!prefixToSearch) { return; }
        initialState.dag.clearMeta();
        initialState.dag.wordsForPrefix(prefixToSearch);
        update(frame, width, height, initialState.dag, true);
      });

    d3.select(document.querySelector('.suffix-words-button'))
      .on('click', function () {
        let suffixToSearch = (<HTMLInputElement>document.querySelector('#suffix-words')).value;
        if (!suffixToSearch) { return; }
        initialState.dag.clearMeta();
        initialState.dag.wordsForSuffix(suffixToSearch);
        update(frame, width, height, initialState.dag, true);
      });

    d3.select(document.querySelector('.words-containing-button'))
      .on('click', function () {
        let substringToSearch = (<HTMLInputElement>document.querySelector('#words-containing')).value;
        if (!substringToSearch) { return; }
        initialState.dag.clearMeta();
        initialState.dag.wordsContaining(substringToSearch);
        update(frame, width, height, initialState.dag, true);
      });

    d3.select(document.querySelector('.words-for-hand-button'))
      .on('click', function () {
        let handtoSearch = (<HTMLInputElement>document.querySelector('#words-for-hand')).value;
        if (!handtoSearch) { return; }
        initialState.dag.clearMeta();
        initialState.dag.wordsForHand(handtoSearch, false);
        update(frame, width, height, initialState.dag, true);
      });

    d3.select(document.querySelector('.clear-highlight-button'))
      .on('click', function () {
        initialState.dag.clearMeta();
        update(frame, width, height, initialState.dag, false);
      });

    update(frame, width, height, initialState.dag, false)
  })
}