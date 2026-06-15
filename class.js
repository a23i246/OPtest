
// Player クラス
class Player {
  constructor(x, y) { //初期位置
    this.x = x;
    this.y = y;
    this.size = 40;//見た目の大きさ
    this.hitRadius = 13;//当たり判定の大きさ
    this.speed = 7;//1フレーム当たりの移動距離
    this.hp = 3;
    this.maxHp = 3;
  }

   update() { //状態を毎フレーム更新
　　//WASDで移動
    if (keyIsDown(87)) this.y -= this.speed; // W
    if (keyIsDown(83)) this.y += this.speed; // S
    if (keyIsDown(65)) this.x -= this.speed; // A
    if (keyIsDown(68)) this.x += this.speed; // D

    this.x = constrain(this.x, 0, width - this.size);
    this.y = constrain(this.y, 0, height - this.size); // x,y座標が画面外に出ないように

//  ブースター煙（後方）
  if (this.hp < this.maxHp) { //hpがmaxではない場合
    let bx = this.x + this.size * 0.2;
    let by = this.y + this.size * 0.5;

    smokes.push(new Smoke(bx, by));
  }
  }

  draw() {
  // ===== ブースター炎 =====
  noStroke();
  fill(255, 150, 0, 180);
  ellipse(
    this.x - 8,
    this.y + this.size / 2,
    random(12, 18),
    random(6, 12) //横、縦幅をランダムにして、少し揺れるようにする
  );

  // ===== 機体 =====
  fill(0, 200, 255);
  triangle(  
    this.x,
    this.y + this.size / 2,
    this.x + this.size,
    this.y,
    this.x + this.size,
    this.y + this.size
  );
}

  hit(enemy) { //敵に当たった場合
    return (
      dist(
        this.x + this.size / 2,
        this.y + this.size / 2,
        enemy.x + enemy.size / 2,
        enemy.y + enemy.size / 2
      ) < this.hitRadius + enemy.size / 2
    );
  }
}

class Smoke {
  constructor(x, y) {
    this.x = x + random(-3, 3);
    this.y = y;
    this.vx = random(-0.5, 0.5);
    this.vy = random(1, 3);
    this.alpha = 180;
    this.size = random(6, 10);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5; //少しづつ薄く
    this.size += 0.2;
  }

  draw() {
    noStroke();
    fill(200, this.alpha);
    ellipse(this.x, this.y, this.size);
  }

  isDead() { 
    return this.alpha <= 0;
  }
}


//背景の星々
class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.speed = random(1, 4); //星の大きさや速度などをランダムにする  
  }

  update() {
    this.x -= this.speed;
    if (this.x < 0) { //左端に達したら
      this.x = width; //右端に戻す
      this.y = random(height); //y座標をランダムにして再出現
    }
  }

  draw() {
    noStroke();
    fill(255, 255, 255, 200);
    circle(this.x, this.y, this.size);
  }
}


// Bullet クラス(プレイヤーの発射する弾)
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 8;
  }

  update() {
    this.x += this.speed; //弾が右方向へ進む
  }

  draw() {
    fill(255, 255, 0);
    circle(this.x, this.y, 6);
  }

  offscreen() {
    return this.x > width;
  }
}


// Enemy クラス


// Enemy クラス（追尾型）
class Enemy {
  constructor() {
    this.size = 20;
    this.x = width;
    this.y = random(20, height - 20);
    this.speed = random(1.5, 2.5); // 個体差(速度)

　　this.scoreValue = 100; // ★この敵のポイント数
  }



  update(player) {
    // プレイヤーとの差
    let dx =
      (player.x + player.size / 2) -
      (this.x + this.size / 2);

    let dy =
      (player.y + player.size / 2) -
      (this.y + this.size / 2);

    let d = sqrt(dx * dx + dy * dy);

    
    if (d !== 0) { //距離が0でないなら、近づいてくる
      this.x += (dx / d) * this.speed;
      this.y += (dy / d) * this.speed;
    }
  }

  draw() {
    fill(255, 80, 80);
    rect(this.x, this.y, this.size, this.size);
  }

  offscreen() {
    return (
      this.x < -this.size ||
      this.x > width + this.size ||
      this.y < -this.size ||
      this.y > height + this.size
    );
  }
}


// FastEnemy クラス（直進・高速）
class FastEnemy {
  constructor() {
    this.size = 15;
    this.x = width;
    this.y = random(0, height);
    this.speed = 2;

　　this.scoreValue = 100; // この敵のポイント数
  }

  update() {
    this.x -= this.speed;
  }

  draw() {
    fill(255, 200, 0);
    rect(this.x, this.y, this.size, this.size);
  }

  offscreen() {
    return this.x < -this.size;
  }
}


class Boss2 {
  constructor() {
    this.x = width + 200; //画面右側から出現
    this.y = height / 2; //最初の位置

　　this.baseY = height / 2;
　　this.moveTimer = 0;　//移動タイマー


　　this.shootInterval = 60; // 60フレームごとに攻撃
　　this.shootTimer = 0;



    this.scale = 0.4;   // ← 見た目サイズ
    this.hp = 3;
    this.speed = 1.5;

    this.hitRadius = 80; // ← 当たり判定
  }

 update() {
  // 画面に入ってくる
  if (this.x > width - 150) {
    this.x -= this.speed;
  } else {

    // 上下移動
    this.moveTimer += 0.03;
    this.y = this.baseY + sin(this.moveTimer) * 80;

    // 攻撃タイマー
    this.shootTimer++;
    if (this.shootTimer >= this.shootInterval) {
      this.shoot();
      this.shootTimer = 0;
    }
  }
}


//弾の処理
　shoot() {
  　bossBullets.push(
    new BossBullet(
      this.x - 20,
      this.y
    )
  );
}

  draw() {
    // 本体（アンパン）
    ANPAN(this.x, this.y, this.scale);

    // HPバー
    let barW = 100;
    let hpW = map(this.hp, 0, 50, 0, barW);

    noStroke();
    fill(255, 0, 0);
    rect(this.x - barW / 2, this.y - 120, hpW, 8);
  }
//ボスに弾が当たった時の処理
  hit(bullet) {
    return dist(
      this.x,
      this.y,
      bullet.x,
      bullet.y
    ) < this.hitRadius;
  }
}

　class BossBullet {
  constructor(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 4;
      this.size = 10;
  }

    update() {
      this.x -= this.speed;
  }

  draw() {
    fill(255, 80, 80);
    ellipse(this.x, this.y, this.size);
  }

  offscreen() {
    return this.x < -this.size;
  }
}
//ボス２体目。だいたい1体目と同じ
class Boss1 {
  constructor() {
    this.x = width + 200;
    this.y = height / 2;

    this.baseY = height / 2;
    this.vy = 2;

    this.scale = 0.5;

    this.maxHp = 2;
    this.hp = this.maxHp;

    this.speed = 2;
    this.hitRadius = 90;

    this.shootInterval = 40;
    this.shootTimer = 0;
  }

  update() {
    if (this.x > width - 150) {
      this.x -= this.speed;
    } else {
      // 上下移動
      this.y += this.vy;
      if (this.y < 80 || this.y > height - 80) {
        this.vy *= -1;
      }

      // 攻撃
      this.shootTimer++;
      if (this.shootTimer >= this.shootInterval) {
        this.shoot();
        this.shootTimer = 0;
      }
    }
  }

  shoot() {
    bossBullets.push(
      new BossBullet(this.x - 30, this.y)
    );
  }

  draw() {
    CLOUD_BOSS(this.x, this.y, this.scale);

    // HPバー（Boss1と同じ）
    let barW = 120;
    let hpW = map(this.hp, 0, this.maxHp, 0, barW);

    noStroke();
    fill(255, 0, 0);
    rect(this.x - barW / 2, this.y - 120, hpW, 8);
  }

  hit(bullet) {
    return dist(
      this.x,
      this.y,
      bullet.x,
      bullet.y
    ) < this.hitRadius;
  }
}





// ANPAN（ボス見た目）

function ANPAN(x = 0, y = 0, n = 1) {
  push();
  translate(x, y);
  scale(n);

  strokeWeight(1);
  stroke(0);
  fill(222, 156, 99);
  circle(0, 0, 200);

  // 眉毛
  noFill();
  bezier(-60, -40, -45, -80, -25, -80, -5, -40);
  bezier(5, -40, 25, -80, 45, -80, 60, -40);

  // 目
  fill(0);
  ellipse(-30, -30, 20, 30);
  ellipse(30, -30, 20, 30);

  // 鼻・ほっぺ
  fill(223, 24, 10);
  circle(0, 20, 50); 
  fill(255, 170, 0);
  circle(-50, 20, 50);
  circle(50, 20, 50);

  // 口
  fill(150, 30, 40);
  noStroke();
  arc(0, 60, 80, 60, 0, PI);

  pop();
}


// 憎きたんQくん（ボス2 見た目）

function CLOUD_BOSS(x = 0, y = 0, s = 1) {
  push();
  translate(x, y);
  scale(-s, s);

  strokeJoin(ROUND);
  stroke(0);
  strokeWeight(6);

  fill(255); // ← ★これ追加（白で塗る）

  // 雲の輪郭
  beginShape();
  vertex(-90, -10);
  bezierVertex(-140, -40, -140, 40, -80, 50);
  bezierVertex(-60, 90, 10, 90, 20, 60);
  bezierVertex(80, 80, 130, 40, 100, 10);
  bezierVertex(140, -20, 110, -70, 60, -60);
  bezierVertex(40, -110, -40, -100, -50, -70);
  bezierVertex(-100, -90, -140, -50, -90, -10);
  endShape(CLOSE);

  // 目（白目）
  noStroke();
  fill(255);
  ellipse(10, -10, 30, 36);
  ellipse(45, -8, 30, 36);

  // 黒目
  fill(0);
  ellipse(15, -5, 12, 16);
  ellipse(50, -3, 12, 16);

  // しっぽ
  stroke(0);
  strokeWeight(6);
  noFill();
  ellipse(-80, 75, 30, 22);
  ellipse(-105, 95, 14, 12);

  pop();
}