
// GCODE model
// GCodeModel 1 → * GCode
// GCode 1 → * GWord
// GCode 1 → * comment

function GCodeModel () {
  this.codes = []
}

GCodeModel.prototype.toString = function () {
  var output = ''
  this.codes.forEach(function (code) {
    output += code.toString() + '\n'
  })
  return output
}

function GCode () {
  this.words = []
  this.comments = []
  this.index = 0
}

GCode.prototype.toString = function () {
  var output = ''
  if (this.comments.length > 0)
    output = this.comments.join(' ') + '\n'
  this.words.forEach(function (word) {
    output += word.toString() + '\n'
  })
  return output
}

function GWord (l, v, r) {
  this.letter = l
  this.value = v
  this.raw = r
}

GWord.prototype.toString = function () {
  return this.letter + ':' + this.value + ' ('+this.raw+')'
}