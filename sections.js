
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function () {
  // constants to define the size
  // and margins of the vis area.
  var width = 600;
  var height = 520;
  var margin = { top: 0, left: 20, bottom: 40, right: 10 };

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  var line = d3.line();

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([undefined]);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
        .append('g'); // another g to protect the coordinate transform above
      setupVis();

      setupSections();
    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  var setupVis = function () {
    var shape = g.append('g').attr('class', 'shape');
    shape.append('path');
    shape.append('g').attr('class', 'spurs');
    var singleAngle = g.append('g').attr('class', 'ext-int-angle-relationship');
    singleAngle.append('path').attr('class', 'poly-part');
    singleAngle.append('path').attr('class', 'measure');
    singleAngle.append('path').attr('class', 'spur');

  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = simpleSquare;
    activateFunctions[1] = simpleTriangle;
    activateFunctions[2] = simpleHexagon;
    activateFunctions[3] = simple11gon;
    activateFunctions[4] = hideHighlightedAngle;
    activateFunctions[5] = highlightSingleAngle;
    activateFunctions[6] = () => {};
    activateFunctions[7] = () => {};
    // activateFunctions[2] = showGrid;
    // activateFunctions[3] = highlightGrid;
    // activateFunctions[4] = showBar;
    // activateFunctions[5] = showHistPart;
    // activateFunctions[6] = showHistAll;
    // activateFunctions[7] = showCough;
    // activateFunctions[8] = showHistAll;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 9; i++) {
      updateFunctions[i] = function () {};
    }
    updateFunctions[4] = growSpurs(11, 60, 50);
    updateFunctions[5] = highlightAngleProgress;
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  function simpleSquare() {
    clearSpurs();
    g.select('.shape path')
      .transition()
      .duration(300)
      .attr('d', line(regularPolygonPoints({ numSides: 4, radius: 50 })))
      .attr('transform', 'rotate(45)');
  }

  function simpleTriangle() {
    clearSpurs();
    g.selectAll('.shape path')
      .transition()
      .duration(300)
      .attr('d', line(regularPolygonPoints({ numSides: 3, radius: 50 })))
      .attr('transform', null);
  }

  function simpleHexagon() {
    clearSpurs()
    g.selectAll('.shape path')
      .transition()
      .duration(300)
      .attr('d', line(regularPolygonPoints({ numSides: 6, radius: 50 })))
      .attr('transform', null);
  }

  function simple11gon() {
    clearSpurs();
    g.selectAll('.shape path')
    .transition()
    .duration(300)
    .attr('d', line(regularPolygonPoints({ numSides: 11, radius: 60 })))
    .attr('transform', null);
  }

  function clearSpurs() {
    g.selectAll('.shape .spur')
      .remove();
  }

  function hideHighlightedAngle() {
    g.select('.ext-int-angle-relationship').style('stroke-opacity', 0);
    g.attr('transform', null);
  }

  function highlightSingleAngle() {
    g.select('.ext-int-angle-relationship').style('stroke-opacity', 0);
    g.select('.poly-part')
      .attr('d', line(
        regularPolygonPoints({ numSides: 11, radius: 60}).slice(0, 3)))
      .style('stroke', 'tomato');

    var spurPts = regularPolygonSpurs({ numSides: 11, radius: 60, spurLength: 50 })[1];
    g.select('.ext-int-angle-relationship .spur')
      .attr('d', line(spurPts))
      .style('stroke', 'tomato');
  }

  /**
   * updateCough - increase/decrease
   * cough text and color
   *
   * @param progress - 0.0 - 1.0 -
   *  how far user has scrolled in section
   */
  function growSpurs(numSides, radius, maxSpurLength) {

    return (progress) => {
      g.select('.shape')
        .datum({numSides: numSides, radius: radius, spurLength: progress * maxSpurLength})
        .call(spurs);
    }
  }

  function highlightAngleProgress(progress) {
    g.select('.ext-int-angle-relationship').style('stroke-opacity', progress);
    g.select('.shape').style('stroke-opacity', Math.max(1 - progress, 0.2))
    g.attr('transform', `translate(0, -${progress * 100}) rotate(${progress*75}) scale(${progress + 1})`);
  }


  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display -
 * sets up the scroller and
 * displays the visualization.
 *
 */
function display() {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum([undefined])
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('main'));

  scroll(d3.selectAll('section'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('section')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

display();
