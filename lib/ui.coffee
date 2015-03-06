
window.openLoadDialog = ->
  $('#loadModal').modal()

window.effectController =
  gcodeIndex: 10
  animate: false
  motionLine: true
  feedLine: true
  # feedIncLine: true
  speed: 0
  color: [0, 128, 255]


oldAlert = window.alert

window.alert = () ->
  if window.Android
    Android.showToast(arguments[0])
  else
    oldAlert.apply(null, arguments)

class Ui

  controllers:
    gcodeIndex: null
    animate: null

  defaultImportPath = 'models/octocat.gcode'

  onGcodeLoaded: (model) ->
    @renderer.onGcodeLoaded(model)
    $('#loadModal').modal 'hide'

  constructor: () ->

    console.log 'Starting Ui'
    alert('oiem')

    if !Modernizr.webgl
      alert 'Sorry, you need a WebGL capable browser to use this.'
      return false

    if !Modernizr.localstorage
      alert 'Man, your browser is ancient. WTF Can\'t work like this!'
      return false

    @renderer = new Renderer $('#renderArea')[0], @

    GCodeImporter.setup(@onGcodeLoaded.bind(@), defaultImportPath)

    @setupDatGUI()

  setupDatGUI: () ->
    # @dui = new dat.GUI()

    $('.dg.main').mousedown (e) ->
      e.stopPropagation()

    # @controllers.animate = @dui.add(effectController, 'animate').listen()
    # @controllers.motionLine = @dui.add(effectController, 'motionLine').listen()
    # @controllers.feedLine = @dui.add(effectController, 'feedLine').listen()
    # # @controllers.feedIncLine = @dui.add(effectController, 'feedIncLine').listen()
    # @controllers.gcodeIndex = @dui.add(effectController, 'gcodeIndex', 0,
    #   1000, 1000).listen()

    # @controllers.gcodeIndex.onChange (val) =>
    #   if effectController.animate
    #     @controllers.animate.setValue(false)

    # @controllers.motionLine.onChange => @renderer.refreshObject()
    # @controllers.feedLine.onChange => @renderer.refreshObject()
    # # @controllers.feedIncLine.onChange => @renderer.refreshObject()

$ -> window.ui = new Ui