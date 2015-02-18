
function GCodeViewModel (code) {
  this.code = code
  this.vertexIndex = this.vertexLength = 0
}

function GCodeRenderer () {

  this.viewModels = []
  this.index = 0
  this.baseObject = new THREE.Object3D()
  //
  this.motionGeo = new THREE.Geometry()
  this.motionMat = new THREE.LineBasicMaterial({
    opacity: 0.2,
    transparent: true,
    linewidth: 1,
    vertexColors: THREE.VertexColors
  })
  //
  this.motionIncGeo = new THREE.Geometry()
  this.motionIncMat = new THREE.LineBasicMaterial({
    opacity: 0.2,
    transparent: true,
    linewidth: 1,
    vertexColors: THREE.VertexColors
  })
  //
  this.feedAllGeo = new THREE.Geometry()
  //
  this.feedGeo = new THREE.Geometry()
  this.feedMat = new THREE.LineBasicMaterial({
    opacity: 0.8,
    transparent: true,
    linewidth: 2,
    vertexColors: THREE.VertexColors
  })
  this.feedIncGeo = new THREE.Geometry()
  this.feedIncMat = new THREE.LineBasicMaterial({
    opacity: 0.2,
    transparent: true,
    linewidth: 2,
    vertexColors: THREE.VertexColors
  })
  //
  this.lastLine = {x:0, y:0, z:0, e:0, f:0}
  this.relative = false
  //
  this.bounds = {
    min: { x: 100000, y: 100000, z: 100000 },
    max: { x:-100000, y:-100000, z:-100000 }
  };
}