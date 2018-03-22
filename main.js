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
        //リソースを読み込み
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
                    sprite.setPosition(size.width/2, size.height/2);
                    sprite.setScale(0.25);
                    sprite.setFlippedX(true);
                    this.addChild(sprite, 0);
                    // this._catにねこのSpriteを保持する
                    this._cat = sprite;
                    // ゲーム中のスコア表示の作成
                    var label = cc.LabelTTF.create("Score: 0", "Arial", 40);
                    label.setPosition(80, size.height - 30);
                    label.setColor(cc.color("#000080"));
                    this.addChild(label, 1);
                    this._scoreLabel = label;
                    var self = this;
                    // BGMの設定
                    cc.audioEngine.playMusic(res.se_bg, true);
                    cc.eventManager.addListener(cc.EventListener.create({
                        event: cc.EventListener.TOUCH_ONE_BY_ONE,
                        swallowTouches: true,
                        // 画面にタッチしたら方向転換
                        onTouchBegan: function (touch, event) {
                          self.changeCatDirection();
                          return true;
                        }
                      })
                    ,this);
                    // updateを呼び出す
                    this.scheduleUpdate();
                    this.schedule(this.spawnEnemy, 1);
                    this.schedule(this.spawnCoin, 2);
                },
                // update関数
                update:function(dt){
                  this.moveCat();
                  // 衝突判定
                  var catRect = this._cat.getBoundingBox();
                  // 敵と衝突しているか
                  for(var i = 0; i < this._enemies.length; i++){
                    if (cc.rectIntersectsRect(catRect, this._enemies[i].getBoundingBox())) {
                        this.gameOver();
                    }
                  }
                  // コインと衝突しているか
                  var i = this._coins.length;
                  while(i--){
                    if (cc.rectIntersectsRect(catRect, this._coins[i].getBoundingBox())) {
                      this._coins[i].removeFromParent();
                      this._coins.splice(i,1);
                      this._score++;
                      // 効果音設定（getPoint）
                      cc.audioEngine.playEffect(res.se_getPoint);
                      this.updateScore();
                    }
                  }
                },
                // moveCat関数
                moveCat: function(){
                  // 毎フレーム呼び出される
                    var catX = this._cat.getPositionX();
                    // 新しいX座標を計算
                    var newX = catX + this._dx;
                    this._cat.setPositionX(newX);
                    var size = cc.director.getWinSize();
                    // 画面の外に行かないよう設定
                    if (newX > size.width || newX < 0) {
                        // 効果音設定（hitwall）
                        cc.audioEngine.playEffect(res.se_hitwall);
                        // 方向転換
                        this.changeCatDirection();
                    }
                },
                // changeCatDirection関数
                // ねこの向きを変える
                changeCatDirection: function(){
                  this._dx = -this._dx;
                  // ねこの画像を反転させる
                  if (this._dx > 0) {
                    this._cat.setFlippedX(true);
                  }else{
                    this._cat.setFlippedX(false);
                  }
                  // 効果音設定（changeDir）
                  cc.audioEngine.playEffect(res.se_changeDir);
                },
                // spawnEnemy関数
                spawnEnemy: function(){
                  var size = cc.director.getWinSize();
                  // 敵を作成
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
                  // 敵の出現時の座標
                  enemy.setPosition(x , y);
                  enemy.setScale(0.1);
                  this.addChild(enemy, 0);
                  // _enemiesという配列に追加して保持する
                  this._enemies.push(enemy)
                  var randDuration = Math.random() * 2;
                  var duration = 2 + randDuration;
                  var dirY = size.height;
                  if (fromTop) {
                    dirY = -size.height;
                  }
                  // moveByというアクションを生成
                  var move = new cc.MoveBy(duration, cc.p(0, dirY));
                  // 自身を削除するアクションを生成
                  var remove = new cc.RemoveSelf(true);
                  // 各アクションを順番に実行するアクションを設定し、敵に実行させる
                  enemy.runAction(new cc.Sequence([move, remove]))
                },
                // spawnCoin関数
                spawnCoin: function(){
                  var size = cc.director.getWinSize();
                  // コインを作成
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
                  // コインの出現時の座標
                  coin.setPosition(x , y);
                  coin.setScale(0.1);
                  this.addChild(coin, 0);
                  // _coinsという配列に追加して保持する
                  this._coins.push(coin)
                  var randDuration = Math.random() * 4;
                  var duration = 5 + randDuration;
                  var dirY = size.height;
                  if (fromTop) {
                    dirY = -size.height;
                  }
                  // moveByというアクションを生成
                  var move = new cc.MoveBy(duration, cc.p(0, dirY));
                  // 自身を削除するアクションを生成
                  var remove = new cc.RemoveSelf(true);
                  // 各アクションを順番に実行するアクションを設定し、コインに実行させる
                  coin.runAction(new cc.Sequence([move, remove]))
                },
                // updateScore関数
                updateScore: function(){
                  this._scoreLabel.setString("Score: " + this._score);
                },
                // gameOver関数
                gameOver: function(){
                  // 効果音設定（dead）
                  cc.audioEngine.playEffect(res.se_dead);
                  var size = cc.director.getWinSize();
                  // スコア（結果）の作成
                  var label = cc.LabelTTF.create("GameOver\nScore is : " + this._score, "Arial", 40);
                  label.setPosition(size.width/2, size.height/2);
                  label.setColor(cc.color("#dc143c"));
                  this.addChild(label, 1);
                  var button = new cc.MenuItemFont("Restart",this.restartGame,this);
                  button.setPosition(size.width/2, size.height/2 - 200);
                  button.setColor(cc.color("#00008b"));
                  var menu = new cc.Menu(button);
                  menu.x = 0;
                  menu.y = 0;
                  this.addChild(menu);
                  this.unscheduleAllCallbacks();
                  this.stopAllEnemies();
                  this.stopAllCoins();
                },
                // restartGame関数
                restartGame: function(){
                  this._coins.length = 0;
                  this._enemies.length = 0;
                  this._score = 0;
                  var scene = new MyScene();
                  cc.director.runScene(scene);
                },
                // stopAllEnemies関数
                stopAllEnemies: function(){
                  for(var i = 0; i < this._enemies.length; i++){
                    this._enemies[i].stopAllActions();
                  }
                },
                // stopAllCoins関数
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
