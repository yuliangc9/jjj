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

        shotAudio: {
            default: null,
            type: cc.AudioClip
        },

        healthShow: {
            default: null,
            type: cc.Node,
        },

        bulletShow: {
            default: null,
            type: cc.Node,
        },

        nameShow: {
            default: null,
            type: cc.Label,
        },

        speed: 0,
        turnSpeed: 0,
        targetRotation: 0,
        initRotation: 0,

        fireDistance: 0,
        bulletLoad: 0,
        bulletC: 5,
        bulletL: 5,
        bulletSpeed: 0,

        role: "",

        health: 0,

        loadFinish: true,
        _finish: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.rotation = this.initRotation;

        if (this.role == "hero") {
            this.healthShow.width = this.health;
            this.nameShow.string = GlobalConfig.heroName;
        }
        
        this.bulletL = this.bulletC;
        // this.schedule(function() {
        //     this.fire();
        // }, 1);
    },

    start () {
    },

    getShot: function(power) {
        this.health -= power;

        var shotedAnim = this.node.getComponent(cc.Animation);
        shotedAnim.play("shoted");

        if (this.health <= 0) {
            this.lose();
            return;
        }

        this.healthShow.width = this.health;
        this.game.notifyHealth(this.health);
    },

    fire: function() {
        if (!this.loadFinish) {
            return;
        }

        if (this.game.enemyFlight != null && this.role == "hero") {
            if ((this.game.enemyFlight.x - this.node.x)*(this.game.enemyFlight.x - this.node.x) + 
                (this.game.enemyFlight.y - this.node.y)*(this.game.enemyFlight.y - this.node.y) < 100*100) {
                    console.log("ignore file2");
                    return;
                }
        }

        this.bulletShow.width -= 250/this.bulletC;

        this.bulletL--;
        console.log(this.role, "left bullet", this.bulletL);
        if (this.bulletL == 0) {
            this.loadFinish = false;
            this.bulletL = this.bulletC;

            var shotedAnim = this.bulletShow.getComponent(cc.Animation);
            shotedAnim.play("bullet_reload");

            this.scheduleOnce(function() {
                this.loadFinish = true
            }, this.bulletLoad);
        }

        cc.audioEngine.play(this.shotAudio, false, 0.5);

        var b = cc.instantiate(this.bulletPrefab);
        b.getComponent('bullet_go').game = this.game;
        b.getComponent('bullet_go').fromFly = this;

        this.game.node.addChild(b);

        b.setPosition(this.node.getPosition());
        b.setRotation(this.node.getRotation());

        console.log("plane fire!", this.role);
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
        if (this.role == "enemy" || this._finish) {
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

        if (this.node.x > this.game.node.width/2) {
            this.node.x = this.game.node.width/2;
            // this.health = 0;
            // this.lose();
        }
        if (this.node.x < -this.game.node.width/2) {
            this.node.x = -this.game.node.width/2;
            // this.health = 0;
            // this.lose();
        }
        if (this.node.y > this.game.node.height/2) {
            this.node.y = this.game.node.height/2;
            // this.health = 0;
            // this.lose();
        }
        if (this.node.y < -this.game.node.height/2) {
            this.node.y = -this.game.node.height/2;
            // this.health = 0;
            // this.lose();
        }
    },

    lose: function() {
        this._finish = true;

        this.game.lose();
    },

    disappear: function() {
        this.node.destroy();
    }
});
