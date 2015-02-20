
window.openLoadDialog = ->
  $('#loadModal').modal()

window.effectController =
  gcodeIndex: 10
  animate: false
  motionLine: true
  feedLine: true
  feedIncLine: true
  speed: 0
  color: [0, 128, 255]

class ui

  controllers:
    gcodeIndex: null
    animate: null

  conf =
    defaultFilePath: 'models/octocat.gcode'

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

    @controllers.animate = @dui.add(effectController, 'animate').listen()
    @controllers.motionLine = @dui.add(effectController, 'motionLine').listen()
    @controllers.feedLine = @dui.add(effectController, 'feedLine').listen()
    @controllers.feedIncLine = @dui.add(effectController, 'feedIncLine').listen()
    @controllers.gcodeIndex = @dui.add(effectController, 'gcodeIndex', 0,

      1000, 1000).listen()
    @controllers.gcodeIndex.onChange (val) =>
      if effectController.animate
        @controllers.animate.setValue(false)

$ -> window.ui = new ui