/**
 *
 * Reldens - DoorObject
 *
 * This is an example object class, it extends from the AnimationsObject class and the define the specific parameters
 * for the animation.
 * The main point here is that this is just and example, and you could even create several animations for a single
 * object, and make the object run any kind of actions at any time. Here you can see a simple animation object but it
 * can be literally anything.
 *
 */

const AnimationObject = require('../../src/objects/animation-object');

class DoorObject extends AnimationObject
{

    constructor(props)
    {
        super(props);
        this.runOnHit = true;
        // assign extra public params:
        this.publicParamsObj = Object.assign(this.publicParamsObj, {
            enabled: true,
            frameStart: 3,
            frameEnd: 0,
            repeat: 0,
            hideOnComplete: false,
            autoStart: true
        });
    }

}

module.exports = DoorObject;
