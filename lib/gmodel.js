
// GCODE model
// GCodeModel 1 → * GCode
// GCode 1 → * GWord
// GCode 1 → * comment

var debug = true;

/**
 * Generates a GCodeModel (with its GCodes) from a string of multiple gcodes.
 */
function GCodeModel (string) {
  this.codes = []

  var n = 0
  var lines = string.split('\n')

  for (var i=0; i<lines.length; i++) {
    var line = lines[i]
    var comment = null

    if (!line)
      continue

    if (line.indexOf(';') !== -1) {
      line = line.split(';')[0]
      if (debug)
        comment = line.split(';').slice(1).join()
      if (!line)
        continue
    }
    var gcode = new GCode(line, ++n, i, comment)
    if (!gcode.invalid) {
      this.codes.push(gcode)
    }
  }
}


function GCode (line, index, lineNum, comment) {
  this.words = []
  this.index = index

  if (debug) {
    this.comment = comment;
    this.originalLine = line
    this.lineNum = lineNum
  }

  var words = line.trim().split(' ')

  this.gcode = words[0]
  if (this.gcode[0] !== 'G' && this.gcode[0] !== 'M') {
    this.invalid = true
    return
  }

  function parseWord (word, index, parentGcode) {
    // Parses the next statement and leaves the counter on the first character
    // following the statement. Returns 1 if there was a statements, 0 if end of
    // string was reached or there was an error (check state.status_code).

    if (!word.length)
      throw new Error('Bad word format: "'+word+'"')

    var letter = word[0].toUpperCase()

    if (letter < 'A' || letter > 'Z')
      throw new Error('Unexpected command with letter '+letter+' in word '+word)

    var value = word.slice(1)
    if (isNaN(parseFloat(value)))
      console.log('PORRAA', word, index, parentGcode)
    return new GWord(letter, value, word) // TODO: validate value?
  }

  for (var i=1; i < words.length; ++i) {
    if (!words[i]) return
    try {
      this.words.push(parseWord(words[i], i, this))
    } catch (e) {
      console.log(e.message)
    }
    // console.log(word + " code: " + pWord.letter + " val: " + pWord.value + " group: ")
  }
}

GCode.prototype.toString = function () {
  return '{'+this.words.join(' ')+'}'+(this.comment?' ('+this.comment+')':'')
}

function GWord (l, v, r) {
  this.letter = l
  this.value = parseFloat(v)
  this.raw = r

  if (isNaN(this.value)) {
    throw new Error('Unexpected value in GWord (not a float?): '+this+' '+r+' '+v)
  }
 }

GWord.prototype.toString = function () {
  return this.letter + ':' + this.value + ' ('+this.raw+')'
}