
# GCODE parser

class GCodeParser

  constructor: ->
    @model = new GCodeModel

  parseComments: (line) ->
    comments = []

    addComments = (matches) ->
      if matches
        comments.push c for c in matches

    # Full line parenthesis style comments
    addComments line.match(/\((.*)\)$/g, '')
    # Inline parenthesis style comments
    addComments line.match(/\((.*?)\)/g, '')
    # Semicolon style comments
    addComments line.match(/;(.*$)/g, '')
    return comments

  parseWord: (word) ->
    # Parses the next statement and leaves the counter on the first character
    # following the statement. Returns 1 if there was a statements, 0 if end of
    # string was reached or there was an error (check state.status_code).

    if not word.length
      throw new Error 'Bad word format: "'+word+'"'

    letter = word[0].toUpperCase()

    if letter < 'A' or letter > 'Z'
      throw new Error 'Unexpected command with letter '+letter+' in word '+word

    value = word.slice(1)
    # TODO: validate value?
    new GWord letter, value, word

  parseLine: (line) ->
    pLine = new GCode
    pLine.comments = @parseComments line
    # Remove found comments from line
    # TODO: refactor this?
    pLine.comments.forEach (c) ->
      line = line.replace(c, '')

    words = line.trim().split(' ')
    for word in words when word
      # console.log 'parsing word: "' + word + '"'

      try
        pWord = @parseWord word
        pLine.words.push pWord
      catch e
        console.log e.message

      # console.log word + " code: " + pWord.letter + " val: " + pWord.value + " group: "

    return pLine

  parse: (gcode) ->

    current = new GCode
    n = 0

    for line in gcode.split('\n')
      pLine = @parseLine line
      pLine.words.forEach (word) =>
        switch word.letter
          when 'G', 'M'
            if current.words.length > 0
              @model.codes.push current
              current = new GCode
              current.index = ++n
        current.words.push(word)
    console.log @
    @model.codes.push(current)
    @model

window.GCodeParser = GCodeParser