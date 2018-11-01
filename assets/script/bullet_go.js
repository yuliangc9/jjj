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
        power: 30,

        bingoAudio: {
            default: null,
            type: cc.AudioClip
        },
    },

    fromFly: null,
    finish: false,

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    onFinish () {
        this.node.destroy();
    },

    onCollisionEnter (other, self) {
        if (this.finish) {
            console.log("bullet bingo finish");
            this.node.stopAllActions();
            return;
        }

        if (other.node.name == "flight") {
            return;
        }

        this.finish = true;

        var shotedAnim = this.node.getComponent(cc.Animation);
        shotedAnim.play("bullet_boom");
    },

    update (dt) {
        return;
        if (this.finish) {
            console.log("bullet bingo finish");
            this.node.stopAllActions();
            return;
        }

        if (this.fromFly.role == "enemy" && this.bingo(this.game.hero)) {
            this.finish = true;
            this.game.hero.getComponent('fly').getShot(this.power);

            var shotedAnim = this.node.getComponent(cc.Animation);
            shotedAnim.play("bullet_boom");
            return;
        }

        if (this.fromFly.role == "hero" && this.game.enemyFlight && this.bingo(this.game.enemyFlight)) {
            console.log("shot enemy");
            this.finish = true;
            var shotedAnim = this.game.enemyFlight.getComponent(cc.Animation);
            shotedAnim.play("shoted");

            var shotedAnim = this.node.getComponent(cc.Animation);
            shotedAnim.play("bullet_boom");
            return;
        }
    },

    bingo: function(f) {
        var distance = Math.sqrt((this.node.x - f.x)*(this.node.x - f.x) + (this.node.y - f.y)*(this.node.y - f.y));
        if (distance < 30) {
            cc.audioEngine.play(this.bingoAudio, false, 1);

            return true;
        }
        return false;
    },
});
