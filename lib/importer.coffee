
# GCODE importer

FileIO =

  error: (msg) ->
    alert msg

  loadPath: (path, callback) ->
    $.get(path, null, callback, 'text')
     .error => self.error 'Unable to load gcode.'

  load: (files, callback) ->
    if files.length
      for file in files
        @load file, callback
    else
      reader = new FileReader
      reader.onload = -> callback(reader.result)
      reader.readAsText files

GCodeImporter =

  importPath: (path, callback) ->
    FileIO.loadPath path, (gcode) ->
      GCodeImporter.importText gcode, callback

  importText: (gcode, callback) ->
    callback(gcode)

window.GCodeImporter = GCodeImporter