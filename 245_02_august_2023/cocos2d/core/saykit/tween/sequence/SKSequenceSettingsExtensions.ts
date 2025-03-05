const { ccclass } = cc._decorator;

@ccclass("saykit.SequenceSettingsExtensions")
export default class SKSequenceSettingsExtensions {
	// Adds the given tween to the end of the Sequence.
	// Has no effect if the Sequence has already started
	// "t" - The tween to append
	public static append(s: saykit.Sequence, t: saykit.Tween): saykit.Sequence {
		if (!SKSequenceSettingsExtensions._validateAddToSequence(s, t)) return s;
		saykit.Sequence.doInsert(s, t, s.duration);
		return s;
	}
	// Adds the given tween to the beginning of the Sequence, pushing forward the other nested content.
	// Has no effect if the Sequence has already started
	// "t" - The tween to prepend
	public static prepend(s: saykit.Sequence, t: saykit.Tween): saykit.Sequence {
		if (!SKSequenceSettingsExtensions._validateAddToSequence(s, t)) return s;
		saykit.Sequence.doPrepend(s, t);
		return s;
	}
	// Inserts the given tween at the same time position of the last tween, callback or intervale added to the Sequence.
	// Note that, in case of a join after an interval, the insertion time will be the time where the interval starts, not where it finishes.
	// Has no effect if the Sequence has already started
	public static join(s: saykit.Sequence, t: saykit.Tween): saykit.Sequence {
		if (!SKSequenceSettingsExtensions._validateAddToSequence(s, t)) return s;
		saykit.Sequence.doInsert(s, t, s.lastTweenInsertTime);
		return s;
	}
	// Inserts the given tween at the given time position in the Sequence,
	// automatically adding an interval if needed.
	// Has no effect if the Sequence has already started
	// "atPosition" - The time position where the tween will be placed
	// "t" - The tween to insert
	public static insert(s: saykit.Sequence, atPosition: number, t: saykit.Tween): saykit.Sequence {
		if (!SKSequenceSettingsExtensions._validateAddToSequence(s, t)) return s;
		saykit.Sequence.doInsert(s, t, atPosition);
		return s;
	}

	// Adds the given interval to the end of the Sequence.
	// Has no effect if the Sequence has already started
	// "interval" - The interval duration
	public static appendInterval(s: saykit.Sequence, interval: number): saykit.Sequence {
		if (!SKSequenceSettingsExtensions._validateAddToSequence(s, null, true)) return s;
		saykit.Sequence.doAppendInterval(s, interval);
		return s;
	}
	// Adds the given interval to the beginning of the Sequence, pushing forward the other nested content.
	// Has no effect if the Sequence has already started
	// "interval" - The interval duration
	public static prependInterval(s: saykit.Sequence, interval: number): saykit.Sequence {
		if (!SKSequenceSettingsExtensions._validateAddToSequence(s, null, true)) return s;
		saykit.Sequence.doPrependInterval(s, interval);
		return s;
	}

	// Adds the given callback to the end of the Sequence.
	// Has no effect if the Sequence has already started
	// "callback" - The callback to append
	public static appendCallback(s: saykit.Sequence, callback: Function): saykit.Sequence {
		if (!SKSequenceSettingsExtensions._validateAddToSequence(s, null, true)) return s;
		if (callback == null) return s;

		saykit.Sequence.doInsertCallback(s, callback, s.duration);
		return s;
	}
	// Adds the given callback to the beginning of the Sequence, pushing forward the other nested content.
	// Has no effect if the Sequence has already started
	// "callback" - The callback to prepend
	public static prependCallback(s: saykit.Sequence, callback: Function): saykit.Sequence {
		if (!SKSequenceSettingsExtensions._validateAddToSequence(s, null, true)) return s;
		if (callback == null) return s;

		saykit.Sequence.doInsertCallback(s, callback, 0);
		return s;
	}
	// Inserts the given callback at the given time position in the Sequence,
	// automatically adding an interval if needed.
	// Has no effect if the Sequence has already started
	// "atPosition" - The time position where the callback will be placed
	// "callback" - The callback to insert
	public static insertCallback(s: saykit.Sequence, atPosition: number, callback: Function): saykit.Sequence {
		if (!SKSequenceSettingsExtensions._validateAddToSequence(s, null, true)) return s;
		if (callback == null) return s;

		saykit.Sequence.doInsertCallback(s, callback, atPosition);
		return s;
	}

	private static _validateAddToSequence(s: saykit.Sequence, t: saykit.Tween, ignoreTween: boolean = false): boolean {
		if (s == null) {
			cc.log("You can't add elements to a NULL Sequence");
			return false;
		}
		if (!s.active) {
			cc.log("You can't add elements to an inactive/killed Sequence");
			return false;
		}
		if (s.creationLocked) {
			cc.log('"The Sequence has started and is now locked, you can only elements to a Sequence before it starts"');
			return false;
		}
		if (!ignoreTween) {
			if (t == null) {
				cc.log("You can't add a NULL tween to a Sequence");
				return false;
			}
			if (!t.active) {
				cc.log("You can't add an inactive/killed tween to a Sequence", t);

				return false;
			}
			if (t.isSequenced) {
				cc.log("You can't add a tween that is already nested into a Sequence to another Sequence", t);

				return false;
			}
		}
		return true;
	}
}

saykit.SequenceSettingsExtensions = SKSequenceSettingsExtensions;
