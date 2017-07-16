import { Gaddag, GaddagNode } from './gaddag';
import { bingosSample } from './data/bingos-sample';
// import { bingos } from './data/bingos';
// import { words } from './data/words';
import * as d3 from 'd3';

let wordList = bingosSample.words;
var timestart = new Date().getTime();

let dag = new Gaddag();
wordList.slice(100).forEach(w => dag.addWord(w));
console.log(`Time: ${new Date().getTime() - timestart}ms`);
console.log("\n------------------------\n");

timestart = new Date().getTime();
let dagNodes = dag.getNodes();
let dagEdges = dag.getEdges();

let svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

let simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id((d: any) => d.id))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));

let link = svg.append('g')
  .attr('class', 'links')
  .selectAll('line')
  .data(dagEdges)
  .enter().append('line')
  .attr('stroke-width', "2");

let node = svg.append('g')
  .attr('class', 'nodes')
  .selectAll('circle')
  .data(dagNodes)
  .enter().append('circle')
  .attr('r', 5)
  .attr('fill', (d: any) => {
    return d.token == 'root' ? 'red' : 'blue';
  });

node.append('title')
  .text(d => `${d.id}: ${d.token}`);

let ticked = () => {
  link
    .attr("x1", function (d: any) { return d.source.x; })
    .attr("y1", function (d: any) { return d.source.y; })
    .attr("x2", function (d: any) { return d.target.x; })
    .attr("y2", function (d: any) { return d.target.y; });

  node
    .attr("cx", function (d: any) { return d.x; })
    .attr("cy", function (d: any) { return d.y; });
  console.log(`Time: ${new Date().getTime() - timestart}ms`);
}

simulation
  .nodes(dagNodes)
  .on("end", ticked);

let forceLink: any = simulation.force('link');
forceLink.links(dagEdges);