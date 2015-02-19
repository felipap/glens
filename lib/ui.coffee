
window.openLoadDialog = ->
  $('#loadModal').modal()

window.effectController =
  gcodeIndex: 10
  animate: false
  speed: 0
  color: [0, 128, 255]

class ui

  duiControllers =
    gcodeIndex: null
    animate: null

  conf =
    defaultFilePath: 'models/companion_cube.gcode'

  onGcodeLoaded: (gcode) ->
    # console.log "OOOOOOOOOOO", gcode
    @gp = new GCodeParser
    @gm = @gp.parse gcode
    @gr = new GCodeRenderer
    gcodeObj = @gr.render(@gm)

    duiControllers.gcodeIndex.max(@gr.viewModels.length - 1)
    duiControllers.gcodeIndex.setValue(0)
    duiControllers.animate.setValue(true)

    @renderer.camera.position.z = 500
    @renderer.camera.position.y = -1500
    console.log @gr
    @renderer.camera.lookAt(@gr.center)

    $('#loadModal').modal 'hide'
    if @object
      @renderer.scene.remove @object

    @object = gcodeObj
    @renderer.scene.add @object
    console.log('render')

  constructor: () ->

    if !Modernizr.webgl
      alert 'Sorry, you need a WebGL capable browser to use this.'
      return false

    $('.gcode_examples a').on 'click', (e) =>
      e.preventDefault()
      GCodeImporter.importPath $(e.target).attr('href'), @onGcodeLoaded.bind(@)
      false

    $('body').on 'dragover', (e) =>
      e.stopPropagation()
      e.preventDefault()
      e.originalEvent.dataTransfer.dropEffect = 'copy'

    $('body').on 'drop', (e) =>
      e.stopPropagation()
      e.preventDefault()
      FileIO.load event.originalEvent.dataTransfer.files, (gcode) ->
        GCodeImporter.importText gcode, @onGcodeLoaded.bind(@)

    GCodeImporter.importPath conf.defaultFilePath, @onGcodeLoaded.bind(@)

    @renderer = new Renderer $('#renderArea')[0]

    @setupDatGUI()

  setupDatGUI: () ->
    @dui = new dat.GUI()

    $('.dg.main').mousedown (e) ->
      e.stopPropagation()


    duiControllers.animate = @dui.add(effectController, 'animate').listen()
    duiControllers.gcodeIndex = @dui.add(effectController, 'gcodeIndex', 0,
      1000, 1000).listen()
    duiControllers.gcodeIndex.onChange (val) ->
      if effectController.animate
        duiControllers.animate.setValue(false)


$ -> window.ui = new ui