/****************************************************************************
 Copyright (c) 2008 Radu Gruian
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011 Vit Valentin
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 Orignal code by Radu Gruian: http://www.codeproject.com/Articles/30838/Overhauser-Catmull-Rom-Splines-for-Camera-Animatio.So

 Adapted to cocos2d-x by Vit Valentin

 Adapted from cocos2d-x to cocos2d-iphone by Ricardo Quesada
 ****************************************************************************/

/**
 * @module cc
 */

/*
 * Returns the Cardinal Spline position for a given set of control points, tension and time. <br />
 * CatmullRom Spline formula. <br />
 * s(-ttt + 2tt - t)P1 + s(-ttt + tt)P2 + (2ttt - 3tt + 1)P2 + s(ttt - 2tt + t)P3 + (-2ttt + 3tt)P3 + s(ttt - tt)P4
 *
 * @method cardinalSplineAt
 * @param {Vec2} p0
 * @param {Vec2} p1
 * @param {Vec2} p2
 * @param {Vec2} p3
 * @param {Number} tension
 * @param {Number} t
 * @return {Vec2}
 */
function cardinalSplineAt(p0, p1, p2, p3, tension, t) {
	var t2 = t * t;
	var t3 = t2 * t;

	/*
	 * Formula: s(-ttt + 2tt - t)P1 + s(-ttt + tt)P2 + (2ttt - 3tt + 1)P2 + s(ttt - 2tt + t)P3 + (-2ttt + 3tt)P3 + s(ttt - tt)P4
	 */
	var s = (1 - tension) / 2;

	var b1 = s * (-t3 + 2 * t2 - t); // s(-t3 + 2 t2 - t)P1
	var b2 = s * (-t3 + t2) + (2 * t3 - 3 * t2 + 1); // s(-t3 + t2)P2 + (2 t3 - 3 t2 + 1)P2
	var b3 = s * (t3 - 2 * t2 + t) + (-2 * t3 + 3 * t2); // s(t3 - 2 t2 + t)P3 + (-2 t3 + 3 t2)P3
	var b4 = s * (t3 - t2); // s(t3 - t2)P4

	var x = p0.x * b1 + p1.x * b2 + p2.x * b3 + p3.x * b4;
	var y = p0.y * b1 + p1.y * b2 + p2.y * b3 + p3.y * b4;
	return cc.v2(x, y);
}

/*
 * returns a point from the array
 * @method getControlPointAt
 * @param {Array} controlPoints
 * @param {Number} pos
 * @return {Array}
 */
function getControlPointAt(controlPoints, pos) {
	var p = Math.min(controlPoints.length - 1, Math.max(pos, 0));
	return controlPoints[p];
}

function reverseControlPoints(controlPoints) {
	var newArray = [];
	for (var i = controlPoints.length - 1; i >= 0; i--) {
		newArray.push(cc.v2(controlPoints[i].x, controlPoints[i].y));
	}
	return newArray;
}

function cloneControlPoints(controlPoints) {
	var newArray = [];
	for (var i = 0; i < controlPoints.length; i++) newArray.push(cc.v2(controlPoints[i].x, controlPoints[i].y));
	return newArray;
}

/*
 * Cardinal Spline path. http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline
 * Absolute coordinates.
 *
 * @class CardinalSplineTo
 * @extends ActionInterval
 *
 * @param {Number} duration
 * @param {Array} points array of control points
 * @param {Number} tension
 *
 * @example
 * //create a cc.CardinalSplineTo
 * var action1 = cc.cardinalSplineTo(3, array, 0);
 */
cc.CardinalSplineTo = cc.Class({
	name: 'cc.CardinalSplineTo',
	extends: cc.ActionInterval,

	ctor: function (duration, points, tension) {
		/* Array of control points */
		this._points = [];
		this._deltaT = 0;
		this._tension = 0;
		this._previousPosition = null;
		this._accumulatedDiff = null;
		tension !== undefined && cc.CardinalSplineTo.prototype.initWithDuration.call(this, duration, points, tension);
	},

	initWithDuration: function (duration, points, tension) {
		if (!points || points.length === 0) {
			cc.errorID(1024);
			return false;
		}

		if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
			this.setPoints(points);
			this._tension = tension;
			return true;
		}
		return false;
	},

	clone: function () {
		var action = new cc.CardinalSplineTo();
		action.initWithDuration(this._duration, cloneControlPoints(this._points), this._tension);
		return action;
	},

	startWithTarget: function (target) {
		cc.ActionInterval.prototype.startWithTarget.call(this, target);
		// Issue #1441 from cocos2d-iphone
		this._deltaT = 1 / (this._points.length - 1);
		this._previousPosition = cc.v2(this.target.x, this.target.y);
		this._accumulatedDiff = cc.v2(0, 0);
	},

	update: function (dt) {
		dt = this._computeEaseTime(dt);
		var p, lt;
		var ps = this._points;
		// eg.
		// p..p..p..p..p..p..p
		// 1..2..3..4..5..6..7
		// want p to be 1, 2, 3, 4, 5, 6
		if (dt === 1) {
			p = ps.length - 1;
			lt = 1;
		} else {
			var locDT = this._deltaT;
			p = 0 | (dt / locDT);
			lt = (dt - locDT * p) / locDT;
		}

		var newPos = cardinalSplineAt(
			getControlPointAt(ps, p - 1),
			getControlPointAt(ps, p - 0),
			getControlPointAt(ps, p + 1),
			getControlPointAt(ps, p + 2),
			this._tension,
			lt
		);

		if (cc.macro.ENABLE_STACKABLE_ACTIONS) {
			var tempX, tempY;
			tempX = this.target.x - this._previousPosition.x;
			tempY = this.target.y - this._previousPosition.y;
			if (tempX !== 0 || tempY !== 0) {
				var locAccDiff = this._accumulatedDiff;
				tempX = locAccDiff.x + tempX;
				tempY = locAccDiff.y + tempY;
				locAccDiff.x = tempX;
				locAccDiff.y = tempY;
				newPos.x += tempX;
				newPos.y += tempY;
			}
		}
		this.updatePosition(newPos);
	},

	reverse: function () {
		var reversePoints = reverseControlPoints(this._points);
		return cc.cardinalSplineTo(this._duration, reversePoints, this._tension);
	},

	/*
	 * update position of target
	 * @method updatePosition
	 * @param {Vec2} newPos
	 */
	updatePosition: function (newPos) {
		this.target.setPosition(newPos);
		this._previousPosition = newPos;
	},

	/*
	 * Points getter
	 * @method getPoints
	 * @return {Array}
	 */
	getPoints: function () {
		return this._points;
	},

	/**
	 * Points setter
	 * @method setPoints
	 * @param {Array} points
	 */
	setPoints: function (points) {
		this._points = points;
	},
});

/**
 * !#en Creates an action with a Cardinal Spline array of points and tension.
 * !#zh 按基数样条曲线轨迹移动到目标位置。
 * @method cardinalSplineTo
 * @param {Number} duration
 * @param {Array} points array of control points
 * @param {Number} tension
 * @return {ActionInterval}
 *
 * @example
 * //create a cc.CardinalSplineTo
 * var action1 = cc.cardinalSplineTo(3, array, 0);
 */
cc.cardinalSplineTo = function (duration, points, tension) {
	return new cc.CardinalSplineTo(duration, points, tension);
};

/*
 * Cardinal Spline path. http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Cardinal_spline
 * Relative coordinates.
 *
 * @class CardinalSplineBy
 * @extends CardinalSplineTo
 *
 * @param {Number} duration
 * @param {Array} points
 * @param {Number} tension
 *
 * @example
 * //create a cc.CardinalSplineBy
 * var action1 = cc.cardinalSplineBy(3, array, 0);
 */
cc.CardinalSplineBy = cc.Class({
	name: 'cc.CardinalSplineBy',
	extends: cc.CardinalSplineTo,

	ctor: function (duration, points, tension) {
		this._startPosition = cc.v2(0, 0);
		tension !== undefined && this.initWithDuration(duration, points, tension);
	},

	startWithTarget: function (target) {
		cc.CardinalSplineTo.prototype.startWithTarget.call(this, target);
		this._startPosition.x = target.x;
		this._startPosition.y = target.y;
	},

	reverse: function () {
		var copyConfig = this._points.slice();
		var current;
		//
		// convert "absolutes" to "diffs"
		//
		var p = copyConfig[0];
		for (var i = 1; i < copyConfig.length; ++i) {
			current = copyConfig[i];
			copyConfig[i] = current.sub(p);
			p = current;
		}

		// convert to "diffs" to "reverse absolute"
		var reverseArray = reverseControlPoints(copyConfig);

		// 1st element (which should be 0,0) should be here too
		p = reverseArray[reverseArray.length - 1];
		reverseArray.pop();

		p.x = -p.x;
		p.y = -p.y;

		reverseArray.unshift(p);
		for (var i = 1; i < reverseArray.length; ++i) {
			current = reverseArray[i];
			current.x = -current.x;
			current.y = -current.y;
			current.x += p.x;
			current.y += p.y;
			reverseArray[i] = current;
			p = current;
		}
		return cc.cardinalSplineBy(this._duration, reverseArray, this._tension);
	},

	/**
	 * update position of target
	 * @method updatePosition
	 * @param {Vec2} newPos
	 */
	updatePosition: function (newPos) {
		var pos = this._startPosition;
		var posX = newPos.x + pos.x;
		var posY = newPos.y + pos.y;
		this._previousPosition.x = posX;
		this._previousPosition.y = posY;
		this.target.setPosition(posX, posY);
	},

	clone: function () {
		var a = new cc.CardinalSplineBy();
		a.initWithDuration(this._duration, cloneControlPoints(this._points), this._tension);
		return a;
	},
});

/**
 * !#en Creates an action with a Cardinal Spline array of points and tension.
 * !#zh 按基数样条曲线轨迹移动指定的距离。
 * @method cardinalSplineBy
 * @param {Number} duration
 * @param {Array} points
 * @param {Number} tension
 *
 * @return {ActionInterval}
 */
cc.cardinalSplineBy = function (duration, points, tension) {
	return new cc.CardinalSplineBy(duration, points, tension);
};

/*
 * An action that moves the target with a CatmullRom curve to a destination point.<br/>
 * A Catmull Rom is a Cardinal Spline with a tension of 0.5.  <br/>
 * http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
 * Absolute coordinates.
 *
 * @class CatmullRomTo
 * @extends CardinalSplineTo
 *
 * @param {Number} dt
 * @param {Array} points
 *
 * @example
 * var action1 = cc.catmullRomTo(3, array);
 */
cc.CatmullRomTo = cc.Class({
	name: 'cc.CatmullRomTo',
	extends: cc.CardinalSplineTo,

	ctor: function (dt, points) {
		points && this.initWithDuration(dt, points);
	},

	initWithDuration: function (dt, points) {
		return cc.CardinalSplineTo.prototype.initWithDuration.call(this, dt, points, 0.5);
	},

	clone: function () {
		var action = new cc.CatmullRomTo();
		action.initWithDuration(this._duration, cloneControlPoints(this._points));
		return action;
	},
});

/**
 * !#en Creates an action with a Cardinal Spline array of points and tension.
 * !#zh 按 Catmull Rom 样条曲线轨迹移动到目标位置。
 * @method catmullRomTo
 * @param {Number} dt
 * @param {Array} points
 * @return {ActionInterval}
 *
 * @example
 * var action1 = cc.catmullRomTo(3, array);
 */
cc.catmullRomTo = function (dt, points) {
	return new cc.CatmullRomTo(dt, points);
};

/*
 * An action that moves the target with a CatmullRom curve by a certain distance.  <br/>
 * A Catmull Rom is a Cardinal Spline with a tension of 0.5.<br/>
 * http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
 * Relative coordinates.
 *
 * @class CatmullRomBy
 * @extends CardinalSplineBy
 *
 * @param {Number} dt
 * @param {Array} points
 *
 * @example
 * var action1 = cc.catmullRomBy(3, array);
 */
cc.CatmullRomBy = cc.Class({
	name: 'cc.CatmullRomBy',
	extends: cc.CardinalSplineBy,

	ctor: function (dt, points) {
		points && this.initWithDuration(dt, points);
	},

	initWithDuration: function (dt, points) {
		return cc.CardinalSplineTo.prototype.initWithDuration.call(this, dt, points, 0.5);
	},

	clone: function () {
		var action = new cc.CatmullRomBy();
		action.initWithDuration(this._duration, cloneControlPoints(this._points));
		return action;
	},
});

/**
 * !#en Creates an action with a Cardinal Spline array of points and tension.
 * !#zh 按 Catmull Rom 样条曲线轨迹移动指定的距离。
 * @method catmullRomBy
 * @param {Number} dt
 * @param {Array} points
 * @return {ActionInterval}
 * @example
 * var action1 = cc.catmullRomBy(3, array);
 */
cc.catmullRomBy = function (dt, points) {
	return new cc.CatmullRomBy(dt, points);
};
