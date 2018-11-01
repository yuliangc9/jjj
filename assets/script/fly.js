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

        collisionAudio: {
            default: null,
            type: cc.AudioClip
        },

        shotAudio: {
            default: null,
            type: cc.AudioClip
        },

        healthShow: {
            default: null,
            type: cc.Node,
        },

        oilShow: {
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
        acSpeed: 0,
        normalSpeed: 0,
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
        oil: 0,
        maxOil: 0,

        loadFinish: true,
        _finish: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.rotation = this.initRotation;

        if (this.role == "hero") {
            this.healthShow.width = this.health;
            this.nameShow.string = GlobalConfig.heroName;
            this.oilShow.width = this.oil;
        }
        
        this.bulletL = this.bulletC;
        this.speed = this.normalSpeed;
        // this.schedule(function() {
        //     this.fire();
        // }, 1);
    },

    start () {
        //this.node.getComponent(cc.Sprite).SpriteFrame = this.game.planePic[0];
        //this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame("https://livecloud-dev.oss-cn-beijing.aliyuncs.com/plane.png" )
    },

    getShot: function(power) {
        console.log("get shoted!", power, this.health);
        this.health -= power;
        if (this.health < 0) this.health = 0;

        var shotedAnim = this.node.getComponent(cc.Animation);
        shotedAnim.play("shoted");

        this.healthShow.width = this.health;

        if (this.health <= 0) {
            this.lose();
            return;
        }

        this.game.notifyHealth(this.health);
    },

    acStart: function() {
        this.speed = this.acSpeed;
    },

    acEnd: function() {
        this.speed = this.normalSpeed;
    },

    fire: function() {
        if (!this.loadFinish) {
            return;
        }

        if (this.game.enemyFlight != null && this.role == "hero") {
            if ((this.game.enemyFlight.x - this.node.x)*(this.game.enemyFlight.x - this.node.x) + 
                (this.game.enemyFlight.y - this.node.y)*(this.game.enemyFlight.y - this.node.y) < 70*70) {
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
        b.zIndex = 0;

        var bulletRotation = this.node.getRotation() + this.adaptBulletRotation();

        b.setPosition(this.node.getPosition());
        b.setRotation(bulletRotation);

        console.log("plane fire!", this.role);
        if (this.role == "hero") {
            this.game.notifyFire();
        }

        var xd = Math.cos(Math.PI/180*bulletRotation) * this.fireDistance;
        var yd = -Math.sin(Math.PI/180*bulletRotation) * this.fireDistance;

        var duration = this.fireDistance/this.bulletSpeed;
        b.runAction(cc.sequence(cc.moveBy(duration, xd, yd), 
            cc.callFunc(function(bullet) {
                bullet.destroy();
            }, this, b)));
    },

    onCollisionEnter (other, self) {
        console.log('on fly collision');

        if (this._finish) {
            return;
        }

        if (other.node.name == "oil_station") {
            this.oil = this.maxOil;
            return;
        }

        if (other.node.name == "bullet" && this.role == "enemy") {
            this.health -= 100;
            if (this.health < 0) this.health = 0;
    
            var shotedAnim = this.node.getComponent(cc.Animation);
            shotedAnim.play("shoted");
    
            if (this.health <= 0) {
                this.lose();
                this.game.addScore();
                return;
            }

            return;
        }

        if (other.node.name == "enemy" && this.role == "hero" && other.node.getComponent("fly").health > 0) {
            this.lose();
            this.game.lose();
            return;
        }

        if (other.node.name == "flight" && this.role == "enemy") {
            this.lose();
            this.game.addScore();
            return;
        }

        if (other.node.name == "protectArea" && this.role == "enemy") {
            this.lose();
            this.game.lose();
            return;
        }

        return;

        if (this.role == "enemy" || this.isCollision == true) {
            return;
        }

        cc.audioEngine.play(this.collisionAudio, false, 1);

        this.isCollision = true;

        var xd = (this.node.x - this.game.enemyFlight.x) * 2;
        var yd = (this.node.y - this.game.enemyFlight.y) * 2;

        if (this.node.x + xd > this.game.node.width/2) {
            xd = this.game.node.width/2 - this.node.x;
        }
        if (this.node.x + xd < -this.game.node.width/2) {
            xd = -this.game.node.width/2 - this.node.x;
        }
        if (this.node.y + yd > this.game.node.height/2) {
            yd = this.game.node.height/2 - this.node.y;
        }
        if (this.node.y + yd < -this.game.node.height/2) {
            yd = -this.game.node.height/2 - this.node.y;
        }

        this.getShot(10);

        this.node.runAction(cc.sequence(cc.spawn(cc.moveBy(1, xd, yd).easing(cc.easeCubicActionOut()), cc.rotateBy(1, 180)), 
        cc.callFunc(function() {
            this.isCollision = false;
        }, this)));
    },

    updateOil () {
        if (this.oil <= 0) {
            return;
        }

        if (this.lastUpdateOilTime == null) {
            this.lastUpdateOilTime = new Date().getTime();
            return;
        }

        var nowTime = new Date().getTime();

        this.oil -= (nowTime - this.lastUpdateOilTime) * this.speed * 0.00002;
        this.oilShow.width = this.oil;
        this.lastUpdateOilTime = nowTime;

        if (this.oil < 40) {
            this.game.oilWarnShow.active = true;
        } else {
            this.game.oilWarnShow.active = false;
        }

        if (this.oil <= 0) {
            this.lose();
        }
    },

    update (dt) {
        if (this.role == "enemy" || this._finish) {
            return;
        }

        this.updateOil();

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

    adaptBulletRotation: function() {
        var targetX;
        var targetY;

        if (this.game.enemyFlight == null) {
            return 0;
        }

        if (this.role == "hero") {
            targetX = this.game.enemyFlight.x;
            targetY = this.game.enemyFlight.y;
        } else {
            targetX = this.game.hero.x;
            targetY = this.game.hero.y;
        }

        var deltaX = targetX - this.node.x;
        var deltaY = targetY - this.node.y;

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

        var deltaR = targetRotation - this.node.getRotation();

        if (deltaR < 45 && deltaR > -45) {
            return deltaR;
        }

        return 0;
    },

    lose: function() {
        this._finish = true;

        this.node.stopAllActions()

        var shotedAnim = this.node.getComponent(cc.Animation);

        if (this.role == "enemy") {
            shotedAnim.play("fail_boom", 0.2);
        }
        if (this.role == "hero") {
            shotedAnim.play("fail_boom");
        }

        //this.game.lose();
    },

    disappear: function() {
        this.node.destroy();
    }
});
