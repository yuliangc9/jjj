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
        forbiddenShow: {
            default: null,
            type: cc.Node,
        },
        bgAudio: {
            default: null,
            type: cc.AudioClip
        },
        heroInfo: {
            default: null,
            type: cc.Node,
        },
        enemyInfo: {
            default: null,
            type: cc.Node,
        },
        enemyName: {
            default: null,
            type: cc.Label,
        },
        rock: {
            default: null,
            type: cc.Node,
        },
        fireButton: {
            default: null,
            type: cc.Node,
        },
        acButton: {
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
    isMatch: false,
    enemyFlight: null,

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.rock.getComponent('rock_ctrl').game = this;
        this.hero.getComponent('fly').game = this;
        this.fireButton.getComponent('fire_ctrl').game = this;
        this.acButton.getComponent('ac').game = this;

        this.playAgain.node.active = false;
        this.playAgain.node.on('click', function() {
            cc.director.loadScene('fight');
        }, this);

        this.enemyInfo.active = false;
        this.forbiddenShow.active = false;

        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },

    start() {
        this.connectServer();
        this.bgMusicID = cc.audioEngine.play(this.bgAudio, true, 0.8);
    },

    connectServer: function() {
        var self = this

        if (this.wsReady) {
            this._wsiSendText.close();
        }

        this.wsReady = false;
        this.isMatch = false;
        
        this._wsiSendText = new WebSocket("ws://47.105.151.1:8080/fight");
        this._wsiSendText.onopen = function(evt) {
            console.log("on open");
            self.wsReady = true;
            self._wsiSendText.send(JSON.stringify({name:GlobalConfig.heroName, initHealth:self.hero.getComponent('fly').health}));
            console.log("send id", JSON.stringify({name:GlobalConfig.heroName, initHealth:self.hero.getComponent('fly').health}));
        };

        this._wsiSendText.o
        
        this._wsiSendText.onmessage = function(evt) {
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

            if (info.begin) {
                console.log(evt.data);
                console.log("match!", self.enemyInfo.getChildByName("enemy_name"));
                self.isMatch = true;
                self.enemyInfo.active = true;
                self.enemyInfo.getChildByName("enemy_life_record").width = info.initHealth;
                self.enemyInfo.getChildByName("bullet_record").width = 251;
                if (info.name) self.enemyName.string = info.name;

                //TODO: fix this const number
                self.hero.getComponent('fly').bulletL = self.hero.getComponent('fly').bulletC;
                self.hero.getComponent('fly').bulletShow.width = 251;
                self.hero.getComponent('fly').health = 300;
                self.hero.getComponent('fly').oil = 240;
                self.hero.getComponent('fly').healthShow.width = 300;

                return;
            }

            if (info.health) {
                console.log("get enemy health", info.health);
                self.enemyInfo.getChildByName("enemy_life_record").width = info.health;
                return;
            }

            if (self.enemyFlight == null) {
                console.log("init enemy flight");
                self.enemyFlight = cc.instantiate(self.enemy);
                self.enemyFlight.getComponent('fly').game = self;
                self.enemyFlight.getComponent('fly').bulletShow = self.enemyInfo.getChildByName("bullet_record");
                self.node.addChild(self.enemyFlight);
            }

            self.enemyFlight.setPosition(info.heroX, info.heroY);
            self.enemyFlight.setRotation(info.heroRotation);
            self.enemyInfo.getChildByName("oil_record").width = info.oil;

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
        console.log("on win");

        if (this.enemyFlight != null) {
            var shotedAnim = this.enemyFlight.getComponent(cc.Animation);
            shotedAnim.play("fail_boom");

            this.enemyFlight = null;
        }

        this.connectServer();

        this.enemyInfo.active = false;
    },

    lose: function() {
        console.log("on lose");
        if (this.wsReady) {
            this._wsiSendText.close();
        }

        // this.hero.destroy();
        this.playAgain.node.active = true;

        if (this.bgMusicID != null) {
            cc.audioEngine.stop(this.bgMusicID);
        }
    },

    update (dt) {
        if (!this.wsReady || !this.isMatch) {
            return;
        }

        var info = {
            heroX : this.hero.x,
            heroY : this.hero.y,
            oil : this.hero.getComponent("fly").oil,
            heroRotation: this.hero.getRotation(),
        }
        this._wsiSendText.send(JSON.stringify(info));

        if (this.enemyFlight != null) {
            if ((this.enemyFlight.x - this.hero.x)*(this.enemyFlight.x - this.hero.x) + 
                (this.enemyFlight.y - this.hero.y)*(this.enemyFlight.y - this.hero.y) < 70*70) {
                    this.forbiddenShow.active = true;
            } else {
                this.forbiddenShow.active = false;
            }
        }
    },

    notifyFire: function() {
        console.log("notify fire");

        if (!this.wsReady || !this.isMatch) {
            return;
        }

        console.log("notify fire2");
        this._wsiSendText.send(JSON.stringify({fire:true}));
    },

    notifyHealth: function(h) {
        if (!this.wsReady || !this.isMatch) {
            return;
        }

        this._wsiSendText.send(JSON.stringify({health:h}));
    },
});
