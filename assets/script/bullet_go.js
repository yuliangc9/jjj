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
    },

    fromFly: null,
    finish: false,

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    update (dt) {
        if (this.finish) {
            return;
        }

        if (this.fromFly.role != "hero" && this.bingo(this.game.hero)) {
            this.finish = true;
            this.game.lose();
            return;
        }
        if (this.fromFly.role != "enemy" && this.bingo(this.game.enemy)) {
            this.finish = true;
            this.game.lose();
            return;
        }
    },

    bingo: function(f) {
        var distance = Math.sqrt((this.node.x - f.x)*(this.node.x - f.x) + (this.node.y - f.y)*(this.node.y - f.y));
        if (distance < 70) {
            return true;
        }
        return false;
    },
});
