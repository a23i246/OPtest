// 待ち時間用シューティングゲームの各キャラクター定義
// p5.js のグローバル関数（random, dist, fill など）を使います。

// ボスHP設定：ここだけ数値を変えればボスの耐久を調整できます。
// いったん両方1にして、どちらも一撃で倒せるようにしています。
const BOSS1_HP = 40; // 1体目：アンパン風ボス
const BOSS2_HP = 20; // 2体目：雲ボス

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;          // 見た目はさらに小さめ
    this.hitRadius = 4;      // 当たり判定は中央の白点だけ
    this.speed = 7.5;
    this.hp = 3;
    this.maxHp = 3;
  }

  getHitX() {
    return this.x;
  }

  getHitY() {
    return this.y + 4;
  }

  update() {
    // PC確認用：WASD / 矢印キー
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) this.y -= this.speed;
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) this.y += this.speed;
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) this.x -= this.speed;
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) this.x += this.speed;

    this.x = constrain(this.x, 22, width - 22);
    this.y = constrain(this.y, height * 0.45, height - 44);

    if (this.hp < this.maxHp && frameCount % 3 === 0) {
      smokes.push(new Smoke(this.x, this.y + this.size / 2));
    }
  }

  draw() {
    noStroke();

    // ブースター炎
    fill(255, 150, 0, 190);
    ellipse(this.x, this.y + this.size / 2 + 8, random(8, 14), random(14, 22));

    // 機体（三角形）
    fill(0, 200, 255);
    triangle(
      this.x,
      this.y - this.size / 2,
      this.x - this.size / 2,
      this.y + this.size / 2,
      this.x + this.size / 2,
      this.y + this.size / 2
    );

    // 当たり判定：ここだけに当たる。白い点として見えるようにする。
    fill(255);
    stroke(0, 180);
    strokeWeight(1.5);
    circle(this.getHitX(), this.getHitY(), this.hitRadius * 2.4);
    noStroke();
  }

  hitCircle(x, y, r) {
    return dist(this.getHitX(), this.getHitY(), x, y) < this.hitRadius + r;
  }

  hit(enemy) {
    return this.hitCircle(enemy.x, enemy.y, enemy.size / 2);
  }
}

class Smoke {
  constructor(x, y) {
    this.x = x + random(-3, 3);
    this.y = y;
    this.vx = random(-0.3, 0.3);
    this.vy = random(1.5, 3.5);
    this.alpha = 150;
    this.size = random(4, 8);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 7;
    this.size += 0.35;
  }

  draw() {
    noStroke();
    fill(180, this.alpha);
    ellipse(this.x, this.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 2.6);
    this.speed = random(1.2, 4.5);
  }

  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = 0;
      this.x = random(width);
    }
  }

  draw() {
    noStroke();
    fill(255, 255, 255, 210);
    circle(this.x, this.y, this.size);
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 11;
    this.size = 6;
  }

  update() {
    this.y -= this.speed;
  }

  draw() {
    noStroke();
    fill(255, 255, 0);
    circle(this.x, this.y, this.size);
  }

  offscreen() {
    return this.y < -20;
  }
}

// 赤い追尾敵。ボス出現条件のカウント対象。
class Enemy {
  constructor() {
    this.size = random(12, 16);
    this.x = random(24, width - 24);
    this.y = -this.size;
    this.speed = random(2.6, 4.2);
    this.scoreValue = 100;
    this.isRedEnemy = true;
  }

  update(player) {
    const dx = player.getHitX() - this.x;
    const dy = player.getHitY() - this.y;
    const d = sqrt(dx * dx + dy * dy) || 1;
    this.x += (dx / d) * this.speed;
    this.y += (dy / d) * this.speed;
  }

  draw() {
    noStroke();
    fill(255, 70, 90);
    circle(this.x, this.y, this.size);
  }

  offscreen() {
    return this.y > height + this.size || this.x < -60 || this.x > width + 60;
  }
}

// 黄色の高速直進敵。
class FastEnemy {
  constructor() {
    this.size = random(10, 14);
    this.x = random(20, width - 20);
    this.y = -this.size;
    this.speed = random(6.0, 9.4);
    this.scoreValue = 80;
    this.isRedEnemy = false;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    noStroke();
    fill(255, 210, 0);
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size, 3);
    rectMode(CORNER);
  }

  offscreen() {
    return this.y > height + this.size;
  }
}

// 紫の反射弾をばらまく敵。倒せない障害物寄り。
class BouncerEnemy {
  constructor() {
    this.size = random(9, 12);
    this.x = random(40, width - 40);
    this.y = -20;
    this.vx = random([-1, 1]) * random(3.5, 5.8);
    this.vy = random(4.2, 6.8);
    this.scoreValue = 120;
    this.isRedEnemy = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < this.size || this.x > width - this.size) this.vx *= -1;
  }

  draw() {
    noStroke();
    fill(170, 90, 255);
    circle(this.x, this.y, this.size);
  }

  offscreen() {
    return this.y > height + 30;
  }
}

class BossBullet {
  constructor(x, y, vx, vy, size = 9, colorType = 'red') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.colorType = colorType;
    this.bounce = colorType === 'purple';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.bounce && (this.x < this.size || this.x > width - this.size)) this.vx *= -1;
    if (this.bounce && (this.y < this.size || this.y > height - this.size)) this.vy *= -1;
  }

  draw() {
    noStroke();
    if (this.colorType === 'blue') fill(70, 190, 255);
    else if (this.colorType === 'purple') fill(185, 90, 255);
    else fill(255, 70, 90);
    circle(this.x, this.y, this.size);
  }

  offscreen() {
    if (this.bounce) return false;
    return this.x < -40 || this.x > width + 40 || this.y < -40 || this.y > height + 40;
  }
}

// 1体目：前回の入れ替え仕様で、アンパン風ボスを先に出す。
class Boss2 {
  constructor() {
    this.x = width * 0.58;
    this.y = -90;
    this.targetY = max(76, height * 0.14); // 中央すぎないよう上寄せ
    this.moveTimer = 0;
    this.scale = 0.28;
    this.maxHp = BOSS1_HP;
    this.hp = this.maxHp;
    this.speed = 2.6;
    this.hitRadius = 52;
    this.shootInterval = 20;
    this.shootTimer = 0;
  }

  update() {
    if (this.y < this.targetY) {
      this.y += this.speed;
      return;
    }
    this.moveTimer += 0.045;
    this.x = width * 0.58 + sin(this.moveTimer) * min(110, width * 0.31);

    this.shootTimer++;
    if (this.shootTimer >= this.shootInterval) {
      this.shoot();
      this.shootTimer = 0;
    }
  }

  shoot() {
    // 扇状に多め。難易度高め。
    for (let a = -0.75; a <= 0.75; a += 0.375) {
      bossBullets.push(new BossBullet(this.x, this.y + 42, sin(a) * 3.9, 4.8 + cos(a), 8, 'red'));
    }
    if (frameCount % 3 === 0) {
      bossBullets.push(new BossBullet(this.x, this.y + 20, random(-3, 3), random(3.2, 4.6), 9, 'purple'));
    }
  }

  draw() {
    ANPAN(this.x, this.y, this.scale);
    drawBossHp(this.x, this.y - 74, this.hp, this.maxHp, 105);
  }

  hit(bullet) {
    return dist(this.x, this.y, bullet.x, bullet.y) < this.hitRadius;
  }
}

// 2体目：雲ボス。撃破でゲームクリア。
class Boss1 {
  constructor() {
    this.x = width * 0.43;
    this.y = -100;
    this.targetY = max(82, height * 0.15);
    this.baseX = width * 0.43;
    this.moveTimer = 0;
    this.scale = 0.34;
    // HPは上の BOSS2_HP だけ変えれば調整できます。
    this.maxHp = BOSS2_HP;
    this.hp = this.maxHp;
    this.speed = 3.4;
    this.hitRadius = 62;
    this.shootInterval = 7;
    this.shootTimer = 0;
    this.spiralAngle = 0;
  }

  update() {
    if (this.y < this.targetY) {
      this.y += this.speed;
      return;
    }

    this.moveTimer += 0.075;
    this.x = this.baseX + sin(this.moveTimer) * min(138, width * 0.38);
    this.y = this.targetY + sin(this.moveTimer * 1.9) * 30;

    this.shootTimer++;
    if (this.shootTimer >= this.shootInterval) {
      this.shoot();
      this.shootTimer = 0;
    }
  }

  shoot() {
    const px = player ? player.getHitX() : width / 2;
    const py = player ? player.getHitY() : height;
    const dx = px - this.x;
    const dy = py - this.y;
    const d = sqrt(dx * dx + dy * dy) || 1;

    // 2体目ボス強化：高速自機狙い、扇状弾、反射弾、スパイラル弾を混ぜる。
    bossBullets.push(new BossBullet(this.x, this.y + 36, (dx / d) * 7.4, (dy / d) * 7.4, 9, 'blue'));
    bossBullets.push(new BossBullet(this.x - 30, this.y + 42, (dx / d) * 5.9 - 1.9, (dy / d) * 5.9, 8, 'red'));
    bossBullets.push(new BossBullet(this.x + 30, this.y + 42, (dx / d) * 5.9 + 1.9, (dy / d) * 5.9, 8, 'red'));

    // 下方向に広がる扇状弾。白点判定なので密度高めでも避けられる。
    for (let a = -0.62; a <= 0.62; a += 0.31) {
      bossBullets.push(new BossBullet(this.x, this.y + 48, sin(a) * 4.6, 5.9 + cos(a) * 1.2, 7, 'red'));
    }

    // 反射弾を増やして、画面内に残る危険地帯を作る。
    bossBullets.push(new BossBullet(this.x, this.y + 8, random(-6.4, 6.4), random(4.8, 7.8), 10, 'purple'));
    if (frameCount % 2 === 0) {
      bossBullets.push(new BossBullet(this.x + random(-50, 50), this.y + 20, random(-5.2, 5.2), random(4.6, 7.0), 9, 'purple'));
    }

    // スパイラル気味の横切り弾。
    this.spiralAngle += 0.42;
    bossBullets.push(new BossBullet(this.x, this.y + 30, cos(this.spiralAngle) * 5.2, 5.4 + sin(this.spiralAngle) * 1.5, 8, 'blue'));
    bossBullets.push(new BossBullet(this.x, this.y + 30, cos(this.spiralAngle + PI) * 5.2, 5.4 + sin(this.spiralAngle + PI) * 1.5, 8, 'blue'));
  }

  draw() {
    CLOUD_BOSS(this.x, this.y, this.scale);
    drawBossHp(this.x, this.y - 72, this.hp, this.maxHp, 128);
  }

  hit(bullet) {
    return dist(this.x, this.y, bullet.x, bullet.y) < this.hitRadius;
  }
}

function drawBossHp(x, y, hp, maxHp, barW) {
  noStroke();
  fill(20, 20, 30, 210);
  rect(x - barW / 2, y, barW, 9, 6);
  fill(255, 0, 0);
  rect(x - barW / 2, y, map(hp, 0, maxHp, 0, barW), 9, 6);
}

function ANPAN(x = 0, y = 0, n = 1) {
  push();
  translate(x, y);
  scale(n);

  strokeWeight(1);
  stroke(0);
  fill(222, 156, 99);
  circle(0, 0, 200);

  noFill();
  bezier(-60, -40, -45, -80, -25, -80, -5, -40);
  bezier(5, -40, 25, -80, 45, -80, 60, -40);

  fill(0);
  ellipse(-30, -30, 20, 30);
  ellipse(30, -30, 20, 30);

  fill(223, 24, 10);
  circle(0, 20, 50);
  fill(255, 170, 0);
  circle(-50, 20, 50);
  circle(50, 20, 50);

  fill(150, 30, 40);
  noStroke();
  arc(0, 60, 80, 60, 0, PI);

  pop();
}

function CLOUD_BOSS(x = 0, y = 0, s = 1) {
  push();
  translate(x, y);
  scale(-s, s);

  strokeJoin(ROUND);
  stroke(0);
  strokeWeight(6);
  fill(255);

  beginShape();
  vertex(-90, -10);
  bezierVertex(-140, -40, -140, 40, -80, 50);
  bezierVertex(-60, 90, 10, 90, 20, 60);
  bezierVertex(80, 80, 130, 40, 100, 10);
  bezierVertex(140, -20, 110, -70, 60, -60);
  bezierVertex(40, -110, -40, -100, -50, -70);
  bezierVertex(-100, -90, -140, -50, -90, -10);
  endShape(CLOSE);

  noStroke();
  fill(255);
  ellipse(10, -10, 30, 36);
  ellipse(45, -8, 30, 36);

  fill(0);
  ellipse(15, -5, 12, 16);
  ellipse(50, -3, 12, 16);

  stroke(0);
  strokeWeight(6);
  noFill();
  ellipse(-80, 75, 30, 22);
  ellipse(-105, 95, 14, 12);

  pop();
}
