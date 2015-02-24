
var feedMaterial = new THREE.LineBasicMaterial({
	opacity: 0.4,
	transparent: true,
	linewidth: 1,
	// vertexColors: THREE.VertexColors
});


// Model for a GCode
function GCodeModelView (code) {
	this.code = code;
	this.vertexIndex = 0;
	this.vertexLength = 0;

	this.line = {}; // line = { x, y, z, e, f }
	this.code.words.forEach(function (word) {
		var letter = word.letter.toLowerCase();
		this.line[letter] = word.value;
		// if (['x','y','z','e','f'].indexOf(letter) === -1) {
		// 	console.warn('Unexpected word letter '+word+' in code '+this.code)
		// }
	}.bind(this));
}

function GCodeRenderer () {

	var layers = [];
	var self = this;

	this.modelViews = [];
	this.index = 0;
	this.baseObject = new THREE.Object3D();
	this.feedGeo = new THREE.Geometry();

	var lastLine = { x: 0, y: 0, z: 0, e: 0, f: 0, extruding: false };
	var bounds = {
		min: { x: 100000, y: 100000, z: 100000 },
		max: { x:-100000, y:-100000, z:-100000 }
	};

	var relative = false;
	function absolute (v1, v2) {
		return relative ? v1 + v2 : v2;
	}
	function delta (v1, v2) {
		return relative ? v2 : v2 - v1;
	}

	function absolutifyNewLine (line) {
		var absolutified = {} // good name
		for (var attr in lastLine) {
			if (attr in line) {
				absolutified[attr] = absolute(lastLine[attr], line[attr])
			} else {
				absolutified[attr] = lastLine[attr]
			}
		}
		return absolutified
	}

	function addSegment (p1, p2) {

		var group = {
			color: new THREE.Color(0xffff00),
		}
		if (p2.extruding) {

		self.feedGeo.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));
		self.feedGeo.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));

		self.feedGeo.colors.push(group.color);
		self.feedGeo.colors.push(group.color);
		}

		if (p2.extruding) {
			bounds.min.x = Math.min(bounds.min.x, p2.x);
			bounds.min.y = Math.min(bounds.min.y, p2.y);
			bounds.min.z = Math.min(bounds.min.z, p2.z);
			bounds.max.x = Math.max(bounds.max.x, p2.x);
			bounds.max.y = Math.max(bounds.max.y, p2.y);
			bounds.max.z = Math.max(bounds.max.z, p2.z);
		}
	}

	this.geoHandlers = {

		G1: function (viewModel) {
			// Example: G1 Z1.0 F3000
			//          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
			//          G1 E104.25841 F1800.0
			// Go in a straight line from the current (X, Y) point to the point
			// (90.6, 13.8), extruding material as the move happens from the current
			// extruded length to a length of
			// 22.4 mm.

			// Here we need information about the last lines, to fill in its
			// coordinates when we aren't passed one.

			var newLine = absolutifyNewLine(viewModel.line);
			if (delta(lastLine.e, newLine.e) > 0) {
				newLine.extruding = delta(lastLine.e, newLine.e) > 0;
			}

			addSegment(lastLine, newLine);
			lastLine = newLine;
		},

    G21: function (viewModel) {
      // G21: Set Units to Millimeters
      // Example: G21
      // Units from now on are in millimeters. (This is the RepRap default.)

      // No-op: So long as G20 is not supported.
    },

    G90: function (viewModel) {
      // G90: Set to Absolute Positioning
      // Example: G90
      // All coordinates from now on are absolute relative to the
      // origin of the machine. (This is the RepRap default.)

      relative = false;
    },

    G91: function (viewModel) {
      // G91: Set to Relative Positioning
      // Example: G91
      // All coordinates from now on are relative to the last position.

      // TODO!
      relative = true;
    },

    G92: function (viewModel) { // E0
      // G92: Set Position
      // Example: G92 E0
      // Allows programming of absolute zero point, by reseting the
      // current position to the values specified. This would set the
      // machine's X coordinate to 10, and the extrude coordinate to 90.
      // No physical motion will occur.
      // console.log('G92')

      // TODO: Only support E0
      // var newLine = lastLine;
      // var line = viewModel.line;
      // newLine.x = line.x !== undefined ? line.x : newLine.x;
      // newLine.y = line.y !== undefined ? line.y : newLine.y;
      // newLine.z = line.z !== undefined ? line.z : newLine.z;
      // newLine.e = line.e !== undefined ? line.e : newLine.e;
      // lastLine = newLine;
    },

    M82: function(viewModel) {
      // M82: Set E codes absolute (default)
      // Descriped in Sprintrun source code.

      // No-op, so long as M83 is not supported.
    },

    M84: function(viewModel) {
      // M84: Stop idle hold
      // Example: M84
      // Stop the idle hold on all axis and extruder. In some cases the
      // idle hold causes annoying noises, which can be stopped by
      // disabling the hold. Be aware that by disabling idle hold during
      // printing, you will get quality issues. This is recommended only
      // in between or after printjobs.

      // No-op
    },

		default: function (viewModel) {
      // console.error('Unknown command:', args.cmd, args, info);
			console.warn('No handler in place for gcode line '+viewModel.code);
		}
	};
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
GCodeRenderer.prototype.refreshModel = function () {
	var self = this;

	var mviews = [];
	this.model.codes.forEach(function (gcodeModel) {
		var view = new GCodeModelView(gcodeModel);
		(this.geoHandlers[gcodeModel.gcode] || this.geoHandlers['default'])(view);
		mviews.push(view);
	}.bind(this));
	console.log('model', this.model.codes.length)
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
	this.refreshModel();

	var mergedFeeds = this.feedGeo.clone();
	// mergedFeeds.merge(this.feedGeo.clone());
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
GCodeRenderer.prototype.updateLines = function () {
	var self = this;

	while (self.baseObject.children.length > 0) {
		self.baseObject.remove(self.baseObject.children[0]);
	}

	var feedLine = new THREE.Line(this.feedGeo, feedMaterial, THREE.LinePieces);
	self.baseObject.add(feedLine);
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
