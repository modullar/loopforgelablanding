(function () {
  'use strict';

  var designOptions = [
    { x: 12, y: 92, onFrontier: true },
    { x: 18, y: 88, onFrontier: true },
    { x: 25, y: 82, onFrontier: true },
    { x: 33, y: 76, onFrontier: true },
    { x: 42, y: 69, onFrontier: true },
    { x: 52, y: 61, onFrontier: true },
    { x: 63, y: 52, onFrontier: true },
    { x: 74, y: 42, onFrontier: true },
    { x: 85, y: 30, onFrontier: true },
    { x: 94, y: 18, onFrontier: true },
    { x: 25, y: 65, onFrontier: false },
    { x: 30, y: 58, onFrontier: false },
    { x: 35, y: 52, onFrontier: false },
    { x: 40, y: 48, onFrontier: false },
    { x: 45, y: 55, onFrontier: false },
    { x: 50, y: 45, onFrontier: false },
    { x: 55, y: 40, onFrontier: false },
    { x: 60, y: 38, onFrontier: false },
    { x: 65, y: 35, onFrontier: false },
    { x: 70, y: 30, onFrontier: false },
    { x: 75, y: 28, onFrontier: false },
    { x: 80, y: 22, onFrontier: false },
    { x: 38, y: 42, onFrontier: false },
    { x: 48, y: 38, onFrontier: false },
    { x: 58, y: 32, onFrontier: false },
    { x: 68, y: 25, onFrontier: false },
    { x: 22, y: 58, onFrontier: false },
    { x: 28, y: 50, onFrontier: false },
    { x: 32, y: 45, onFrontier: false },
    { x: 42, y: 40, onFrontier: false },
    { x: 52, y: 35, onFrontier: false },
    { x: 62, y: 28, onFrontier: false },
    { x: 72, y: 20, onFrontier: false },
    { x: 82, y: 15, onFrontier: false },
    { x: 36, y: 38, onFrontier: false },
    { x: 46, y: 32, onFrontier: false },
    { x: 56, y: 26, onFrontier: false },
    { x: 66, y: 22, onFrontier: false },
    { x: 76, y: 18, onFrontier: false }
  ];

  var frontierPoints = designOptions
    .filter(function (d) { return d.onFrontier; })
    .sort(function (a, b) { return a.x - b.x; });

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function toSvgX(x) { return x * 3.5 + 60; }
  function toSvgY(y) { return (100 - y) * 2.5 + 30; }

  function createSvgElement(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        el.setAttribute(key, attrs[key]);
      }
    }
    return el;
  }

  function init() {
    var container = document.getElementById('pareto-frontier-container');
    if (!container) return;

    var svg = createSvgElement('svg', {
      width: '420',
      height: '320',
      viewBox: '0 0 420 320',
      style: 'overflow: visible; max-width: 100%; height: auto;'
    });

    // Defs for gradient
    var defs = createSvgElement('defs', {});
    var gradient = createSvgElement('linearGradient', {
      id: 'frontierGradient',
      x1: '0%', y1: '0%', x2: '100%', y2: '0%'
    });
    var stop1 = createSvgElement('stop', { offset: '0%', 'stop-color': 'white' });
    var stop2 = createSvgElement('stop', { offset: '100%', 'stop-color': '#d97706' });
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Grid lines
    [0, 25, 50, 75, 100].forEach(function (v) {
      svg.appendChild(createSvgElement('line', {
        x1: '60', y1: String(toSvgY(v)),
        x2: '410', y2: String(toSvgY(v)),
        stroke: 'rgba(91, 127, 138, 0.2)', 'stroke-width': '1'
      }));
      svg.appendChild(createSvgElement('line', {
        x1: String(v * 3.5 + 60), y1: '30',
        x2: String(v * 3.5 + 60), y2: '280',
        stroke: 'rgba(91, 127, 138, 0.2)', 'stroke-width': '1'
      }));
    });

    // Axis labels
    var xLabel = createSvgElement('text', {
      x: '235', y: '305',
      'text-anchor': 'middle', fill: 'white',
      'font-size': '13', 'font-weight': '500',
      'font-family': 'Inter, sans-serif'
    });
    xLabel.textContent = 'Cost \u2192';
    svg.appendChild(xLabel);

    var yLabel = createSvgElement('text', {
      x: '25', y: '155',
      'text-anchor': 'middle', fill: 'white',
      'font-size': '13', 'font-weight': '500',
      'font-family': 'Inter, sans-serif',
      transform: 'rotate(-90, 25, 155)'
    });
    yLabel.textContent = 'Design Quality \u2192';
    svg.appendChild(yLabel);

    // Frontier curve path
    var pathD = frontierPoints.map(function (p, i) {
      return (i === 0 ? 'M' : 'L') + ' ' + toSvgX(p.x) + ' ' + toSvgY(p.y);
    }).join(' ');

    svg.appendChild(createSvgElement('path', {
      d: pathD,
      fill: 'none',
      stroke: 'url(#frontierGradient)',
      'stroke-width': '2',
      'stroke-linecap': 'round'
    }));

    // Suboptimal points
    designOptions.forEach(function (point) {
      if (point.onFrontier) return;
      svg.appendChild(createSvgElement('circle', {
        cx: String(toSvgX(point.x)),
        cy: String(toSvgY(point.y)),
        r: '3',
        fill: '#5b7f8a',
        opacity: '0.4'
      }));
    });

    // Frontier points
    var frontierCircles = frontierPoints.map(function (point) {
      var circle = createSvgElement('circle', {
        cx: String(toSvgX(point.x)),
        cy: String(toSvgY(point.y)),
        r: '4',
        fill: 'white',
        opacity: '0.7'
      });
      circle.style.transition = 'r 0.2s ease, opacity 0.2s ease';
      svg.appendChild(circle);
      return circle;
    });

    // Highlight ring
    var highlightRing = createSvgElement('circle', {
      cx: String(toSvgX(frontierPoints[0].x)),
      cy: String(toSvgY(frontierPoints[0].y)),
      r: '11',
      fill: 'none',
      stroke: '#d97706',
      'stroke-width': '1.5',
      opacity: '0.7'
    });
    highlightRing.style.transition = 'cx 0.2s ease, cy 0.2s ease';
    svg.appendChild(highlightRing);

    container.appendChild(svg);

    // Animation
    var animatingDot = 0;
    setInterval(function () {
      var next;
      do {
        next = Math.floor(Math.random() * frontierPoints.length);
      } while (next === animatingDot);

      // Reset previous
      frontierCircles[animatingDot].setAttribute('r', '4');
      frontierCircles[animatingDot].setAttribute('opacity', '0.7');

      animatingDot = next;

      // Highlight new
      frontierCircles[animatingDot].setAttribute('r', '7');
      frontierCircles[animatingDot].setAttribute('opacity', '1');

      highlightRing.setAttribute('cx', String(toSvgX(frontierPoints[animatingDot].x)));
      highlightRing.setAttribute('cy', String(toSvgY(frontierPoints[animatingDot].y)));
    }, 600);
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
