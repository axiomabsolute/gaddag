import { Gaddag, GaddagNode, permute, unique, values } from './gaddag';
import { clabbersSlideInitialState, clabbersSlide } from './slides/intro-slide';
import { bootstrap as twoLetterSlide, InitialState as TwoLetterState } from './slides/two-letter'
import { layout as explorationLayout } from './layouts/exploration-slide.layout';
// Other word sets
// import { bingosSample } from './data/bingos-sample';
// import { bingos } from './data/bingos';
import { words } from './data/words';
import * as d3 from 'd3';

let wordList = words.words;
var timestart = new Date().getTime();

// function diagonal(d: d3.HierarchyPointNode<{}>) {
//   return "M" + d.y + "," + d.x
//       + "C" + (d.parent.y + 100) + "," + d.x
//       + " " + (d.parent.y + 100) + "," + d.parent.x
//       + " " + d.parent.y + "," + d.parent.x;
// }

let dag = new Gaddag();
// let dagSample = new Gaddag();
// wordList.slice(50,75).forEach(w => dagSample.addWord(w));
wordList.forEach(w => dag.addWord(w));
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

/**
 * Represents a single slide of a presentation
 */
class Slide<T> 
{
  /**
   * Constructor
   * @param templateId the ID of the template element used as the base layout
   * @param markupId the ID of the template whose top-level children are markup to inject into the layout
   * @param bootstrap a function which takes a host element and initial state object and renders the visualization and hooks up controls
   * @param layout a function which takes a host element and initial state object and renders the shared portions of a given layout
   * @param initialState an initial state object, passed to the bootstrapping function
   */
  constructor(
    public templateId: TemplateIds,
    public markupId: string,
    public bootstrap: (host: Element, initialState: T) => void,
    public layout: (host: Element, initialState: T) => void,
    public initialState: T
  ) { }
};

/**
 * A slide show based on HTML template elements
 */
class SlideShow {
  private host: Element;
  private _slideNumber: number;

  /**
   * Gets current slide number as 0-based index
   * @returns active slide index
   */
  public get slideNumber(): number {
    return this._slideNumber;
  }
  
  /**
   * Gets current slide object
   * @returns active slide
   */
  public get slide(): Slide<any> {
    return this.slides[this._slideNumber];
  }

  /**
   * Increments the slide index if slides remain.
   * @returns boolean value indicating whether the slide index was incremented.
   */
  public next(): boolean {
    if (this._slideNumber < this.slides.length - 1) {
      this._slideNumber = this._slideNumber + 1;
      return true;
    }
    return false;
  }

  /**
   * Decrements the slide index if prior slides remain.
   * @returns boolean value indicating whether the slide index was decremented.
   */
  public previous(): boolean {
    if (this._slideNumber > 0) {
      this._slideNumber = this._slideNumber - 1;
      return true;
    }
    return false;
  }

  /**
   * Jumps to a specified slide.
   * @param index slide index to jump to
   * @returns boolean value indicating whether the slide index was mutated
   */
  private goToPage(index: number): boolean {
    if (index >= 0 && index < this.slides.length) {
      this._slideNumber = index;
      return true;
    }
    return false;
  }

  /**
   * Render the current slide.
   * 
   * Clear out the current slide's markup from the page.
   * Queries the document for the active slide's layout template and creates a clone.
   * Queries the document for the active slide's markup template and creates a clone.
   * For each child element in the cloned markup template, look for an element with the same class
   * in the cloned layout template and replace the contents with the markup contents.
   * Execute the active slide's bootstrap function on the cloned layout template to bootstrap slide-specific functionality.
   * Execute the active slide's layout function on cloned layout template to bootstrap shared functionality.
   * Inject the cloned layout template into the page.
   */
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
        if (child.hasAttribute('data-selector')) {
          let node = clone.querySelector(`${child.getAttribute('data-selector')}`);
          node.innerHTML = child.innerHTML;
        }
      }
    }

    this.slide.bootstrap(clone, this.slide.initialState);
    this.slide.layout(clone, this.slide.initialState);

    currentSlide.appendChild(clone);
  }

  /**
   * Updates the show control state and renders active slide. 
   */
  private renderShowControls() {
    d3.selectAll('.page-dot')
      .classed('page-dot--active', (d, i) => i == this._slideNumber);
  }

  /**
   * 
   * @param slides array of slides, whose order determines the order of the show
   * @param initialSlide index of initial active slide
   * @param hostSelector selector for DOM element hosting the show
   */
  constructor(public slides: Slide<any>[], initialSlide: number = 0, hostSelector: string = ".slide-show") {
    // Set initial slide, defaults to 0 if out of bounds
    this._slideNumber = slides[initialSlide] ? initialSlide : 0;

    // Find the host
    this.host = document.querySelector(hostSelector);

    // Render the current slide
    this.renderSlide();

    // Render the show controls and attach click event handlers
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
        this.renderShowControls();
        this.renderSlide();
      });

    // Attach next slide handler
    d3.select('.next-slide').on('click', () => {
      let result = this.next();
      if (!result) { return; }
      this.renderSlide();
      this.renderShowControls();
      this.renderSlide();
    });
    // Attach previous slide handler
    d3.select('.prev-slide').on('click', () => {
      let result = this.previous();
      if (!result) { return; }
      this.renderSlide();
      this.renderShowControls();
      this.renderSlide();
    });
  }
}

/**
 * Placeholder for future slide types
 * @param host host element to inject into
 */
function helloWorldSlide(host: Element) {
  d3.select(host).select('.slide-title').text("Hello");
  d3.select(host).select('.slide-text').text("World!");
}

/**
 * Set initial page based on URL hash location
 */
let initialPage = 0;
if (window.location.hash) {
  let splits = window.location.hash.split('page-');
  initialPage = splits.length > 1 ? parseInt(splits[1]) : 0;
}

/**
 * Array of slides to setup show.
 * Modify this array to add additional slides to the show.
 */
let slides: Slide<any>[] = [
  { templateId: '#layout-exploration-slide', markupId: '#clabbers-slide', bootstrap: clabbersSlide, layout: explorationLayout, initialState: clabbersSlideInitialState },
  { templateId: '#layout-exploration-slide', markupId: '#two-letter-slide', bootstrap: twoLetterSlide, layout: explorationLayout, initialState: new TwoLetterState(dag) },
  { templateId: '#layout-message-slide', markupId: null, bootstrap: helloWorldSlide, layout: () => {}, initialState: {} },
];

/**
 * Start the show!
 */
let show = new SlideShow(slides, initialPage);