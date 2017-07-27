import * as d3 from 'd3';
import * as console from 'console';
import { layout as explorationLayout } from './layouts/exploration-slide.layout';
import { Gaddag, GaddagNode, permute, unique, values } from './gaddag';
import { clabbersSlideInitialState, clabbersSlide } from './slides/intro.slide';
import { bootstrap as twoLetterSlide, InitialState as TwoLetterState } from './slides/two-letter.slide'
import { bootstrap as sparseSlide, InitialState as SparseState } from './slides/sparse.slide';
import { bootstrap as patternsSlide, InitialState as PatternsState } from './slides/patterns.slide';

export function truncate(value: number, decimals: number) {
  decimals = decimals || 0;
  let shift = 10 * decimals;
  return Math.round(value * shift)/shift;
}

export function range(start: number, max:number) {
  let result = [];
  for(;start<max;start++){
    result.push(start);
  }
  return result;
}

export var tooltip = d3.select(".tooltip")				
  .style("opacity", 0);
  

export function showTooltip(value: string) {
  tooltip.transition()		
          .duration(200)		
          .style("opacity", .9);		
  tooltip.html(value)	
          .style("left", (d3.event.pageX) + "px")		
          .style("top", (d3.event.pageY - 28) + "px");	
}

export function hideTooltip() {
  tooltip.transition()		
    .duration(500)		
    .style("opacity", 0);	
}

let dag = new Gaddag();
let dagDataLoaded = fetch('/dist/data/words.json').then((response) => {
  var timestart = new Date().getTime();
  return response.json().then((wordList: {words: string[]}) => {
    wordList.words.forEach(w => dag.addWord(w));
    console.log("------------------------\n");
    console.log(`Time: ${new Date().getTime() - timestart}ms`);
    console.log("------------------------\n");
    return wordList.words;
  });
});

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

    this.slide.layout(clone, this.slide.initialState);
    this.slide.bootstrap(clone, this.slide.initialState);

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
    
    d3.select(this.host).select('.show-controls')
      .classed('hidden', false);

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
  { templateId: '#layout-exploration-slide', markupId: '#two-letter-slide', bootstrap: twoLetterSlide, layout: explorationLayout, initialState: new TwoLetterState(dag, dagDataLoaded) },
  { templateId: '#layout-exploration-slide', markupId: '#sparse-slide', bootstrap: sparseSlide, layout: explorationLayout, initialState: new SparseState(dagDataLoaded, false) },
  { templateId: '#layout-exploration-slide', markupId: '#patterns-slide', bootstrap: patternsSlide, layout: explorationLayout, initialState: new PatternsState(dag, dagDataLoaded, false) },
  { templateId: '#layout-message-slide', markupId: null, bootstrap: helloWorldSlide, layout: () => {}, initialState: {} },
];

/**
 * Start the show!
 */
let show = new SlideShow(slides, initialPage);