
window.openLoadDialog = ->
  $('#loadModal').modal()

window.effectController =
  gcodeIndex: 10
  animate: false
  speed: 0
  color: [0, 128, 255]

class ui

  duiControllers:
    gcodeIndex: null
    animate: null

  conf =
    defaultFilePath: 'models/companion_cube.gcode'

  onGcodeLoaded: (gcode) ->
    @renderer.onGcodeLoaded(gcode)
    $('#loadModal').modal 'hide'

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

    @renderer = new Renderer $('#renderArea')[0], @

    @setupDatGUI()

  setupDatGUI: () ->
    @dui = new dat.GUI()

    $('.dg.main').mousedown (e) ->
      e.stopPropagation()

    @duiControllers.animate = @dui.add(effectController, 'animate').listen()
    @duiControllers.gcodeIndex = @dui.add(effectController, 'gcodeIndex', 0,
      1000, 1000).listen()
    @duiControllers.gcodeIndex.onChange (val) =>
      if effectController.animate
        @duiControllers.animate.setValue(false)


$ -> window.ui = new ui