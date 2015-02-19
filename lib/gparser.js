
// GCODE parser

window.ParseGCode = function (gcode) {
  var model = new GCodeModel

  function parseComments (line) {
    var comments = []

    function addComments (matches) {
      if (matches) {
        Array.prototype.push.apply(comments, matches)
      }
    }

    // Full line parenthesis style comments
    addComments(line.match(/\((.*)\)$/g, ''))
    // Inline parenthesis style comments
    addComments(line.match(/\((.*?)\)/g, ''))
    // Semicolon style comments
    addComments(line.match(/;(.*$)/g, ''))
    return comments
  }

  function parseWord (word) {
    // Parses the next statement and leaves the counter on the first character
    // following the statement. Returns 1 if there was a statements, 0 if end of
    // string was reached or there was an error (check state.status_code).

    if (!word.length)
      throw new Error('Bad word format: "'+word+'"')

    var letter = word[0].toUpperCase()

    if (letter < 'A' || letter > 'Z')
      throw new Error('Unexpected command with letter '+letter+' in word '+word)

    var value = word.slice(1)
    return new GWord(letter, value, word) // TODO: validate value?
  }

  function parseLine (line) {
    var pLine = new GCode
    pLine.comments = parseComments(line)
    // Remove found comments from line
    // TODO: refactor this?
    pLine.comments.forEach(function (c) {
      line = line.replace(c, '')
    })

    line.trim().split(' ').forEach(function (word) {
      if (!word)
        return;
      try {
        var pWord = parseWord(word)
        pLine.words.push(pWord)
      } catch (e) {
        console.log(e.message)
      }
      // console.log(word + " code: " + pWord.letter + " val: " + pWord.value + " group: ")
    })

    return pLine
  }

  var current = new GCode
  var n = 0
  gcode.split('\n').forEach(function (line) {
    var pLine = parseLine(line)
    pLine.words.forEach(function (word) {
      switch (word.letter) {
        case 'G': case 'M':
          if (current.words.length > 0)
            model.codes.push(current)
            current = new GCode
            current.index = ++n
          break
      }
      current.words.push(word)
    })
  })

  model.codes.push(current)
  return model
}

window.ParseGCode = ParseGCode