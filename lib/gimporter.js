
// GCODE importer

FileIO = {

  error: function (msg) {
    alert(msg)
  },

  loadPath: function (path, callback) {
    $.get(path, null, callback, 'text')
     .error(function () {
      this.error('Unable to load gcode.')
    }.bind(this))
  },

  loadFile: function (files, callback) {
    if (files.length !== 1) {
      alert('Drop 1 file and 1 file only.')
      return
    }
    reader = new FileReader
    reader.onload = function () { callback(reader.result) }
    reader.readAsText(files[0])
  }
}

GCodeImporter = {

  setup: function (onGcodeLoaded, defaultFilePath) {

    var self = this

    $('.gcode_examples a').on('click', function (e) {
      e.preventDefault()
      self.importPath($(e.target).attr('href'), function (model) {
        localStorage.setItem('lastImport', $(e.target).attr('href'))
        onGcodeLoaded(model)
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
      FileIO.loadFile(e.originalEvent.dataTransfer.files, function (gcode) {
        self.importText(gcode, onGcodeLoaded)
      })
    })

    var path = localStorage.getItem('lastImport') || defaultFilePath
    this.importPath(path, onGcodeLoaded)
  },

  importPath: function (path, callback) {
    console.log('importPath', path)
    FileIO.loadPath(path, function (gcode) {
      console.log('Imported path '+path);
      GCodeImporter.importText(gcode, callback)
    })
  },

  importText: function (gcode, callback) {
    callback(new GCodeModel(gcode))
  },
}

