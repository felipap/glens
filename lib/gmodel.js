
// GCODE model
// GCodeModel 1 → * GCode
// GCode 1 → * GWord
// GCode 1 → * comment

/**
 * Generates a GCodeModel (with its GCodes) from a string of multiple gcodes.
 */
function GCodeModel (string) {
  var n = 0
  this.codes = []
  string.split('\n').forEach(function (line) {
    if (!line) return;
    gcode = new GCode(++n, line)
    if (!gcode.invalid) {
      // JESUS!
      // Couldn't handle this gcode. Must be pretty cra-zy.
      this.codes.push(gcode)
    }
  }.bind(this))
}

GCodeModel.prototype.toString = function () {
  var output = ''
  this.codes.forEach(function (code) {
    output += code.toString() + '\n'
  })
  return output
}

function GCode (index, line) {
  this.words = []
  this.comments = []
  this.index = index

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

  this.comments = parseComments(line)
  // Remove found comments from line
  // TODO: refactor this?
  this.comments.forEach(function (c) {
    line = line.replace(c, '')
  })

  var words = line.trim().split(' ')

  this.gcode = words[0]
  if (this.gcode[0] !== 'G' && this.gcode[0] !== 'M') {
    this.invalid = true
    return
  }

  words.slice(1).forEach(function (word) {
    if (!word)
      return;
    try {
      this.words.push(GWord.parse(word))
    } catch (e) {
      console.log(e.message)
    }
    // console.log(word + " code: " + pWord.letter + " val: " + pWord.value + " group: ")
  }.bind(this))

}

GCode.prototype.toString = function () {
  var output = ''
  if (this.comments.length > 0)
    output = this.comments.join(' ') + '\n'
  return '{'+this.words.join(' ')+'}'
}

function GWord (l, v, r) {
  this.letter = l
  this.value = parseFloat(v)
  this.raw = r

  if (isNaN(this.value)) {
    throw new Error('Unexpected value in GWord (not a float?): '+v)
  }
}

GWord.parse = function (word) {
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

GWord.prototype.toString = function () {
  return this.letter + ':' + this.value + ' ('+this.raw+')'
}