
// GCODE importer

FileIO = {

  error: function (msg) {
    alert(msg)
  },

  loadPath: function (path, callback) {
    $.get(path, null, callback, 'text')
     .error(function () { this.error('Unable to load gcode.') }.bind(this))
  },

  load: function (files, callback) {
    var self = this;
    if (files.length) {
      files.forEach(function (file) {
        self.load(file, callback)
      })
    } else {
      reader = new FileReader
      reader.onload = function () { callback(reader.result) }
      reader.readAsText(files)
    }
  }
}

GCodeImporter = {

  setup: function (onGcodeLoaded, defaultFilePath) {

    var self = this

    $('.gcode_examples a').on('click', function (e) {
      e.preventDefault()
      self.importPath($(e.target).attr('href'), function (gcode) {
        localStorage.setItem('lastImport', $(e.target).attr('href'))
        self.importText(gcode, onGodeLoaded)
      })
      return false
    })

    $('body').on('dragover', function (e) {
      e.stopPropagation()
      e.preventDefault()
      e.originalEvent.dataTransfer.dropEffect = 'copy'
    })

    $('body').on('drop', function (e) {
      e.stopPropagation()
      e.preventDefault()
      FileIO.load(event.originalEvent.dataTransfer.files, function (gcode) {
        localStorage.removeItem('lastImport')
        self.importText(gcode, onGcodeModel)
      })
    })

    var path = localStorage.getItem('lastImport') || defaultFilePath
    this.importPath(path, onGcodeLoaded)

  },

  importPath: function (path, callback) {
    FileIO.loadPath(path, function (gcode) {
      GCodeImporter.importText(gcode, callback)
    })
  },

  importText: function (gcode, callback) {
    callback(new GCodeModel(gcode))
  },
}

