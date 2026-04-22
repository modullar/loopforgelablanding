/**
 * Custom Three.js entry point — imports ONLY the classes used by TorchHero.js.
 * This is bundled into three.custom.min.js via esbuild for tree-shaking.
 */
export {
  // Core
  Scene,
  PerspectiveCamera,
  WebGLRenderer,

  // Objects
  Group,
  Mesh,

  // Materials
  MeshPhongMaterial,

  // Geometries
  LatheGeometry,
  TorusGeometry,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  TubeGeometry,

  // Curves
  CatmullRomCurve3,

  // Math
  Vector2,
  Vector3,

  // Lights
  AmbientLight,
  DirectionalLight,
  PointLight,

  // Constants
  DoubleSide
} from 'three';
