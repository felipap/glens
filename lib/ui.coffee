

window.openLoadDialog = ->
  $('#loadModal').modal()

class ui

  duiControllers =
    gcodeIndex: null
    animate: null

  conf =
    defaultFilePath: 'models/companion_cube.gcode'

  onGcodeLoaded: (gcode) ->
    console.log "OOOOOOOOOOO", gcode
    @gp = new GcodeParser
    @gm = gp.parse gcode
    @gr = new GCodeRenderer

    guiControllers.gcodeIndex.max(gr.viewModels.length - 1)
    guiControllers.gcodeIndex.setValue(0)
    guiControllers.animate.setValue(true)

    camera.position.z = 500
    camera.position.y = -1500
    camera.lookAt(gr.center)

    $('#loadModal').modal 'hide'
    if object
      @renderer.scene.remove object

    object = @gr.render @gm
    @renderer.scene.add object

  constructor: () ->

    if !Modernizr.webgl
      alert 'Sorry, you need a WebGL capable browser to use this.'
      return false

    $('.gcode_examples a').on 'click', (e) ->
      e.preventDefault()
      GCodeImporter.importPath $(@).attr('href'), @onGcodeLoaded
      false

    $('body').on 'dragover', (e) ->
      e.stopPropagation()
      e.preventDefault()
      e.originalEvent.dataTransfer.dropEffect = 'copy'

    $('body').on 'drop', (e) ->
      e.stopPropagation()
      e.preventDefault()
      FileIO.load event.originalEvent.dataTransfer.files, (gcode) ->
        GCodeImporter.importText gcode, @onGcodeLoaded

    GCodeImporter.importPath conf.defaultFilePath, @onGcodeLoaded

    @renderer = new Renderer $('#renderArea')[0]

    @setupDatGUI()

  setupDatGUI: () ->
    @dui = new dat.GUI()

    $('.dg.main').mousedown (e) ->
      e.stopPropagation()

    effectController =
      gcodeIndex: 10
      animate: false
      speed: 0
      color: [0, 128, 255]

    duiControllers.animate = @dui.add(effectController, 'animate').listen()
    duiControllers.gcodeIndex = @dui.add(effectController, 'gcodeIndex', 0,
      1000, 1000).listen()
    duiControllers.gcodeIndex.onChange (val) ->
      if effectController.animate
        duiControllers.animate.setValue(false)


$ -> new ui