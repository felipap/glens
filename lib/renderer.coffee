
autoRotate = false

Renderer = (@container, @ui) ->

  refreshSize = =>
    width = $(@container).width()
    height = $(@container).height()

    @camera.aspect = width/height
    @camera.updateProjectionMatrix()
    @renderer.setSize(width, height)
    if @effectFXAA
      @effectFXAA.uniforms['resolution'].value.set(1/width, 1/height)
    @controls.handleResize()
    @composer.reset()

  setupStats = =>
    @stats = new Stats
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.top = '0px'
    @container.appendChild @stats.domElement

  animate = =>
    requestAnimationFrame animate.bind(@)
    # setTimeout animate.bind(@), 100
    @render()
    if @stats then @stats.update()

  #
  @refreshObject = () ->
    @gr.refresh()

  @onGcodeLoaded = (gcodeModel) =>
    @gr = new GCodeRenderer
    gcodeObj = @gr.render(gcodeModel)

    window.gr = @gr
    window.r = @

    @ui.controllers.gcodeIndex.max(@gr.modelViews.length - 1)
    @ui.controllers.gcodeIndex.setValue(0)
    @ui.controllers.animate.setValue(true)

    @camera.position.z = 500
    @camera.position.y = -1500
    @camera.lookAt(@gr.getCenter())

    if @object
      @scene.remove @object

    @object = gcodeObj
    @scene.add @object

  @render = ->
    time = Date.now() * 0.0005

    for object in @scene.children
      if autoRotate and object instanceof THREE.Object3D
        object.rotation.y = object.rotation.y + 0.015

    # if window.effectController and @gr
    #   if window.effectController.animate
    #     try
    #       @gr.setIndex @gr.index+1
    #       window.effectController.gcodeIndex = @gr.index
    #     catch e
    #       window.effectController.animate = false
    #       throw e
    #   else
    #     @gr.setIndex window.effectController.gcodeIndex

    @controls.update()
    @renderer.clear()
    @composer.render()

  # INIT
  @scene = new THREE.Scene()
  @renderer = new THREE.WebGLRenderer {
    clearColor: 0x000000
    clearAlpha: 1
    antialias: false
  }
  @renderer.autoClear = false
  @container.appendChild(@renderer.domElement)

  # Lights...
  [[ 0, 0, 1, 0xFFFFCC],
   [ 0, 1, 0, 0xFFCCFF],
   [ 1, 0, 0, 0xCCFFFF],
   [ 0, 0,-1, 0xCCCCFF],
   [ 0,-1, 0, 0xCCFFCC],
   [-1, 0, 0, 0xFFCCCC]].forEach (position) =>
    light = new THREE.DirectionalLight position[3]
    light.position.set(position[0], position[1], position[2]).normalize()
    @scene.add light

  conf =
    fov: 45
    near: 1
    far: 10000
    z: 300

  # Create camera
  aspect = window.innerWidth/window.innerHeight
  console.log aspect
  @camera = new THREE.PerspectiveCamera(conf.fov, aspect, conf.near, conf.far)
  @camera.position.z = conf.z
  @scene.add(@camera)

  # Camera control
  @controls = new THREE.TrackballControls(@camera)
  @controls.dynamicDampingFactor = 0.1
  @controls.rotateSpeed = 1.0

  # Effects
  @composer = new THREE.EffectComposer @renderer
  @composer.addPass new THREE.RenderPass(@scene, @camera)
  # @effectFXAA = new THREE.ShaderPass THREE.FXAAShader
  # @composer.addPass @effectFXAA # Antialas?
  # @composer.addPass new THREE.BloomPass(0.4)
  effectScreen = new THREE.ShaderPass THREE.CopyShader
  effectScreen.renderToScreen = true
  @composer.addPass effectScreen

  refreshSize()

  addEventListener 'resize', refreshSize

  addEventListener 'keydown', (e) ->
    if e.keyCode is 32 # spacebar
      autoRotate = not autoRotate

  setupStats()
  animate()

window.Renderer = Renderer