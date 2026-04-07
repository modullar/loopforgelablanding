(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  var vertexLabels = ['PERFORMANCE', 'SUSTAINABILITY', 'COST'];
  var vertexDescriptions = [
    'Higher performance = greater resource & energy demands',
    'Better sustainability = constraints on materials & processes',
    'Lower cost = trade-offs on performance & eco-impact'
  ];
  var vertexColors = ['#d97706', '#ffffff', '#7ba5b1'];

  function createLabel(text, position, color) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.font = 'bold 28px Arial';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 10);
    var texture = new THREE.CanvasTexture(canvas);
    var material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    var sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.position.y += 0.5;
    sprite.scale.set(1.5, 0.4, 1);
    return sprite;
  }

  function init() {
    var container = document.getElementById('impossible-triangle-container');
    var infoPanel = document.getElementById('impossible-triangle-info');
    var infoTitle = document.getElementById('impossible-triangle-title');
    var infoDesc = document.getElementById('impossible-triangle-desc');

    if (!container || !infoPanel || typeof THREE === 'undefined') return;

    var width = container.clientWidth;
    var height = container.clientHeight;

    if (width === 0 || height === 0) {
      setTimeout(init, 50);
      return;
    }

    var scene = new THREE.Scene();
    scene.background = null;

    var camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    var selectedVertex = -1;
    var hoveredVertex = -1;
    var sphereScales = [1, 1, 1];
    var ringScales = [1, 1, 1];

    var orange = new THREE.Color('#d97706');
    var white = new THREE.Color('#ffffff');
    var blue = new THREE.Color('#5b7f8a');
    var blueLight = new THREE.Color('#7ba5b1');
    var colors = [orange, white, blue];

    var radius = 2;
    var vertices = [
      new THREE.Vector3(0, radius, 0),
      new THREE.Vector3(-radius * Math.sin((Math.PI * 2) / 3), -radius * 0.5, 0),
      new THREE.Vector3(radius * Math.sin((Math.PI * 2) / 3), -radius * 0.5, 0)
    ];

    var edges = [];
    for (var i = 0; i < 3; i++) {
      var edgeGeometry = new THREE.BufferGeometry().setFromPoints([
        vertices[i],
        vertices[(i + 1) % 3]
      ]);
      var edgeMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      var line = new THREE.Line(edgeGeometry, edgeMaterial);
      scene.add(line);
      edges.push(line);
    }

    var spheres = [];
    vertices.forEach(function (pos, i) {
      var sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      var sphereMaterial = new THREE.MeshBasicMaterial({ color: colors[i].clone() });
      var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(pos);
      sphere.userData = { vertexIndex: i };
      scene.add(sphere);
      spheres.push(sphere);
    });

    var rings = [];
    vertices.forEach(function (pos, i) {
      var points = [];
      var segments = 64;
      var ringRadius = 0.35;
      for (var j = 0; j <= segments; j++) {
        var angle = (j / segments) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * ringRadius,
            Math.sin(angle) * ringRadius,
            0
          )
        );
      }
      var ringGeometry = new THREE.BufferGeometry().setFromPoints(points);
      var ringMaterial = new THREE.LineBasicMaterial({
        color: colors[i].clone(),
        transparent: true,
        opacity: 0.5
      });
      var ring = new THREE.Line(ringGeometry, ringMaterial);
      ring.position.copy(pos);
      scene.add(ring);
      rings.push(ring);
    });

    var center = new THREE.Vector3(0, 0, 0);
    var tensionLines = [];
    vertices.forEach(function (pos) {
      var tlGeometry = new THREE.BufferGeometry().setFromPoints([center, pos]);
      var tlMaterial = new THREE.LineDashedMaterial({
        color: blueLight,
        dashSize: 0.1,
        gapSize: 0.05,
        transparent: true,
        opacity: 0.5
      });
      var tl = new THREE.Line(tlGeometry, tlMaterial);
      tl.computeLineDistances();
      scene.add(tl);
      tensionLines.push(tl);
    });

    var centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 32, 32),
      new THREE.MeshBasicMaterial({ color: orange })
    );
    scene.add(centerSphere);

    var particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 32, 32),
      new THREE.MeshBasicMaterial({ color: orange })
    );
    scene.add(particle);

    var labels = [
      createLabel('FEATURES', vertices[0], '#d97706'),
      createLabel('SUSTAINABILITY', vertices[1], '#ffffff'),
      createLabel('COST', vertices[2], '#7ba5b1')
    ];
    labels.forEach(function (label) {
      scene.add(label);
    });

    function updateInfoPanel() {
      var idx = selectedVertex >= 0 ? selectedVertex : hoveredVertex;
      if (idx >= 0) {
        infoPanel.style.display = 'block';
        infoPanel.style.borderColor = vertexColors[idx];
        infoTitle.textContent = vertexLabels[idx];
        infoTitle.style.color = vertexColors[idx];
        infoDesc.textContent = vertexDescriptions[idx];
        infoPanel.style.top = 'auto';
        infoPanel.style.right = 'auto';
        infoPanel.style.bottom = 'auto';
        infoPanel.style.left = 'auto';
        if (idx === 0) {
          infoPanel.style.top = '60px';
          infoPanel.style.right = '20px';
        } else if (idx === 1) {
          infoPanel.style.bottom = '60px';
          infoPanel.style.left = '20px';
        } else if (idx === 2) {
          infoPanel.style.bottom = '60px';
          infoPanel.style.right = '20px';
        }
      } else {
        infoPanel.style.display = 'none';
      }
    }

    function onMouseMove(event) {
      var rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(spheres);
      if (intersects.length > 0) {
        hoveredVertex = intersects[0].object.userData.vertexIndex;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredVertex = -1;
        renderer.domElement.style.cursor = 'default';
      }
      updateInfoPanel();
    }

    function onClick() {
      if (hoveredVertex >= 0) {
        selectedVertex = selectedVertex === hoveredVertex ? -1 : hoveredVertex;
      } else {
        selectedVertex = -1;
      }
      updateInfoPanel();
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    var time = 0;
    var currentVertex = 0;
    var transitionProgress = 0;
    var transitionSpeed = 0.004;

    function animate() {
      if (!container.parentNode) return;
      requestAnimationFrame(animate);
      time += 0.008;

      transitionProgress += transitionSpeed;
      if (transitionProgress >= 1) {
        transitionProgress = 0;
        currentVertex = (currentVertex + 1) % 3;
      }

      var ease = function (t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      };
      var easedProgress = ease(transitionProgress);
      var startVertex = vertices[currentVertex];
      var endVertex = vertices[(currentVertex + 1) % 3];

      if (transitionProgress < 0.5) {
        particle.position.lerpVectors(startVertex, center, easedProgress * 2);
      } else {
        particle.position.lerpVectors(center, endVertex, (easedProgress - 0.5) * 2);
      }

      for (var i = 0; i < 3; i++) {
        var isSelected = selectedVertex === i;
        var isHovered = hoveredVertex === i;
        var isAnimating = currentVertex === i;
        var target = 1;
        if (isSelected) target = 1.8;
        else if (isHovered) target = 1.5;
        else if (isAnimating) target = 1.3;
        sphereScales[i] += (target - sphereScales[i]) * 0.1;
        var s = sphereScales[i];
        spheres[i].scale.set(s, s, s);
      }

      rings.forEach(function (ring, i) {
        var isSelected = selectedVertex === i;
        var isHovered = hoveredVertex === i;
        var targetScale = isSelected || isHovered ? 1.5 : 1;
        ringScales[i] += (targetScale - ringScales[i]) * 0.1;
        var pulse = 1 + Math.sin(time * 1.5 + i * 2) * 0.08;
        var rs = ringScales[i] * pulse;
        ring.scale.set(rs, rs, 1);
        ring.material.opacity = isSelected || isHovered ? 0.8 : 0.4;
      });

      tensionLines.forEach(function (line, i) {
        line.material.opacity = selectedVertex === i ? 0.9 : 0.4;
      });

      edges.forEach(function (edge, i) {
        var nextI = (i + 1) % 3;
        var isSelected = selectedVertex === i || selectedVertex === nextI;
        var isAnimating = currentVertex === i;
        if (isSelected) {
          edge.material.color.set(0xd97706);
          edge.material.opacity = 1;
        } else if (isAnimating) {
          edge.material.color.set(0xd97706);
          edge.material.opacity = 0.7;
        } else {
          edge.material.color.set(0xffffff);
          edge.material.opacity = 0.5;
        }
      });

      var cp = 1 + Math.sin(time * 2) * 0.15;
      centerSphere.scale.set(cp, cp, cp);
      renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
      if (!container) return;
      var w = container.clientWidth;
      var h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener('resize', handleResize);
  }

  function runWhenReady() {
    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('load', init);
    }
  }
  runWhenReady();
})();
