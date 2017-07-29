import { hierarchy, select, tree } from 'd3';
import { Gaddag, GaddagEdge, GaddagNode, values } from '../gaddag';
import { Fix } from '../browser';

let d3 = { hierarchy, select, tree };

function diagonal(d: d3.HierarchyPointNode<{}>) {
  return "M" + d.y + "," + d.x
      + "C" + (d.parent.y + 100) + "," + d.x
      + " " + (d.parent.y + 100) + "," + d.parent.x
      + " " + d.parent.y + "," + d.parent.x;
}

function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>,
  width: number,
  height: number,
  dag: Gaddag,
  root: GaddagNode,
  dagEdges: GaddagEdge[],
  dagNodes: GaddagNode[],
  pattern: string
) {
    let hierarchyRoot = d3.hierarchy(root, n => values(n.children));
    let tree = d3.tree<GaddagNode>()
      .size([height, width - 160]);
    let treeRoot = tree(hierarchyRoot);

    let links = frame.selectAll('.link')
      .data(treeRoot.descendants().slice(1))
      .enter().append('path')
        .attr('class', 'link')
        .attr('d', diagonal);

    let nodes = frame.selectAll('.node')
        .data(treeRoot.descendants())
      .enter().append('g')
        .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'} ${d.data.isCompleteWord ? 'node--complete-word' : ''}` )
        .attr('transform', d => `translate(${d.y},${d.x})`);

    nodes.append('circle')
      .attr('r', 2.5);

    nodes.append('text')
      .attr('dy', 3)
      .attr('x', d => d.children ? -8 : 8)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.token);

    let anyWindow: any = window;
    anyWindow['dag'] = dag;
}

export class InitialState{
  constructor( public dataLoaded: Promise<[string[], Fix[]]>, public dag: Gaddag, public expanded: boolean = false) {}
}

export function bootstrap(host: Element, initialState: InitialState) {
  let svg = d3.select(host).select("svg"),
    rawWidth = 1875,
    rawHeight = 950,
    margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;

  svg
    .attr('height', rawHeight)
    .attr('width', rawWidth);

  let frame = svg
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`) ;

  initialState.dataLoaded.then(() => {
    let dagNodes = initialState.dag.getNodes();
    let dagEdges = initialState.dag.getEdges();
    let root = initialState.dag.root;

    update(frame, width, height, initialState.dag, root, dagEdges, dagNodes, '')
  })

  // console.log(dag.wordsForHandByPermutation('tion'));
}