var res = {
  img_bg : "resources/back.png",
  img_enemy : "resources/unchi.png",
  img_cat : "resources/cat.png",
  img_coin : "resources/coin.png",
  se_bg : "resources/bgm.mp3",
  se_hitwall : "resources/hitWall.mp3",
  se_changeDir : "resources/changeDirection.mp3",
  se_getPoint : "resources/getPoint.mp3",
  se_dead : "resources/dead.mp3"
}

window.onload = function(){
    cc.game.onStart = function(){
        cc.view.adjustViewPort(true);
        cc.view.setDesignResolutionSize(640, 960, cc.ResolutionPolicy.SHOW_ALL);
        cc.view.resizeWithBrowserSize(true);
        //load resources
        var preload_res = [
          res.img_bg,
          res.img_enemy,
          res.img_cat,
          res.img_coin,
          res.se_bg,
          res.se_hitwall,
          res.se_changeDir,
          res.se_getPoint,
          res.se_dead
        ]
        cc.LoaderScene.preload(preload_res, function () {
            var MyScene = cc.Scene.extend({
                _cat:null,
                _enemies: [],
                _coins: [],
                _dx: 10,
                _score: 0,
                _scoreLabel: null,
                onEnter:function () {
                    this._super();
                    var size = cc.director.getWinSize();
                    // 背景の作成
                    var bg = cc.Sprite.create(res.img_bg);
                    bg.setPosition(size.width/2, size.height/2);
                    this.addChild(bg);
                    // ねこの作成
                    var sprite = cc.Sprite.create(res.img_cat);
                    sprite.setPosition(size.width / 2, size.height / 2);
                    sprite.setScale(0.25);
                    sprite.setFlippedX(true);
                    this.addChild(sprite, 0);
                    this._cat = sprite; // this._catにねこのSpriteを保持する
                    var label = cc.LabelTTF.create("Score: 0", "Arial", 40);
                    label.setPosition(80, size.height - 30);
                    label.setColor(cc.color("#0000ff"));
                    this.addChild(label, 1);
                    this._scoreLabel = label;
                    var self = this;
                    cc.audioEngine.playMusic(res.se_bg, true);
                    cc.eventManager.addListener(cc.EventListener.create({
                        event: cc.EventListener.TOUCH_ONE_BY_ONE,
                        swallowTouches: true,
                        onTouchBegan: function (touch, event) {
                          self.changeCatDirection();
                          return true;
                        }
                      })
                    ,this);
                    this.scheduleUpdate(); //updateを呼び出す
                    this.schedule(this.spawnEnemy, 0.5);
                    this.schedule(this.spawnCoin, 1.5);
                },
                // update関数
                update:function(dt){
                  this.moveCat();
                  var catRect = this._cat.getBoundingBox();
                  for(var i = 0; i < this._enemies.length; i++){
                    if (cc.rectIntersectsRect(catRect, this._enemies[i].getBoundingBox())) {
                        this.gameOver();
                    }
                  }
                  var i = this._coins.length;
                  while(i--){
                    if (cc.rectIntersectsRect(catRect, this._coins[i].getBoundingBox())) {
                      this._coins[i].removeFromParent();
                      this._coins.splice(i,1);
                      this._score++;
                      cc.audioEngine.playEffect(res.se_getPoint);
                      this.updateScore();
                    }
                  }
                },
                moveCat: function(){
                    var catX = this._cat.getPositionX();
                    var newX = catX + this._dx;
                    this._cat.setPositionX(newX);
                    var size = cc.director.getWinSize();
                    if (newX > size.width || newX < 0) {
                        cc.audioEngine.playEffect(res.se_hitwall);
                        this.changeCatDirection();
                    }
                },
                changeCatDirection: function(){
                  this._dx = -this._dx;
                  if (this._dx > 0) {
                    this._cat.setFlippedX(true);
                  }else{
                    this._cat.setFlippedX(false);
                  }
                  cc.audioEngine.playEffect(res.se_changeDir);
                },
                spawnEnemy: function(){
                  var size = cc.director.getWinSize();
                  var enemy = cc.Sprite.create(res.img_enemy);
                  var x = Math.floor( Math.random() * size.width ) ;
                  var fromTop = false;
                  if(x % 2 == 0){
                    fromTop = true;
                  }
                  var y = 0;
                  if(fromTop){
                    y = size.height;
                  }
                  enemy.setPosition(x , y);
                  enemy.setScale(0.1);
                  this.addChild(enemy, 0);
                  this._enemies.push(enemy)
                  var randDuration = Math.random() * 2;
                  var duration = 2 + randDuration;
                  var dirY = size.height;
                  if (fromTop) {
                    dirY = - size.height;
                  }
                  var move = new cc.MoveBy(duration, cc.p(0, dirY));
                  var remove = new cc.RemoveSelf(true);
                  enemy.runAction(new cc.Sequence([move, remove]))
                },
                spawnCoin: function(){
                  var size = cc.director.getWinSize();
                  var coin = cc.Sprite.create(res.img_coin);
                  var x = Math.floor( Math.random() * size.width ) ;
                  var fromTop = false;
                  if(x % 2 == 0){
                    fromTop = true;
                  }
                  var y = 0;
                  if(fromTop){
                    y = size.height;
                  }
                  coin.setPosition(x , y);
                  coin.setScale(0.1);
                  this.addChild(coin, 0);
                  this._coins.push(coin)
                  var randDuration = Math.random() * 4;
                  var duration = 5 + randDuration;
                  var dirY = size.height;
                  if (fromTop) {
                    dirY = - size.height;
                  }
                  var move = new cc.MoveBy(duration, cc.p(0, dirY));
                  var remove = new cc.RemoveSelf(true);
                  coin.runAction(new cc.Sequence([move, remove]))
                },
                updateScore: function(){
                  this._scoreLabel.setString("Score: " + this._score);
                },
                gameOver: function(){
                  cc.audioEngine.playEffect(res.se_dead);
                  var size = cc.director.getWinSize();
                  var label = cc.LabelTTF.create("GameOver\nScore is : " + this._score, "Arial", 40);
                  label.setPosition(size.width/2, size.height/2);
                  label.setColor(cc.color("#ff0000"));
                  this.addChild(label, 1);
                  var button = new cc.MenuItemFont("Restart",this.restartGame,this);
                  button.setPosition(size.width/2, size.height/2 - 200);
                  button.setColor(cc.color("#000000"));
                  var menu = new cc.Menu(button);
                  menu.x = 0;
                  menu.y = 0;
                  this.addChild(menu);
                  this.unscheduleAllCallbacks();
                  this.stopAllEnemies();
                  this.stopAllCoins();
                },
                restartGame: function(){
                  this._coins.length = 0;
                  this._enemies.length = 0;
                  this._score = 0;
                  var scene = new MyScene();
                  cc.director.runScene(scene);
                },
                stopAllEnemies: function(){
                  for(var i = 0; i < this._enemies.length; i++){
                    this._enemies[i].stopAllActions();
                  }
                },
                stopAllCoins: function(){
                  for(var i = 0; i < this._coins.length; i++){
                    this._coins[i].stopAllActions();
                  }
                }
            });
            cc.director.runScene(new MyScene());
        }, this);
    };
    cc.game.run("gameCanvas");
};
