
###*
 * GCodePainter
 * Renders
###

class GCodePainter

  constructor: ->
    @index = 0
    @viewModels = []
    @baseObject = new THREE.Object3D
    @motionGeo = new THREE.Geometry
    @motionIncGeo = new THREE.Geometry
    @motionIncMat = new THREE.LineBasicMateria {
      opacity: 0.2
      transparent: true
      linewidth: 1
      vertexColors: THREE.VertexColors
    }
    #
    @feedAllGeo = new THREE.Geometry

    @feedGeo = new THREE.Geometry
    @feedMat = new THREE.LineBasicMateria {
      opacity: 0.8
      transparent: true
      linewidth: 2
      vertexColors: THREE.VertexColors
    }
    #
    @feedIncGeo = new THREE.Geometry
    @feedIncMat = new THREE.LineBasicMateria {
      opacity: 0.2
      transparent: true
      linewidth: 2
      vertexColors: THREE.VertexColors
    }
    #
    @lastLine = {x:0, y:0, z:0, e:0, f:0}
    @relative = false

    # renderer: renderer
    @bounds = {
      min: { x: 100000, y: 100000, z: 100000 },
      max: { x:-100000, y:-100000, z:-100000 }
    }
