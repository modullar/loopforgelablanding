const { useState, useEffect, useRef, useCallback } = React;
const PARTS = [
  { id: "tail_cap", label: "Tail Cap", cost: 1.85, co2: 0.42, risk: 8, mat: "AL6061-T6" },
  { id: "tail_spring", label: "Tail Spring", cost: 0.32, co2: 0.08, risk: 14, mat: "Phosphor Bronze" },
  { id: "tail_switch", label: "Click Switch", cost: 1.4, co2: 0.18, risk: 22, mat: "FR-4" },
  { id: "tail_boot", label: "Switch Boot", cost: 0.18, co2: 0.04, risk: 5, mat: "Silicone" },
  { id: "body_tube", label: "Body Tube", cost: 4.2, co2: 1.82, risk: 6, mat: "AL6061-T6" },
  { id: "oring_tail", label: "O-Ring (Tail)", cost: 0.06, co2: 0.01, risk: 3, mat: "Nitrile" },
  { id: "battery", label: "Li-Ion Cell", cost: 3.6, co2: 4.2, risk: 38, mat: "Li-NiMnCo" },
  { id: "battery_wrap", label: "Battery Sleeve", cost: 0.04, co2: 0.02, risk: 4, mat: "PVC" },
  { id: "driver_pcb", label: "Driver PCB", cost: 2.8, co2: 0.62, risk: 65, mat: "FR-4/Cu" },
  { id: "oring_head", label: "O-Ring (Head)", cost: 0.06, co2: 0.01, risk: 3, mat: "Nitrile" },
  { id: "head_housing", label: "Head Housing", cost: 5.4, co2: 2.14, risk: 7, mat: "AL6061-T6" },
  { id: "mcpcb", label: "LED MCPCB", cost: 1.1, co2: 0.34, risk: 42, mat: "Al PCB" },
  { id: "led_emitter", label: "LED Emitter", cost: 2.2, co2: 0.28, risk: 55, mat: "GaN/SiC" },
  { id: "reflector", label: "Reflector", cost: 1.6, co2: 0.72, risk: 12, mat: "AL Vac.Dep." },
  { id: "lens_gasket", label: "Lens Gasket", cost: 0.05, co2: 0.01, risk: 3, mat: "EPDM" },
  { id: "lens", label: "Glass Lens", cost: 1.9, co2: 1.4, risk: 18, mat: "Borosilicate" },
  { id: "bezel_ring", label: "Bezel Ring", cost: 0.95, co2: 0.68, risk: 9, mat: "SS304" },
  { id: "pocket_clip", label: "Pocket Clip", cost: 0.72, co2: 0.48, risk: 11, mat: "SS301" }
];
const EXPLODE_MAP = { tail_boot: -2.4, tail_cap: -2, tail_switch: -1.6, tail_spring: -1.2, oring_tail: -0.8, body_tube: -0.2, battery_wrap: 0, battery: 0, pocket_clip: 0, driver_pcb: 0.7, oring_head: 1, head_housing: 1.3, mcpcb: 1.8, led_emitter: 2.1, reflector: 2.3, lens_gasket: 2.9, lens: 3.1, bezel_ring: 3.4 };
const TAG_OFFSETS = { tail_cap: { x: 2.5, y: 0.15 }, tail_spring: { x: -2.4, y: 0 }, tail_switch: { x: 2.4, y: -0.15 }, tail_boot: { x: -2.3, y: 0.1 }, body_tube: { x: 2.6, y: 0.5 }, oring_tail: { x: -2.4, y: 0 }, battery: { x: -2.5, y: 0 }, battery_wrap: { x: 2.4, y: -0.2 }, driver_pcb: { x: -2.4, y: 0.15 }, oring_head: { x: 2.4, y: 0 }, head_housing: { x: 2.7, y: 0.25 }, mcpcb: { x: -2.4, y: 0.1 }, led_emitter: { x: 2.4, y: 0 }, reflector: { x: -2.6, y: 0.15 }, lens_gasket: { x: 2.3, y: 0 }, lens: { x: -2.4, y: 0 }, bezel_ring: { x: 2.5, y: 0.1 }, pocket_clip: { x: 2.3, y: -0.3 } };
const HL_SEQ = [{ id: "head_housing", dur: 2500 }, { id: "driver_pcb", dur: 2500 }, { id: "battery", dur: 2500 }, { id: "led_emitter", dur: 2e3 }, { id: "reflector", dur: 2e3 }, { id: "body_tube", dur: 2e3 }, { id: "lens", dur: 2e3 }, { id: null, dur: 1500 }];
const TAG_MODES = ["cost", "co2", "risk"];
const MODE_LABELS = { cost: "Unit Cost", co2: "CO\u2082 Footprint", risk: "Supply Risk" };
const MODE_COLORS = { cost: "#D4891C", co2: "#2A5A42", risk: "#D9534F" };
const TIMELINE = [{ phase: "assembled", duration: 4e3 }, { phase: "exploding", duration: 3e3 }, { phase: "showcase", duration: 19e3 }, { phase: "imploding", duration: 3e3 }, { phase: "beauty", duration: 4e3 }];
const TOTAL_CYCLE = TIMELINE.reduce((s, t) => s + t.duration, 0);
const SHOWCASE_START = TIMELINE[0].duration + TIMELINE[1].duration;
const SEQ_DUR = HL_SEQ.reduce((s, h) => s + h.dur, 0);
const CC = { cream: "#FAF7F2", forest: "#1B3A2D", forestMid: "#2A5A42", amber: "#D4891C", coral: "#D9534F", muted: "#94A39C" };
function buildTorch(scene) {
  const parts = {};
  const group = new THREE.Group();

  const matCache = {};
  const mat = (c, s = 60, extra) => {
    const key = `${c}-${s}-${extra ? JSON.stringify(extra) : ""}`;
    if (!matCache[key]) matCache[key] = new THREE.MeshPhongMaterial({ color: c, shininess: s, ...extra });
    return matCache[key];
  };
  const lathe = (pts, segs = 20) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segs);
  const add = (id, m, y, bx = 0) => {
    m.position.set(bx, y, 0);
    m.userData = { id, basePos: new THREE.Vector3(bx, y, 0) };
    parts[id] = m;
    group.add(m);
  };

  // Tail Cap (reduced rings)
  const tc = new THREE.Mesh(lathe([[0, 0], [0.52, 0], [0.52, 0.04], [0.56, 0.04], [0.56, 0.32], [0.52, 0.32], [0.52, 0.36], [0, 0.36]]), mat(0x2a2a2a));
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.545, 0.01, 4, 16), mat(0x1a1a1a));
    r.rotation.x = Math.PI / 2;
    r.position.y = 0.08 + i * 0.08;
    tc.add(r);
  }
  add("tail_cap", tc, -2.2);

  // Tail Spring (reduced curve samples)
  const sG = new THREE.Group();
  const sC = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    sC.push(new THREE.Vector3(Math.cos(t * Math.PI * 10) * 0.15, t * 0.22, Math.sin(t * Math.PI * 10) * 0.15));
  }
  sG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sC), 40, 0.016, 5, false), mat(0xccaa44, 80)));
  sG.add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.025, 16), mat(0xccaa44, 80)));
  add("tail_spring", sG, -1.88);

  // Tail Switch (reduced dots)
  const sw = new THREE.Group();
  sw.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), mat(0x226633)));
  const actuator = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.08, 12), mat(0x338855));
  actuator.position.y = -0.06;
  sw.add(actuator);
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), mat(0xcccccc, 100));
    const a = i / 3 * Math.PI * 2;
    s.position.set(Math.cos(a) * 0.26, 0.03, Math.sin(a) * 0.26);
    sw.add(s);
  }
  add("tail_switch", sw, -2.12);

  add("tail_boot", new THREE.Mesh(lathe([[0, 0], [0.15, 0], [0.17, 0.05], [0.12, 0.1], [0.1, 0.1], [0.08, 0.05], [0, 0.03]]), mat(0x445588, 20)), -2.38);

  const oringMat = mat(0x111111, 10);
  const oT = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.022, 8, 20), oringMat);
  oT.rotation.x = Math.PI / 2;
  add("oring_tail", oT, -1.84);

  // Body Tube (reduced knurl rings)
  const bT = new THREE.Mesh(lathe([[0.44, 0], [0.48, 0], [0.48, 1.8], [0.44, 1.8]]), mat(0x3a3a3a, 50));
  for (let i = 0; i < 10; i++) {
    const k = new THREE.Mesh(new THREE.TorusGeometry(0.485, 0.007, 4, 20), mat(i % 3 === 0 ? 0x444444 : 0x2a2a2a));
    k.rotation.x = Math.PI / 2;
    k.position.y = 0.3 + i * 0.13;
    bT.add(k);
  }
  add("body_tube", bT, -1.84);

  // Battery
  const ba = new THREE.Group();
  ba.add(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.4, 16), mat(0x33aa55, 40)));
  const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 12), mat(0xcccccc, 80));
  nub.position.y = 0.725;
  ba.add(nub);
  const neg = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.015, 16), mat(0xcccccc, 80));
  neg.position.y = -0.71;
  ba.add(neg);
  add("battery", ba, -0.88);

  add("battery_wrap", new THREE.Mesh(
    new THREE.CylinderGeometry(0.345, 0.345, 1.36, 16, 1, true),
    new THREE.MeshPhongMaterial({ color: 0x55cc77, shininess: 10, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
  ), -0.88);

  // Driver PCB (reduced components)
  const dG = new THREE.Group();
  dG.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.07, 16), mat(0x226633)));
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.035), mat(i < 2 ? 0x111111 : 0x888888));
    const a = i / 4 * Math.PI * 2 + 0.3;
    c.position.set(Math.cos(a) * 0.25, 0.05, Math.sin(a) * 0.25);
    dG.add(c);
  }
  const fet = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.1), mat(0x111111));
  fet.position.y = 0.048;
  dG.add(fet);
  add("driver_pcb", dG, -0.06);

  const oH = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.022, 8, 20), oringMat);
  oH.rotation.x = Math.PI / 2;
  add("oring_head", oH, 0);

  // Head Housing (reduced fins)
  const hH = new THREE.Mesh(lathe([[0.44, 0], [0.48, 0], [0.48, 0.15], [0.66, 0.28], [0.68, 0.32], [0.68, 0.9], [0.66, 0.94], [0.64, 0.94], [0.64, 0.9], [0.64, 0.36], [0.48, 0.24], [0.44, 0.24]]), mat(0x333333, 50));
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.TorusGeometry(0.665, 0.012, 4, 20), mat(0x2a2a2a));
    f.rotation.x = Math.PI / 2;
    f.position.y = 0.45 + i * 0.15;
    hH.add(f);
  }
  add("head_housing", hH, 0);

  // MCPCB (reduced traces)
  const mc = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.035, 16), mat(0x886622));
  for (let i = 0; i < 2; i++) {
    const tr = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.004, 0.035), mat(0xccaa44));
    tr.position.y = 0.02;
    tr.rotation.y = i / 2 * Math.PI;
    mc.add(tr);
  }
  add("mcpcb", mc, 0.28);

  // LED
  const lG = new THREE.Group();
  lG.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.12), mat(0xeeeeee, 100)));
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: 0xffffdd, emissive: 0xffff88, emissiveIntensity: 0.7, shininess: 100 })
  );
  dome.position.y = 0.018;
  lG.add(dome);
  add("led_emitter", lG, 0.32);

  add("reflector", new THREE.Mesh(
    lathe([[0.07, 0], [0.58, 0.58], [0.62, 0.58], [0.62, 0.55], [0.1, 0.015], [0.07, 0]]),
    new THREE.MeshPhongMaterial({ color: 0xdddddd, shininess: 120, specular: 0xffffff })
  ), 0.34);

  const gk = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.018, 6, 20), mat(0x333333, 5));
  gk.rotation.x = Math.PI / 2;
  add("lens_gasket", gk, 0.92);

  add("lens", new THREE.Mesh(
    lathe([[0, 0.025], [0.58, 0.025], [0.58, -0.025], [0, -0.012]]),
    new THREE.MeshPhongMaterial({ color: 0x88aacc, transparent: true, opacity: 0.45, shininess: 120, specular: 0xffffff })
  ), 0.94);

  add("bezel_ring", new THREE.Mesh(
    lathe([[0.58, 0], [0.68, 0], [0.69, 0.015], [0.69, 0.08], [0.67, 0.1], [0.58, 0.1]]),
    new THREE.MeshPhongMaterial({ color: 0x666666, shininess: 90, specular: 0x888888 })
  ), 0.9);

  // Pocket Clip
  const cl = new THREE.Group();
  cl.add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.18), mat(0x888888, 80)));
  const curl = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.025, 6, 8, Math.PI), mat(0x888888, 80));
  curl.position.y = -0.6;
  curl.rotation.z = Math.PI / 2;
  cl.add(curl);
  cl.position.set(0.52, -0.8, 0);
  cl.userData = { id: "pocket_clip", basePos: new THREE.Vector3(0.52, -0.8, 0) };
  parts.pocket_clip = cl;
  group.add(cl);

  group.rotation.x = -Math.PI / 2;
  scene.add(group);
  return { parts, group };
}
function TorchHero() {
  const mountRef = useRef(null);
  const stRef = useRef({});
  const screenPosRef = useRef({});
  const hlRef = useRef(null);
  const modeRef = useRef("cost");
  const explRef = useRef(0);
  const [screenPositions, setScreenPositions] = useState({});
  const [tagMode, setTagMode] = useState("cost");
  const [highlightId, setHighlightId] = useState(null);
  const [explodeVal, setExplodeVal] = useState(0);
  const proj = useCallback((wp, cam, rectW, rectH) => {
    if (!cam || rectW === 0 || rectH === 0) return null;
    const v = wp.clone().project(cam);
    return { x: (v.x * 0.5 + 0.5) * rectW, y: (-v.y * 0.5 + 0.5) * rectH, z: v.z };
  }, []);
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const w = container.clientWidth, h = container.clientHeight;
    if (w === 0 || h === 0) return;
    // Cache container rect to avoid forced reflows in the animation loop
    let cachedRect = container.getBoundingClientRect();
    let cachedW = w, cachedH = h;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(9741212, 0.6));
    const k = new THREE.DirectionalLight(16777215, 1.2);
    k.position.set(5, 8, 4);
    scene.add(k);
    const f = new THREE.DirectionalLight(6982266, 0.35);
    f.position.set(-5, 2, -3);
    scene.add(f);
    const r2 = new THREE.DirectionalLight(13928732, 0.25);
    r2.position.set(-2, -4, 5);
    scene.add(r2);
    const gl = new THREE.PointLight(12626528, 0.35, 6);
    gl.position.set(0, 1.5, 0);
    scene.add(gl);
    const backRim = new THREE.DirectionalLight(16772829, 0.3);
    backRim.position.set(0, 2, -6);
    scene.add(backRim);
    const { parts, group } = buildTorch(scene);
    // Pre-flatten mesh/material refs to avoid per-frame traverse()
    const meshList = [];
    Object.entries(parts).forEach(([partId, root]) => {
      root.traverse((c) => {
        if (c.isMesh && c.material) {
          meshList.push({ partId, material: c.material });
        }
      });
    });
    const partEntries = Object.entries(parts);
    let lastRadius = 8.5;
    const lookAt = new THREE.Vector3(0, -0.3, 0);
    const tmpV = new THREE.Vector3();
    const startTime = performance.now();
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    let animId = null;
    let isDocumentVisible = !document.hidden;
    let isInViewport = true;
    let animationRunning = false;
    let pauseStartedAt = 0;
    let totalPausedMs = 0;
     // Dirty-flag for material updates — only run during highlight transitions
    let prevHL = undefined;
    let fadeFramesLeft = 0;
    const FADE_FRAMES = 20;
    const onVisibility = () => {
      isDocumentVisible = !document.hidden;
      updateAnimationState();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const animate = (now) => {
      if (!animationRunning) return;
      const elapsed = now - startTime - totalPausedMs;
      const cycleTime = elapsed % TOTAL_CYCLE;
      let accum = 0, phase = "assembled", progress = 0;
      for (const t of TIMELINE) {
        if (cycleTime < accum + t.duration) {
          phase = t.phase;
          progress = (cycleTime - accum) / t.duration;
          break;
        }
        accum += t.duration;
      }
      let expl = 0;
      if (phase === "exploding") expl = easeInOut(progress);
      else if (phase === "showcase") expl = 1;
      else if (phase === "imploding") expl = 1 - easeInOut(progress);
      explRef.current = expl;
      partEntries.forEach(([k2, m]) => {
        if (m.userData.basePos && EXPLODE_MAP[k2] !== void 0) {
          m.position.y = m.userData.basePos.y + EXPLODE_MAP[k2] * expl;
          if (k2 === "pocket_clip") m.position.x = m.userData.basePos.x + expl * 0.7;
        }
      });
      const theta = elapsed * 25e-5;
      const phiBase = phase === "beauty" ? 0.95 : 1.05;
      const phi = phiBase + Math.sin(elapsed * 15e-5) * 0.2;
      const heightScale = cachedH / 480;
      let targetR;
      if (phase === "assembled") targetR = 8 * heightScale;
      else if (phase === "exploding") targetR = (8 + easeInOut(progress) * 5) * heightScale;
      else if (phase === "showcase") targetR = (13 + Math.sin(elapsed * 3e-4) * 0.8) * heightScale;
      else if (phase === "imploding") targetR = (13 - easeInOut(progress) * 5.5) * heightScale;
      else targetR = 7.5 * heightScale;
      lastRadius += (targetR - lastRadius) * 0.03;
      camera.position.setFromSphericalCoords(lastRadius, phi, theta);
      camera.position.add(lookAt);
      camera.lookAt(lookAt);
      let curHL = null, curMode = "cost";
      if (phase === "showcase") {
        const sTime = cycleTime - SHOWCASE_START;
        curMode = TAG_MODES[Math.floor(sTime / 6e3) % TAG_MODES.length];
        const seqTime = sTime % SEQ_DUR;
        let pAcc = 0;
        for (const h2 of HL_SEQ) {
          if (seqTime < pAcc + h2.dur) {
            curHL = h2.id;
            break;
          }
          pAcc += h2.dur;
        }
      }
      hlRef.current = curHL;
      modeRef.current = curMode;

      // Dirty-flag: only update materials during highlight transitions
      if (curHL !== prevHL) {
        prevHL = curHL;
        fadeFramesLeft = FADE_FRAMES;
      }
      if (fadeFramesLeft > 0) {
        fadeFramesLeft--;
        const anyHL = curHL !== null;
        const isLastFrame = fadeFramesLeft === 0;
        meshList.forEach(({ partId, material }) => {
          const isHL = curHL === partId;
          if (material.emissive) {
            material.emissive.setHex(isHL ? 0x2A5A42 : 0x000000);
            material.emissiveIntensity = isHL ? 0.55 : 0;
          }
          const targetOpacity = !anyHL ? 1 : isHL ? 1 : 0.22;
          const isOrig = material.userData && material.userData.origTransparent;
          if (!isOrig) {
            if (isLastFrame) {
              material.transparent = targetOpacity < 0.99;
              material.opacity = targetOpacity;
            } else {
              const cur = material.opacity !== void 0 ? material.opacity : 1;
              const nxt = cur + (targetOpacity - cur) * 0.18;
              if (Math.abs(targetOpacity - 1) > 0.01 || nxt < 0.99) {
                material.transparent = true;
                material.opacity = nxt;
              } else {
                material.transparent = false;
                material.opacity = 1;
              }
            }
          }
        });
      }
      renderer.render(scene, camera);
      if (expl > 0.3) {
        const np = {};
        partEntries.forEach(([id, mesh]) => {
          mesh.getWorldPosition(tmpV);
          const o = TAG_OFFSETS[id] || { x: 2.0, y: 0 };
          const ap = proj(tmpV, camera, cachedRect.width, cachedRect.height);
          if (!ap || !(ap.z > 0 && ap.z < 1)) return;

          // IMPORTANT: keep the anchor on the part (world-projected),
          // and place the label using a SCREEN-SPACE offset so it never "floats" in 3D.
          const TAG_PX = 34;
          const tag = { x: ap.x + o.x * TAG_PX, y: ap.y + o.y * TAG_PX, z: ap.z };
          np[id] = { tag, anchor: ap };
        });
        screenPosRef.current = np;
      } else {
        screenPosRef.current = {};
      }
      animId = requestAnimationFrame(animate);
    };
    const startAnimation = () => {
      if (animationRunning) return;
      if (pauseStartedAt) {
        totalPausedMs += performance.now() - pauseStartedAt;
        pauseStartedAt = 0;
      }
      animationRunning = true;
      animId = requestAnimationFrame(animate);
    };
    const stopAnimation = () => {
      if (!animationRunning) return;
      animationRunning = false;
      pauseStartedAt = performance.now();
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };
    const updateAnimationState = () => {
      if (isDocumentVisible && isInViewport) startAnimation();
      else stopAnimation();
    };
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isInViewport = !!(entry && entry.isIntersecting);
      updateAnimationState();
    }, { threshold: 0.15 });
    observer.observe(container);
    if (parts.lens) parts.lens.traverse((c) => { if (c.isMesh && c.material) c.material.userData = { origTransparent: true }; });
    if (parts.battery_wrap) parts.battery_wrap.traverse((c) => { if (c.isMesh && c.material) c.material.userData = { origTransparent: true }; });
    updateAnimationState();
    const syncId = setInterval(() => {
      if (!animationRunning) return;
      setScreenPositions({ ...screenPosRef.current });
      setHighlightId(hlRef.current);
      setTagMode(modeRef.current);
      setExplodeVal(explRef.current);
    }, 50);
    const onResize = () => {
      const w2 = container.clientWidth, h2 = container.clientHeight;
      if (w2 === 0 || h2 === 0) return;
      cachedW = w2;
      cachedH = h2;
      cachedRect = container.getBoundingClientRect();
      renderer.setSize(w2, h2);
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearInterval(syncId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      stopAnimation();
      try {
        container.removeChild(renderer.domElement);
      } catch (e) {
      }
      renderer.dispose();
    };
  }, [proj]);
  const getTagColor = (p) => tagMode === "cost" ? CC.amber : tagMode === "co2" ? CC.forestMid : p.risk > 40 ? CC.coral : p.risk > 20 ? CC.amber : CC.forestMid;
  const getTagLabel = (p) => tagMode === "cost" ? `\u20AC${p.cost.toFixed(2)}` : tagMode === "co2" ? `${p.co2.toFixed(2)}kg` : `${p.risk}%`;
  const showTags = explodeVal > 0.3;
  const modeColor = MODE_COLORS[tagMode];
  const hlPart = PARTS.find((p) => p.id === highlightId);
  const fontMain = "'DM Sans','Segoe UI',system-ui,sans-serif";
  const anyHL = highlightId !== null;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const rootMinH = isMobile ? 320 : 520;
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: "100%", minHeight: rootMinH, background: "transparent", overflow: "hidden", fontFamily: fontMain, contain: "layout style" } }, /* @__PURE__  */ React.createElement("div", { ref: mountRef, style: { position: "absolute", inset: 0 } }), showTags && !isMobile && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, background: "rgba(255,255,255,.92)", backdropFilter: "blur(10px)", padding: "8px 20px", borderRadius: 40, border: `1.5px solid ${modeColor}30`, boxShadow: "0 2px 16px rgba(27,58,45,.08)", zIndex: 20 } }, TAG_MODES.map((m) => {
    const active = tagMode === m;
    const mc = MODE_COLORS[m];
    return /* @__PURE__ */ React.createElement("div", { key: m, style: { display: "flex", alignItems: "center", gap: 5, padding: "4px 14px", borderRadius: 20, background: active ? mc + "12" : "transparent", border: `1px solid ${active ? mc + "35" : "transparent"}`, transition: "all .5s" } }, /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: active ? mc : CC.muted, boxShadow: active ? `0 0 8px ${mc}55` : "none", transition: "all .5s" } }), /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? mc : CC.muted, transition: "all .5s" } }, MODE_LABELS[m]));
  })), hlPart && showTags && !isMobile && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,.95)", backdropFilter: "blur(12px)", padding: "14px 28px", borderRadius: 16, border: `1px solid ${CC.forest}12`, boxShadow: "0 4px 32px rgba(27,58,45,.1)", display: "flex", alignItems: "center", gap: 24, minWidth: 320, zIndex: 20 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: CC.forest, fontFamily: "Georgia,serif" } }, hlPart.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: CC.muted, marginTop: 2 } }, hlPart.mat)), /* @__PURE__ */ React.createElement("div", { style: { width: 1, height: 36, background: CC.forest + "18" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 20 } }, [
    { v: `\u20AC${hlPart.cost.toFixed(2)}`, l: "Cost", c: CC.amber },
    { v: hlPart.co2.toFixed(2), l: "kg CO\u2082e", c: CC.forestMid },
    { v: `${hlPart.risk}%`, l: "Risk", c: hlPart.risk > 40 ? CC.coral : hlPart.risk > 20 ? CC.amber : CC.forestMid }
  ].map((d, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: d.c, fontFamily: "Georgia,serif" } }, d.v), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: CC.muted, marginTop: 1 } }, d.l))))), showTags && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" } }, /* @__PURE__  */ React.createElement("svg", { style: { position: "absolute", inset: 0, width: "100%", height: "100%" } }, PARTS.map((p) => {
    const pos = screenPositions[p.id];
    if (!pos) return null;
    const isHL = highlightId === p.id;
    const tc = getTagColor(p);
    const isDim = anyHL && !isHL;
    return /* @__PURE__ */ React.createElement("g", { key: p.id }, /* @__PURE__ */ React.createElement("line", { x1: pos.anchor.x, y1: pos.anchor.y, x2: pos.tag.x, y2: pos.tag.y, stroke: isHL ? tc : CC.muted, strokeWidth: isHL ? 1.8 : 0.9, opacity: isDim ? 0.08 : isHL ? 0.9 : 0.45, style: { transition: "opacity .3s, stroke-width .3s" } }), /* @__PURE__ */ React.createElement("circle", { cx: pos.anchor.x, cy: pos.anchor.y, r: isHL ? 3.5 : 2, fill: isHL ? tc : CC.muted, opacity: isDim ? 0.1 : isHL ? 1 : 0.55, style: { transition: "all .3s" } }), isHL && /* @__PURE__ */ React.createElement("circle", { cx: pos.anchor.x, cy: pos.anchor.y, r: 6, fill: "none", stroke: tc, strokeWidth: 1.5, opacity: 0.5 }, /* @__PURE__ */ React.createElement("animate", { attributeName: "r", values: "3.5;10;3.5", dur: "2s", repeatCount: "indefinite" }), /* @__PURE__ */ React.createElement("animate", { attributeName: "opacity", values: "0.7;0;0.7", dur: "2s", repeatCount: "indefinite" })));
  })), PARTS.map((p) => {
    const pos = screenPositions[p.id];
    if (!pos) return null;
    const isHL = highlightId === p.id;
    const tc = getTagColor(p);
    const isDim = anyHL && !isHL;
    return /* @__PURE__ */ React.createElement("div", { key: p.id + "-tag", style: { position: "absolute", left: pos.tag.x, top: pos.tag.y, transform: "translate(-50%,-50%)", opacity: isDim ? 0.15 : 1, zIndex: isHL ? 10 : 1, transition: "opacity .4s ease" } }, isHL && !isMobile ? /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(255,255,255,.97)", border: `2px solid ${tc}`, borderRadius: 10, padding: "7px 13px", minWidth: 120, boxShadow: `0 6px 24px rgba(27,58,45,.15), 0 0 0 4px ${tc}20` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: CC.forest, marginBottom: 4 } }, p.label), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { color: CC.muted } }, tagMode === "cost" ? "Cost" : tagMode === "co2" ? "CO\u2082e" : "Risk"), /* @__PURE__ */ React.createElement("span", { style: { color: tc, fontWeight: 800 } }, getTagLabel(p)))) : /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(255,255,255,.88)", border: `1px solid ${tc}35`, borderRadius: 6, padding: isMobile ? "2px 5px" : "3px 9px", display: "flex", alignItems: "center", gap: isMobile ? 3 : 5, backdropFilter: "blur(6px)", boxShadow: "0 1px 4px rgba(27,58,45,.06)" } }, /* @__PURE__ */ React.createElement("div", { style: { width: isMobile ? 4 : 5, height: isMobile ? 4 : 5, borderRadius: "50%", background: tc, boxShadow: `0 0 4px ${tc}55` } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: isMobile ? 8 : 10, fontWeight: 700, color: tc, whiteSpace: "nowrap" } }, getTagLabel(p))));
  })));
}
const rootElement = document.getElementById("hero-3d-container");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(/* @__PURE__ */ React.createElement(TorchHero, null));
}
