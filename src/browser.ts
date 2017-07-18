import { Gaddag, GaddagNode, permute, unique, values } from './gaddag';
import { clabbersSlideInitialState, clabbersSlide } from './slides/intro-slide';
// Other word sets
// import { bingosSample } from './data/bingos-sample';
// import { bingos } from './data/bingos';
// import { words } from './data/words';
import * as d3 from 'd3';

// let wordList = words.words;
var timestart = new Date().getTime();

// function diagonal(d: d3.HierarchyPointNode<{}>) {
//   return "M" + d.y + "," + d.x
//       + "C" + (d.parent.y + 100) + "," + d.x
//       + " " + (d.parent.y + 100) + "," + d.parent.x
//       + " " + d.parent.y + "," + d.parent.x;
// }

// let dag = new Gaddag();
// let dagSample = new Gaddag();
// wordList.slice(50,75).forEach(w => dagSample.addWord(w));
// wordList.forEach(w => dag.addWord(w));
console.log("------------------------\n");
console.log(`Time: ${new Date().getTime() - timestart}ms`);
console.log("------------------------\n");

// let dagNodes = dag.getNodes();
// let dagEdges = dag.getEdges();

// let svg = d3.select("svg"),
//   rawWidth = 1875,
//   rawHeight = 950,
//   margin = { top: 20, right: 120, bottom: 20, left: 120 },
//   width = rawWidth - margin.right - margin.left,
//   height = rawHeight - margin.top - margin.bottom;

// svg
//   .attr('height', rawHeight)
//   .attr('width', rawWidth);

// let frame = svg
//   .append('g')
//     .attr('transform', `translate(${margin.left},${margin.top})`) ;

//  let hierarchyRoot = d3.hierarchy(dagSample.root, n => values(n.children));
//  let tree = d3.tree<GaddagNode>()
//   .size([height, width - 160]);
//  let treeRoot = tree(hierarchyRoot);

//  let links = frame.selectAll('.link')
//   .data(treeRoot.descendants().slice(1))
//   .enter().append('path')
//     .attr('class', 'link')
//     .attr('d', diagonal);

// let nodes = frame.selectAll('.node')
//     .data(treeRoot.descendants())
//   .enter().append('g')
//     .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'} ${d.data.isCompleteWord ? 'node--complete-word' : ''}` )
//     .attr('transform', d => `translate(${d.y},${d.x})`);

// nodes.append('circle')
//   .attr('r', 2.5);

// nodes.append('text')
//   .attr('dy', 3)
//   .attr('x', d => d.children ? -8 : 8)
//   .style('text-anchor', d => d.children ? 'end' : 'start')
//   .text(d => d.data.token);

// console.log(wordList.reduce( (p: {[length: number]: number}, n) => {
//   p[n.length] = p[n.length] || 0;
//   p[n.length] = p[n.length] + 1;
//   return p;
// }, {} ));

// let anyWindow: any = window;
// anyWindow['dag'] = dag;

// console.log(dag.wordsForHandByPermutation('tion'));

type TemplateIds = '#layout-exploration-slide' | '#layout-message-slide';
type Slide<T> = { templateId: TemplateIds, markupId: string, bootstrap: (host: Element, initialState: T) => void, initialState: T };

class SlideShow {
  private host: Element;
  private _slideNumber: number;
  public get slideNumber(): number {
    return this._slideNumber;
  }
  public get slide(): Slide<any> {
    return this.slides[this._slideNumber];
  }

  public next(): boolean {
    if (this._slideNumber < this.slides.length - 1) {
      this._slideNumber = this._slideNumber + 1;
      return true;
    }
    return false;
  }

  public previous(): boolean {
    if (this._slideNumber > 0) {
      this._slideNumber = this._slideNumber - 1;
      return true;
    }
    return false;
  }

  private goToPage(index: number): boolean {
    if (index >= 0 && index < this.slides.length) {
      this._slideNumber = index;
      return true;
    }
    return false;
  }

  private renderSlide() {
    let currentSlide = this.host.querySelector('.show');
    currentSlide.innerHTML = '';

    let newTemplate: any = document.querySelector(this.slide.templateId);
    let clone: Element = document.importNode(newTemplate.content, true);

    if (this.slide.markupId) {
      let newSlideMarkupTemplate: any = document.querySelector(this.slide.markupId);
      let newSlideMarkupNode: Element = document.importNode(newSlideMarkupTemplate.content, true);
      for (var i = 0; i < newSlideMarkupNode.children.length; i++) {
        let child = newSlideMarkupNode.children[i];
        let childClasses = child.className.split(' ');
        childClasses.forEach(c => {
          if (c.length == 0) { return; }
          let node = clone.querySelector(`.${c}`);
          node.innerHTML = child.innerHTML;
        });
      }
    }

    this.slide.bootstrap(clone, this.slide.initialState);

    currentSlide.appendChild(clone);
  }

  private renderPageControls() {
    d3.selectAll('.page-dot')
      .classed('page-dot--active', (d, i) => i == this._slideNumber);
    this.renderSlide();
  }

  constructor(public slides: Slide<any>[], initialSlide: number = 0, hostSelector: string = ".slide-show") {
    this._slideNumber = slides[initialSlide] ? initialSlide : 0;

    this.host = document.querySelector(hostSelector);

    this.renderSlide();

    d3.select(this.host).select('.page-dots')
      .selectAll('.page-dot')
      .data(slides).enter()
      .append('a')
      .attr('href', (d, i) => `#page-${i}`)
      .attr('class', (d, i) => 'page-dot')
      .classed('page-dot--active', (d, i) => i == this._slideNumber)
      .text((d, i) => i + 1)
      .on('click', (d, i) => {
        this.goToPage(i);
        this.renderPageControls();
      });

    d3.select('.next-slide').on('click', () => {
      let result = this.next();
      if (!result) { return; }
      this.renderSlide();
      this.renderPageControls();
    });
    d3.select('.prev-slide').on('click', () => {
      let result = this.previous();
      if (!result) { return; }
      this.renderSlide();
      this.renderPageControls();
    });
  }
}

function populateExplorationSlide(host: Element, title: string, messages: string[], controls: Element, explorations: string[]) {
  d3.select(host).select('.slide-title').text(title);
  d3.select(host).select('.slide-text')
    .selectAll('p').data(messages)
    .enter().append('p')
    .text(d => d);
}

function helloWorldSlide(host: Element) {
  d3.select(host).select('.slide-title').text("Hello");
  d3.select(host).select('.slide-text').text("World!");
}

let slides: Slide<any>[] = [
  { templateId: '#layout-exploration-slide', markupId: '#clabbers-slide', bootstrap: clabbersSlide, initialState: clabbersSlideInitialState },
  { templateId: '#layout-message-slide', markupId: null, bootstrap: helloWorldSlide, initialState: {} },
];

let initialPage = 0;
if (window.location.hash) {
  let splits = window.location.hash.split('page-');
  initialPage = splits.length > 1 ? parseInt(splits[1]) : 0;
}

let show = new SlideShow(slides, initialPage);