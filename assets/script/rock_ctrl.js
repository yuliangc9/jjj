// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        _isMoving: false,
    },

    // LIFE-CYCLE CALLBACKS:

    beginMove: function(event) {
        this.node.opacity = 255;
        this._isMoving = true;
    },

    moving: function(event) {
        this.initX = 100 + (this.node.width/2) - (this.game.node.width/2);
        this.initY = 100 + (this.node.height/2) - (this.game.node.height/2);

        if (!this._isMoving) {
            return;
        }

        var tmpX = this.node.x + event.getDelta().x;
        var tmpY = this.node.y + event.getDelta().y;

        // var tmpDistance = Math.sqrt((tmpX - this.initX)*(tmpX - this.initX) + (tmpY - this.initY)*(tmpY - this.initY));
        // if (tmpDistance > 50) {
        //     tmpX = 50/tmpDistance * (tmpX - this.initX) + this.initX;
        //     tmpY = 50/tmpDistance * (tmpY - this.initY) + this.initY;
        // }

        this.node.x = tmpX;
        this.node.y = tmpY;

        var deltaX = this.node.x - this.initX;
        var deltaY = this.node.y - this.initY;
        // var deltaX = event.getDelta().x;
        // var deltaY = event.getDelta().y;

        var targetRotation = 0;

        if (deltaY == 0 && deltaX == 0) {
            return;
        }

        if (deltaY == 0) {
            if (deltaX > 0) targetRotation = 0;
            if (deltaX < 0) targetRotation = 180;
        } else {
            targetRotation = Math.atan(deltaX/deltaY) * 180 / Math.PI;
            if (deltaY < 0) targetRotation += 90;
            if (deltaY > 0) targetRotation += 270;
        }

        this.game.hero.getComponent('fly').targetRotation = targetRotation;
    },

    endMove: function(event) {
        console.log("on rock end");
        this.node.opacity = 180;
        this.initX = 100 + (this.node.width/2) - (this.game.node.width/2);
        this.initY = 100 + (this.node.height/2) - (this.game.node.height/2);

        this._isMoving = false;

        this.node.x = this.initX;
        this.node.y = this.initY;
    },

    onLoad () {
        this.initX = this.node.x;
        this.initY = this.node.y;

        this.node.on(cc.Node.EventType.TOUCH_START, this.beginMove, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.moving, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.endMove, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.endMove, this);
    },

    start () {

    },

    // update (dt) {},
});
