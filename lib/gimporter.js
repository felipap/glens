
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

  importPath: function (path, callback) {
    FileIO.loadPath(path, function (gcode) {
      GCodeImporter.importText(gcode, callback)
    })
  },

  importText: function (gcode, callback) {
    callback(gcode)
  },
}

