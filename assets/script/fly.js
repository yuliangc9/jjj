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
        bulletPrefab: {
            default: null,
            type: cc.Prefab,
        },
        speed: 0,
        turnSpeed: 0,
        targetRotation: 0,
        initRotation: 0,

        fireDistance: 0,
        bulletSpeed: 0,

        role: "",
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.rotation = this.initRotation;
        
        // this.schedule(function() {
        //     this.fire();
        // }, 1);
    },

    start () {
    },

    fire: function() {
        var b = cc.instantiate(this.bulletPrefab);
        b.getComponent('bullet_go').game = this.game;
        b.getComponent('bullet_go').role = this.role;

        this.game.node.addChild(b);

        b.setPosition(this.node.getPosition());
        b.setRotation(this.node.getRotation());

        if (this.role == "hero") {
            this.game.notifyFire();
        }

        var xd = Math.cos(Math.PI/180*this.node.getRotation()) * this.fireDistance;
        var yd = -Math.sin(Math.PI/180*this.node.getRotation()) * this.fireDistance;
        var duration = this.fireDistance/this.bulletSpeed;
        b.runAction(cc.sequence(cc.moveBy(duration, xd, yd), 
            cc.callFunc(function(bullet) {
                bullet.destroy();
            }, this, b)));
    },

    update (dt) {
        if (this.role == "enemy") {
            return;
        }

        if (this.node.rotation != this.targetRotation) {
            var direct = 1;
            if (this.targetRotation - this.node.rotation > 180) {
                direct = -1;
            }
            if (this.targetRotation < this.node.rotation && this.node.rotation - this.targetRotation < 180) {
                direct = -1;
            }

            var tmpRotation = this.node.rotation + direct * dt * this.turnSpeed;
            if ((tmpRotation - this.targetRotation) * (this.node.rotation - this.targetRotation) < 0) {
                tmpRotation = this.targetRotation;
            } else {
                if (tmpRotation > 360) {
                    tmpRotation %= 360;
                }
                while (tmpRotation < 0) {
                    tmpRotation += 360;
                }
            }

            this.node.rotation = tmpRotation;
        }

        this.node.x += Math.cos(2 * Math.PI / 360 * this.node.rotation) * this.speed * dt;
        this.node.y -= Math.sin(2 * Math.PI / 360 * this.node.rotation) * this.speed * dt;

        if (this.node.x > cc.winSize.width/2) {
            this.node.x = cc.winSize.width/2;
        }
        if (this.node.x < -cc.winSize.width/2) {
            this.node.x = -cc.winSize.width/2;
        }
        if (this.node.y > cc.winSize.height/2) {
            this.node.y = cc.winSize.height/2;
        }
        if (this.node.y < -cc.winSize.height/2) {
            this.node.y = -cc.winSize.height/2;
        }
    },
});
