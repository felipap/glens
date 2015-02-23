
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
		if (['x','y','z','e','f'].indexOf(letter) === -1) {
			console.warn('Unexpected word letter '+word+' in code '+this.code)
		}
	}.bind(this));
}

function GCodeRenderer () {

	var relative = false;
	var layers = [];
	var self = this;

	this.modelViews = [];
	this.index = 0;
	this.baseObject = new THREE.Object3D();

	this.motionGeo = new THREE.Geometry();
	this.motionIncGeo = new THREE.Geometry();
	this.feedAllGeo = new THREE.Geometry();
	this.feedGeo = new THREE.Geometry();
	// this.feedIncGeo = new THREE.Geometry();

	this.lastLine = { x: 0, y: 0, z: 0, e: 0, f: 0 };

	// this.renderer = renderer;
	this.bounds = {
		min: { x: 100000, y: 100000, z: 100000 },
		max: { x:-100000, y:-100000, z:-100000 }
	};

	function absolute (v1, v2) {
		return relative ? v1 + v2 : v2;
	}

	function absolutifyNewLine (line) {
		var absolutified = {} // good name
		for (var attr in self.lastLine) {
			if (attr in line) {
				absolutified[attr] = absolute(self.lastLine[attr], line[attr])
			} else {
				absolutified[attr] = self.lastLine[attr]
			}
		}
		return absolutified
	}

	this.geometryHandlers = {

		G1: function (viewModel, lastLine) {
			// Example: G1 Z1.0 F3000
			//          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
			//          G1 E104.25841 F1800.0
			// Go in a straight line from the current (X, Y) point to the point
			// (90.6, 13.8), extruding material as the move happens from the current
			// extruded length to a length of
			// 22.4 mm.

			// Here we need information about the last lines, to fill in its
			// coordinates when we aren't passed one.

			var lastLine = self.lastLine
			var newLine = absolutifyNewLine(viewModel.line);

			var p1 = new THREE.Vector3(lastLine.x, lastLine.y, lastLine.z);
			var p2 = new THREE.Vector3(newLine.x, newLine.y, newLine.z);

			self.feedGeo.vertices.push(p1);
			self.feedGeo.vertices.push(p2);

			self.lastLine = newLine;
			return newLine;
		},

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
		var handler = this.geometryHandlers[gcodeModel.gcode]
		if (handler) {
			handler(view);
		} else {
			console.warn('No handler in place for gcode line '+gcodeModel);
		}
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
