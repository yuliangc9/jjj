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
        hero: {
            default: null,
            type: cc.Node,
        },
        rock: {
            default: null,
            type: cc.Node,
        },
        fireButton: {
            default: null,
            type: cc.Node,
        },
        enemy: {
            default: null,
            type: cc.Prefab,
        },
        playAgain: cc.Button,
    },

    wsReady: false,
    enemyFlight: null,

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.rock.getComponent('rock_ctrl').game = this;
        this.hero.getComponent('fly').game = this;
        this.fireButton.getComponent('fire_ctrl').game = this;

        this.playAgain.node.active = false;
        this.playAgain.node.on('click', function() {
            cc.director.loadScene('fight');
        }, this);
    },

    start () {
        self = this
        this._wsiSendText = new WebSocket("ws://192.168.99.123:12345/demo");
        this._wsiSendText.onopen = function(evt) {
            console.log("on open");
            self.wsReady = true;
        };
        
        this._wsiSendText.onmessage = function(evt) {
            console.log("response text msg: "+evt.data);

            var info = JSON.parse(evt.data);
            if (info.fire) {
                if (self.enemyFlight) {
                    self.enemyFlight.getComponent('fly').fire();
                }
                return;
            }

            if (info.leave) {
                self.win();
                return;
            }

            if (self.enemyFlight == null) {
                console.log("init enemy flight");
                self.enemyFlight = cc.instantiate(self.enemy);
                self.enemyFlight.getComponent('fly').game = self;
                self.node.addChild(self.enemyFlight);
            }

            self.enemyFlight.setPosition(info.heroX, info.heroY);
            self.enemyFlight.setRotation(info.heroRotation);

            // console.log(info);
            // console.log(self.hero.getPosition());
        };
        
        this._wsiSendText.onerror = function(evt) {
            console.log("on error", evt);
        };
        
        this._wsiSendText.onclose = function(evt) {
            console.log("on close", evt);
            self.wsReady = false;
        };
    },

    win: function() {
        if (this.enemyFlight == null) {
            return;
        }

        self.enemyFlight.destroy();
        self.enemyFlight = null;
    },

    lose: function() {
        if (this.wsReady) {
            this._wsiSendText.close();
        }
        this.playAgain.node.active = true;
    },

    update (dt) {
        if (!this.wsReady) {
            return;
        }

        var info = {
            heroX : this.hero.x,
            heroY : this.hero.y,
            heroRotation: this.hero.getRotation(),
        }
        this._wsiSendText.send(JSON.stringify(info));
    },

    notifyFire: function() {
        if (!this.wsReady) {
            return;
        }

        this._wsiSendText.send(JSON.stringify({fire:true}));
    }
});
