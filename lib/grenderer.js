
/**
 * feedAll is used to find boundary.
 */


// THREE.js materials for the different objects rendered.
var motionMaterial = new THREE.LineBasicMaterial({
  opacity: 0.2,
  transparent: true,
  linewidth: 1,
  vertexColors: THREE.VertexColors
});

var motionIncMaterial = new THREE.LineBasicMaterial({
  opacity: 0.2,
  transparent: true,
  linewidth: 1,
  vertexColors: THREE.VertexColors
});

var feedMaterial = new THREE.LineBasicMaterial({
  opacity: 0.8,
  transparent: true,
  linewidth: 2,
  vertexColors: THREE.VertexColors
});

// var feedIncMaterial = new THREE.LineBasicMaterial({
//   opacity: 0.2,
//   transparent: true,
//   linewidth: 2,
//   vertexColors: THREE.VertexColors
// });


// Model for a GCode
function GCodeModelView (code, geometryHandlers) {
  // TODO this.cmd should come packaged in code obj
  this.code = code;
  this.vertexIndex = 0;
  this.vertexLength = 0;
  this.cmd = code.words[0].letter+code.words[0].value;

  var geometryHandler = geometryHandlers[this.cmd];
  // why?
  // this.material = materialHandlers[cmd] && materialHandlers[cmd](this);
  if (geometryHandler) {
    geometryHandler(this);
  } else {
    console.warn('No handler in place for cmd '+this.cmd+' in code '+code);
  }
}

function GCodeRenderer() {
  var relative = false;

  function absolute (v1, v2) {
    return relative ? v1 + v2 : v2;
  }

  var self = this;

  this.modelViews = [];
  this.index = 0;
  this.baseObject = new THREE.Object3D();

  this.motionGeo = new THREE.Geometry();
  this.motionIncGeo = new THREE.Geometry();
  this.feedAllGeo = new THREE.Geometry();
  this.feedGeo = new THREE.Geometry();
  // this.feedIncGeo = new THREE.Geometry();

  this.lastLine = {};

  // this.renderer = renderer;
  this.bounds = {
    min: { x: 100000, y: 100000, z: 100000 },
    max: { x:-100000, y:-100000, z:-100000 }
  };

  this.geometryHandlers = {

    // G0: function(viewModel) {
    //   // console.log("in g0 renderer handler " + code)

    //   var newLine = {};

    //   viewModel.code.words.forEach(function(word) {
    //     // TODO: handle non-numerical values
    //     switch(word.letter) {
    //       case 'X': case 'Y': case 'Z':  case 'E':  case 'F':
    //         var p = word.letter.toLowerCase();
    //         newLine[p] = absolute(self.lastLine[p], parseFloat(word.value));
    //         break;
    //     }
    //   });

    //   ['x','y','z','e','f'].forEach(function(prop) {
    //     if (newLine[prop] === undefined) {
    //       newLine[prop] = self.lastLine[prop];
    //     }
    //   });

    //   viewModel.vertexIndex = self.motionGeo.vertices.length;

    //   // var color =  new THREE.Color(motionColors[viewModel.code.index%motionColors.length]);
    //   var color =  motionColors[viewModel.code.index%motionColors.length];
    //   // var color = new THREE.Color(0xffff00);
    //   self.motionGeo.vertices.push(new THREE.Vector3(self.lastLine.x, self.lastLine.y, self.lastLine.z));
    //   self.motionGeo.vertices.push(new THREE.Vector3(newLine.x, newLine.y, newLine.z));

    //   self.motionGeo.colors.push(color);
    //   self.motionGeo.colors.push(color);

    //   viewModel.vertexLength = self.motionGeo.vertices.length - viewModel.vertexIndex;

    //   self.lastLine = newLine;

    //   return self.motionGeo;
    // },
    G1: function (viewModel) {
      // console.log("in g1 renderer handler " + viewModel.code)

      // Here we need information about the last lines, to fill in its
      // coordinates when we aren't passed one.

      var newLine = {};

      viewModel.code.words.forEach(function(word) {
        // TODO: handle non-numerical values
        switch(word.letter) {
          case 'X': case 'Y': case 'Z':  case 'E':  case 'F':
            newLine[word.letter] = absolute(self.lastLine[word.letter], parseFloat(word.value));
            break;
        }
      });

      ['X','Y','Z','E','F'].forEach(function(prop) {
        if (newLine[prop] === undefined) {
          newLine[prop] = self.lastLine[prop] || 0;
        }
      });

      var color = new THREE.Color(feedColors[viewModel.code.index%feedColors.length]);

      var p1 = new THREE.Vector3(self.lastLine.X, self.lastLine.Y, self.lastLine.Z);
      var p2 = new THREE.Vector3(newLine.X, newLine.Y, newLine.Z);


      self.feedGeo.vertices.push(p1);
      self.feedGeo.vertices.push(p2);
      self.feedGeo.colors.push(color);
      self.feedGeo.colors.push(color);
      if( viewModel.code.index <= self.index ) {
      } else {
        // self.feedIncGeo.colors.push(color2);
        // self.feedIncGeo.colors.push(color1);
        // self.feedIncGeo.vertices.push(p1);
        // self.feedIncGeo.vertices.push(p2);
      }

      self.lastLine = newLine;

      return self.feedGeo;
    },
    G2: function(viewModel) {
    }

  } // end geometryHandlers

  // this.materialHandlers = {

  //   G0: function(viewModel) {
  //     return null;
  //     return this.motionMaterial;
  //   },
  //   G1: function(viewModel) {
  //     return null;
  //     return this.feedMaterial;
  //   },
  //   G2: function(viewModel) {
  //     return null;
  //     return this.feedMaterial;
  //   }

  // } // end materialHandlers

};

// motionColors = [
//   new THREE.Color(0x66ccff)
// ]
var motionColors =
feedColors = [
  new THREE.Color(0xffcc66) // canteloupe
, new THREE.Color(0x66ccff) // sky
, new THREE.Color(0x22bb22) // honeydew
, new THREE.Color(0xff70cf) // carnation
, new THREE.Color(0xcc66ff) // lavender
, new THREE.Color(0xfffe66) // banana
, new THREE.Color(0xff6666) // salmon
, new THREE.Color(0x66ffcc) // spindrift
, new THREE.Color(0x66ff66) // flora
]

/**
 * Render current this.model
 */
GCodeRenderer.prototype.refresh = function () {
  var self = this;

  var mviews = [];
  this.model.codes.forEach(function(code) {
    mviews.push(new GCodeModelView(code, this.geometryHandlers))
  }.bind(this));
  this.modelViews = mviews;

  this.updateLines();

  return self.baseObject
}

/**
 * Get center of base object.
 */
GCodeRenderer.prototype.getCenter = function () {
  return new THREE.Vector3(
    this.bounds.min.x + ((this.bounds.max.x - this.bounds.min.x) / 2),
    this.bounds.min.y + ((this.bounds.max.y - this.bounds.min.y) / 2),
    this.bounds.min.z + ((this.bounds.max.z - this.bounds.min.z) / 2)
  );
}

GCodeRenderer.prototype.render = function (model) {
  this.model = model;
  this.refresh();

  var mergedFeeds = this.feedAllGeo.clone();
  mergedFeeds.merge(this.feedGeo.clone());
  mergedFeeds.computeBoundingBox();
  this.bounds = mergedFeeds.boundingBox;

  var zScale = window.innerHeight / (this.bounds.max.z - this.bounds.min.z),
      yScale = window.innerWidth / (this.bounds.max.y - this.bounds.min.y),
      xScale = window.innerWidth / (this.bounds.max.x - this.bounds.min.x),
      scale = Math.min(zScale, Math.min(xScale, yScale)),
      center = this.getCenter();

  // Yes.
  this.baseObject.position = center.multiplyScalar(-scale);
  // Put object at the center of viewport
  this.baseObject.applyMatrix(
    new THREE.Matrix4().makeTranslation(
      center.x - this.baseObject.position.x,
      center.y - this.baseObject.position.y,
      center.z - this.baseObject.position.z
    )
  );
  // Yes too.
  this.baseObject.scale.multiplyScalar(scale);
  return this.baseObject;
};

/**
 * Update lines which create the THREE object from the gcodes.
 */
GCodeRenderer.prototype.updateLines = function() {
  var self = this;

  while (self.baseObject.children.length > 0) {
    self.baseObject.remove(self.baseObject.children[0]);
  }

  var motionLine = new THREE.Line(this.motionGeo, motionMaterial, THREE.LinePieces);
  var feedLine = new THREE.Line(this.feedGeo, feedMaterial, THREE.LinePieces);
  // var feedIncLine = new THREE.Line(this.feedIncGeo, feedIncMaterial, THREE.LinePieces);

  if (ui.controllers.motionLine.getValue())
    self.baseObject.add(motionLine);
  if (ui.controllers.feedLine.getValue())
    self.baseObject.add(feedLine);
  // if (ui.controllers.feedIncLine.getValue())
    // self.baseObject.add(feedIncLine);
};

// Used to set at which gcode command we're at...
// GCodeRenderer.prototype.setIndex = function(index) {
//   index = Math.floor(index);
//   if( this.index == index ) { return; }
//   if( index < 0 || index >= this.modelViews.length ) {
//     throw new Error("invalid index");
//   }

//   var vm = this.modelViews[index];

//   this.feedGeo = new THREE.Geometry();

//   var vertices = this.feedAllGeo.vertices.slice(0, vm.vertexIndex + vm.vertexLength);
//   Array.prototype.push.apply( this.feedGeo.vertices, vertices );

//   var colors = this.feedAllGeo.colors.slice(0, vm.vertexIndex + vm.vertexLength);
//   Array.prototype.push.apply( this.feedGeo.colors, colors );


//   this.index = index;
//   this.updateLines();
// };
