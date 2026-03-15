// Hero 3D Abstract Gear Assembly
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-3d-container');
  if (!container) return;

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '1';
  container.insertBefore(renderer.domElement, container.firstChild);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(5, 4, 8);
  camera.lookAt(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  const group = new THREE.Group();
  scene.add(group);

  const materialDark = new THREE.MeshStandardMaterial({
    color: 0x1B3A2D,
    roughness: 0.3,
    metalness: 0.8
  });

  const materialOrange = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.4,
    metalness: 0.5
  });

  const materialLight = new THREE.MeshStandardMaterial({
    color: 0x4a7c59,
    roughness: 0.2,
    metalness: 0.6
  });

  const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 6, 32);
  const shaft = new THREE.Mesh(shaftGeo, materialDark);
  shaft.rotation.z = Math.PI / 2;
  group.add(shaft);

  const gear1Geo = new THREE.TorusGeometry(1.5, 0.4, 16, 32);
  const gear1 = new THREE.Mesh(gear1Geo, materialOrange);
  gear1.position.x = -1.5;
  gear1.rotation.y = Math.PI / 2;
  group.add(gear1);

  const housingGeo = new THREE.CylinderGeometry(2.2, 2.2, 1.5, 32, 1, true);
  const housing = new THREE.Mesh(housingGeo, new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
  }));
  housing.position.x = -1.5;
  housing.rotation.z = Math.PI / 2;
  group.add(housing);

  const gear2Geo = new THREE.TorusGeometry(2, 0.3, 16, 48);
  const gear2 = new THREE.Mesh(gear2Geo, materialLight);
  gear2.position.x = 1.5;
  gear2.rotation.y = Math.PI / 2;
  group.add(gear2);

  const connectorGeo = new THREE.BoxGeometry(0.2, 0.2, 4);

  const c1 = new THREE.Mesh(connectorGeo, materialDark);
  c1.position.set(0, 1.2, 1.2);
  group.add(c1);

  const c2 = new THREE.Mesh(connectorGeo, materialDark);
  c2.position.set(0, -1.2, -1.2);
  group.add(c2);

  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    group.rotation.y = time * 0.5;
    group.rotation.x = Math.sin(time) * 0.1;

    const explodeOffset = (Math.sin(time * 2) + 1) * 0.5;

    gear1.position.x = -1.5 - (explodeOffset * 0.5);
    housing.position.x = -1.5 - (explodeOffset * 0.5);
    gear2.position.x = 1.5 + (explodeOffset * 0.8);

    c1.position.y = 1.2 + (explodeOffset * 0.3);
    c1.position.z = 1.2 + (explodeOffset * 0.3);

    c2.position.y = -1.2 - (explodeOffset * 0.3);
    c2.position.z = -1.2 - (explodeOffset * 0.3);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
