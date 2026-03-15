const { useState, useEffect, useRef, useCallback } = React;
const PARTS = [
  { id: "tail_cap", label: "Tail Cap", color: 2763306, cost: 1.85, co2: 0.42, risk: 8, mat: "AL6061-T6" },
  { id: "tail_spring", label: "Tail Spring", color: 13412932, cost: 0.32, co2: 0.08, risk: 14, mat: "Phosphor Bronze" },
  { id: "tail_switch", label: "Click Switch", color: 3377237, cost: 1.4, co2: 0.18, risk: 22, mat: "FR-4" },
  { id: "tail_boot", label: "Switch Boot", color: 4478344, cost: 0.18, co2: 0.04, risk: 5, mat: "Silicone" },
  { id: "body_tube", label: "Body Tube", color: 3815994, cost: 4.2, co2: 1.82, risk: 6, mat: "AL6061-T6" },
  { id: "oring_tail", label: "O-Ring (Tail)", color: 2236962, cost: 0.06, co2: 0.01, risk: 3, mat: "Nitrile" },
  { id: "battery", label: "Li-Ion Cell", color: 3385941, cost: 3.6, co2: 4.2, risk: 38, mat: "Li-NiMnCo" },
  { id: "battery_wrap", label: "Battery Sleeve", color: 5622903, cost: 0.04, co2: 0.02, risk: 4, mat: "PVC" },
  { id: "driver_pcb", label: "Driver PCB", color: 2254387, cost: 2.8, co2: 0.62, risk: 65, mat: "FR-4/Cu" },
  { id: "oring_head", label: "O-Ring (Head)", color: 2236962, cost: 0.06, co2: 0.01, risk: 3, mat: "Nitrile" },
  { id: "head_housing", label: "Head Housing", color: 3355443, cost: 5.4, co2: 2.14, risk: 7, mat: "AL6061-T6" },
  { id: "mcpcb", label: "LED MCPCB", color: 8939042, cost: 1.1, co2: 0.34, risk: 42, mat: "Al PCB" },
  { id: "led_emitter", label: "LED Emitter", color: 16777164, cost: 2.2, co2: 0.28, risk: 55, mat: "GaN/SiC" },
  { id: "reflector", label: "Reflector", color: 14540253, cost: 1.6, co2: 0.72, risk: 12, mat: "AL Vac.Dep." },
  { id: "lens_gasket", label: "Lens Gasket", color: 4473924, cost: 0.05, co2: 0.01, risk: 3, mat: "EPDM" },
  { id: "lens", label: "Glass Lens", color: 8956620, cost: 1.9, co2: 1.4, risk: 18, mat: "Borosilicate" },
  { id: "bezel_ring", label: "Bezel Ring", color: 5592405, cost: 0.95, co2: 0.68, risk: 9, mat: "SS304" },
  { id: "pocket_clip", label: "Pocket Clip", color: 8947848, cost: 0.72, co2: 0.48, risk: 11, mat: "SS301" }
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
  const parts = {}, group = new THREE.Group();
  const L = (pts, s = 48) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const P = (c, s = 60) => new THREE.MeshPhongMaterial({ color: c, shininess: s });
  const A = (id, m, y, bx = 0) => {
    m.position.set(bx, y, 0);
    m.userData = { id, basePos: new THREE.Vector3(bx, y, 0) };
    parts[id] = m;
    group.add(m);
  };
  const tc = new THREE.Mesh(L([[0, 0], [0.52, 0], [0.52, 0.04], [0.56, 0.04], [0.56, 0.32], [0.52, 0.32], [0.52, 0.36], [0, 0.36]]), P(2763306));
  for (let i = 0; i < 5; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.545, 0.01, 6, 48), P(1710618));
    r.rotation.x = Math.PI / 2;
    r.position.y = 0.06 + i * 0.045;
    tc.add(r);
  }
  A("tail_cap", tc, -2.2);
  const sG = new THREE.Group();
  const sC = [];
  for (let i = 0; i <= 160; i++) {
    const t = i / 160;
    sC.push(new THREE.Vector3(Math.cos(t * Math.PI * 10) * 0.15, t * 0.22, Math.sin(t * Math.PI * 10) * 0.15));
  }
  sG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sC), 100, 0.016, 8), P(13412932, 80)));
  sG.add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.025, 24), P(13412932, 80)));
  A("tail_spring", sG, -1.88);
  const sw = new THREE.Group();
  sw.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32), P(2254387)));
  const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.08, 16), P(3377237));
  a2.position.y = -0.06;
  sw.add(a2);
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), P(13421772, 100));
    const a = i / 4 * Math.PI * 2;
    s.position.set(Math.cos(a) * 0.26, 0.03, Math.sin(a) * 0.26);
    sw.add(s);
  }
  A("tail_switch", sw, -2.12);
  A("tail_boot", new THREE.Mesh(L([[0, 0], [0.15, 0], [0.17, 0.05], [0.12, 0.1], [0.1, 0.1], [0.08, 0.05], [0, 0.03]]), P(4478344, 20)), -2.38);
  const oM = P(1118481, 10);
  const oT = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.022, 12, 48), oM);
  oT.rotation.x = Math.PI / 2;
  A("oring_tail", oT, -1.84);
  const bT = new THREE.Mesh(L([[0.44, 0], [0.48, 0], [0.48, 1.8], [0.44, 1.8]]), P(3815994, 50));
  for (let i = 0; i < 18; i++) {
    const k = new THREE.Mesh(new THREE.TorusGeometry(0.485, 7e-3, 6, 48), P(i % 3 === 0 ? 4473924 : 2763306));
    k.rotation.x = Math.PI / 2;
    k.position.y = 0.3 + i * 0.07;
    bT.add(k);
  }
  A("body_tube", bT, -1.84);
  const ba = new THREE.Group();
  ba.add(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.4, 32), P(3385941, 40)));
  const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 16), P(13421772, 80));
  nub.position.y = 0.725;
  ba.add(nub);
  const ng = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.015, 32), P(13421772, 80));
  ng.position.y = -0.71;
  ba.add(ng);
  A("battery", ba, -0.88);
  A("battery_wrap", new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 1.36, 32, 1, true), new THREE.MeshPhongMaterial({ color: 5622903, shininess: 10, transparent: true, opacity: 0.4, side: THREE.DoubleSide })), -0.88);
  const dG = new THREE.Group();
  dG.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.07, 32), P(2254387)));
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.035), P(i < 3 ? 1118481 : 8947848));
    const a = i / 6 * Math.PI * 2 + 0.3;
    c.position.set(Math.cos(a) * 0.25, 0.05, Math.sin(a) * 0.25);
    dG.add(c);
  }
  const ft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.1), P(1118481));
  ft.position.y = 0.048;
  dG.add(ft);
  A("driver_pcb", dG, -0.06);
  const oH = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.022, 12, 48), oM.clone());
  oH.rotation.x = Math.PI / 2;
  A("oring_head", oH, 0);
  const hH = new THREE.Mesh(L([[0.44, 0], [0.48, 0], [0.48, 0.15], [0.66, 0.28], [0.68, 0.32], [0.68, 0.9], [0.66, 0.94], [0.64, 0.94], [0.64, 0.9], [0.64, 0.36], [0.48, 0.24], [0.44, 0.24]]), P(3355443, 50));
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Mesh(new THREE.TorusGeometry(0.665, 0.012, 6, 48), P(2763306));
    f.rotation.x = Math.PI / 2;
    f.position.y = 0.4 + i * 0.12;
    hH.add(f);
  }
  A("head_housing", hH, 0);
  const mc = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.035, 32), P(8939042));
  for (let i = 0; i < 3; i++) {
    const tr = new THREE.Mesh(new THREE.BoxGeometry(0.44, 4e-3, 0.035), P(13412932));
    tr.position.y = 0.02;
    tr.rotation.y = i / 3 * Math.PI;
    mc.add(tr);
  }
  A("mcpcb", mc, 0.28);
  const lG = new THREE.Group();
  lG.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.12), P(15658734, 100)));
  const dm = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: 16777181, emissive: 16777096, emissiveIntensity: 0.7, shininess: 100 }));
  dm.position.y = 0.018;
  lG.add(dm);
  A("led_emitter", lG, 0.32);
  A("reflector", new THREE.Mesh(L([[0.07, 0], [0.58, 0.58], [0.62, 0.58], [0.62, 0.55], [0.1, 0.015], [0.07, 0]]), new THREE.MeshPhongMaterial({ color: 14540253, shininess: 120, specular: 16777215 })), 0.34);
  const gk = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.018, 8, 48), P(3355443, 5));
  gk.rotation.x = Math.PI / 2;
  A("lens_gasket", gk, 0.92);
  A("lens", new THREE.Mesh(L([[0, 0.025], [0.58, 0.025], [0.58, -0.025], [0, -0.012]]), new THREE.MeshPhongMaterial({ color: 8956620, transparent: true, opacity: 0.45, shininess: 120, specular: 16777215 })), 0.94);
  A("bezel_ring", new THREE.Mesh(L([[0.58, 0], [0.68, 0], [0.69, 0.015], [0.69, 0.08], [0.67, 0.1], [0.58, 0.1]]), new THREE.MeshPhongMaterial({ color: 6710886, shininess: 90, specular: 8947848 })), 0.9);
  const cl = new THREE.Group();
  cl.add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.18), P(8947848, 80)));
  const cu = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.025, 8, 12, Math.PI), P(8947848, 80));
  cu.position.y = -0.6;
  cu.rotation.z = Math.PI / 2;
  cl.add(cu);
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
  const proj = useCallback((wp, cam, el) => {
    if (!cam || !el) return null;
    const v = wp.clone().project(cam);
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    return { x: (v.x * 0.5 + 0.5) * r.width, y: (-v.y * 0.5 + 0.5) * r.height, z: v.z };
  }, []);
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const w = container.clientWidth, h = container.clientHeight;
    if (w === 0 || h === 0) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    let lastRadius = 8.5;
    const lookAt = new THREE.Vector3(0, -0.3, 0);
    const tmpV = new THREE.Vector3();
    const startTime = performance.now();
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    let animId;
    const animate = (now) => {
      animId = requestAnimationFrame(animate);
      const elapsed = now - startTime;
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
      Object.entries(parts).forEach(([k2, m]) => {
        if (m.userData.basePos && EXPLODE_MAP[k2] !== void 0) {
          m.position.y = m.userData.basePos.y + EXPLODE_MAP[k2] * expl;
          if (k2 === "pocket_clip") m.position.x = m.userData.basePos.x + expl * 0.7;
        }
      });
      const theta = elapsed * 25e-5;
      const phiBase = phase === "beauty" ? 0.95 : 1.05;
      const phi = phiBase + Math.sin(elapsed * 15e-5) * 0.2;
      const heightScale = h / 480;
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
      Object.entries(parts).forEach(([k2, m]) => {
        m.traverse((c) => {
          if (c.isMesh && c.material && c.material.emissive) {
            const isHL = hlRef.current === k2;
            c.material.emissive.setHex(isHL ? 2775618 : 0);
            c.material.emissiveIntensity = isHL ? 0.5 : 0;
          }
        });
      });
      renderer.render(scene, camera);
      if (expl > 0.3) {
        const np = {};
        Object.entries(parts).forEach(([id, mesh]) => {
          mesh.getWorldPosition(tmpV);
          const o = TAG_OFFSETS[id] || { x: 1.5, y: 0 };
          const sp = proj(tmpV.clone().add(new THREE.Vector3(o.x, o.y, 0)), camera, container);
          const ap = proj(tmpV, camera, container);
          if (sp && ap && sp.z > 0 && sp.z < 1) np[id] = { tag: sp, anchor: ap };
        });
        screenPosRef.current = np;
      } else {
        screenPosRef.current = {};
      }
    };
    animId = requestAnimationFrame(animate);
    const syncId = setInterval(() => {
      setScreenPositions({ ...screenPosRef.current });
      setHighlightId(hlRef.current);
      setTagMode(modeRef.current);
      setExplodeVal(explRef.current);
    }, 40);
    const onResize = () => {
      const w2 = container.clientWidth, h2 = container.clientHeight;
      if (w2 === 0 || h2 === 0) return;
      renderer.setSize(w2, h2);
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearInterval(syncId);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
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
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: "100%", minHeight: 520, background: "transparent", overflow: "visible", fontFamily: fontMain } }, /* @__PURE__ */ React.createElement("div", { ref: mountRef, style: { position: "absolute", inset: "-150px" } }), showTags && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, background: "rgba(255,255,255,.92)", backdropFilter: "blur(10px)", padding: "8px 20px", borderRadius: 40, border: `1.5px solid ${modeColor}30`, boxShadow: "0 2px 16px rgba(27,58,45,.08)" } }, TAG_MODES.map((m) => {
    const active = tagMode === m;
    const mc = MODE_COLORS[m];
    return /* @__PURE__ */ React.createElement("div", { key: m, style: { display: "flex", alignItems: "center", gap: 5, padding: "4px 14px", borderRadius: 20, background: active ? mc + "12" : "transparent", border: `1px solid ${active ? mc + "35" : "transparent"}`, transition: "all .5s" } }, /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: active ? mc : CC.muted, boxShadow: active ? `0 0 8px ${mc}55` : "none", transition: "all .5s" } }), /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? mc : CC.muted, transition: "all .5s" } }, MODE_LABELS[m]));
  })), hlPart && showTags && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,.95)", backdropFilter: "blur(12px)", padding: "14px 28px", borderRadius: 16, border: `1px solid ${CC.forest}12`, boxShadow: "0 4px 32px rgba(27,58,45,.1)", display: "flex", alignItems: "center", gap: 24, minWidth: 320 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: CC.forest, fontFamily: "Georgia,serif" } }, hlPart.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: CC.muted, marginTop: 2 } }, hlPart.mat)), /* @__PURE__ */ React.createElement("div", { style: { width: 1, height: 36, background: CC.forest + "18" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 20 } }, [
    { v: `\u20AC${hlPart.cost.toFixed(2)}`, l: "Cost", c: CC.amber },
    { v: hlPart.co2.toFixed(2), l: "kg CO\u2082e", c: CC.forestMid },
    { v: `${hlPart.risk}%`, l: "Risk", c: hlPart.risk > 40 ? CC.coral : hlPart.risk > 20 ? CC.amber : CC.forestMid }
  ].map((d, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: d.c, fontFamily: "Georgia,serif" } }, d.v), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: CC.muted, marginTop: 1 } }, d.l))))), showTags && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("svg", { style: { position: "absolute", inset: 0, width: "100%", height: "100%" } }, PARTS.map((p) => {
    const pos = screenPositions[p.id];
    if (!pos) return null;
    const isHL = highlightId === p.id;
    const tc = getTagColor(p);
    return /* @__PURE__ */ React.createElement("line", { key: p.id, x1: pos.anchor.x, y1: pos.anchor.y, x2: pos.tag.x, y2: pos.tag.y, stroke: isHL ? tc : CC.muted, strokeWidth: isHL ? 1.5 : 0.5, strokeDasharray: isHL ? "none" : "3,4", opacity: isHL ? 0.8 : 0.15 });
  })), PARTS.map((p) => {
    const pos = screenPositions[p.id];
    if (!pos) return null;
    const isHL = highlightId === p.id;
    const tc = getTagColor(p);
    return /* @__PURE__ */ React.createElement("div", { key: p.id + "-tag", style: { position: "absolute", left: pos.tag.x, top: pos.tag.y, transform: "translate(-50%,-50%)", opacity: isHL ? 1 : 0.55, zIndex: isHL ? 10 : 1, transition: "opacity .3s" } }, isHL ? /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(255,255,255,.95)", border: `1.5px solid ${tc}50`, borderRadius: 10, padding: "6px 12px", minWidth: 110, boxShadow: `0 4px 16px rgba(27,58,45,.08), 0 0 0 3px ${tc}12` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: CC.forest, marginBottom: 3 } }, p.label), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10.5, gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { color: CC.muted } }, tagMode === "cost" ? "Cost" : tagMode === "co2" ? "CO\u2082e" : "Risk"), /* @__PURE__ */ React.createElement("span", { style: { color: tc, fontWeight: 800 } }, getTagLabel(p)))) : /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(255,255,255,.82)", border: `1px solid ${tc}28`, borderRadius: 6, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(6px)" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 5, height: 5, borderRadius: "50%", background: tc, boxShadow: `0 0 4px ${tc}44` } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9.5, fontWeight: 700, color: tc, whiteSpace: "nowrap" } }, getTagLabel(p))));
  })));
}
const rootElement = document.getElementById("hero-3d-container");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(/* @__PURE__ */ React.createElement(TorchHero, null));
}
