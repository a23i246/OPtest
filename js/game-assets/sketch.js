// 待ち時間用 縦型シューティングゲーム

let player;
let lastShotTime = 0;
let shotInterval = 105;
let smokes = [];
let bullets = [];
let enemies = [];
let stars = [];
let gameStarted = false;
let gameOver = false;
let gameClear = false;
let resultScreenShown = false;
let isPointerDown = false;
let autoShotOnTouch = false;
let pointerStartX = 0;
let pointerStartY = 0;
let playerStartX = 0;
let playerStartY = 0;

// 赤い追尾敵の撃破数は「今のボス段階用」と「累計」を分ける。
let redPhaseKillCount = 0;
let redTotalKillCount = 0;
let nextBossNeed = 10;

let boss = null;
let bossLevel = 1;
let bossBullets = [];
let bossRedKillTargets = [10, 15];
let isBossBattle = false;

let killCount = 0;
let score = 0;
let shakeAmount = 0;
let enemySpawnLevel = 1;
let playerInvincibleTimer = 0;
let playerHitEffectTimer = 0;
let playerHitEffectX = 0;
let playerHitEffectY = 0;

function setup() {
  const size = getGameCanvasSize();
  const canvas = createCanvas(size.w, size.h);
  const container = document.getElementById('game-container');
  if (container) canvas.parent(container);
  canvas.elt.addEventListener('contextmenu', (event) => event.preventDefault());
  textAlign(CENTER, CENTER);

  resetStars();
  player = new Player(width / 2, height - 76);
}

function getGameCanvasSize() {
  const container = document.getElementById('game-container');
  const w = container ? container.clientWidth : windowWidth;
  const h = container ? container.clientHeight : windowHeight;
  return {
    w: Math.max(320, Math.floor(w)),
    h: Math.max(430, Math.floor(h))
  };
}

function resetStars() {
  stars = [];
  for (let i = 0; i < 95; i++) stars.push(new Star());
}

function windowResized() {
  const size = getGameCanvasSize();
  resizeCanvas(size.w, size.h);
  resetStars();
  if (player) {
    player.x = constrain(player.x, 22, width - 22);
    player.y = constrain(player.y, height * 0.38, height - 44);
  }
}

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    const title = document.getElementById('title-ui');
    if (title) title.style.display = 'none';
  }
}

function shootPlayerBullet() {
  if (!gameStarted || gameOver || gameClear) return;
  const now = millis();
  if (now - lastShotTime > shotInterval) {
    bullets.push(new Bullet(player.getHitX(), player.y - player.size / 2));
    lastShotTime = now;
  }
}

function isPointerInsideCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function getPointerPosition() {
  if (touches && touches.length > 0) {
    return { x: touches[0].x, y: touches[0].y };
  }
  return { x: mouseX, y: mouseY };
}

function applyRelativePointerMove() {
  if (!gameStarted || gameOver || gameClear) return;
  const p = getPointerPosition();
  player.x = constrain(playerStartX + (p.x - pointerStartX), 22, width - 22);
  player.y = constrain(playerStartY + (p.y - pointerStartY), height * 0.38, height - 44);
}

function isEventOnGameButton() {
  const event = window.event;
  const target = event && event.target;
  if (target && target.closest && target.closest('.game-top-panel, .game-actions, #ranking-modal, a, button, input')) return true;

  // Android Chrome + p5.js では window.event が取れないことがあるため、
  // 画面上部パネルの高さでも判定して、ボタン操作をゲーム側が奪わないようにする。
  const panel = document.querySelector('.game-top-panel');
  if (!panel) return false;
  const rect = panel.getBoundingClientRect();
  const x = event && event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : null;
  const y = event && event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientY : null;
  if (x !== null && y !== null) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }
  return false;
}

function startPointerControl() {
  if (isEventOnGameButton()) return true;
  if (!isPointerInsideCanvas()) return true;
  if (!gameStarted) {
    startGame();
    return false;
  }
  if (gameOver || gameClear) {
    // ランキング画面のボタンから再開する。画面タップでは即リセットしない。
    return false;
  }
  const p = getPointerPosition();
  isPointerDown = true;
  autoShotOnTouch = true;
  pointerStartX = p.x;
  pointerStartY = p.y;
  playerStartX = player.x;
  playerStartY = player.y;
  shootPlayerBullet();
  return false;
}

function movePointerControl() {
  if (!isPointerDown) return true;
  applyRelativePointerMove();
  return false;
}

function endPointerControl() {
  isPointerDown = false;
  autoShotOnTouch = false;
  return false;
}

function touchStarted() { return startPointerControl(); }
function touchMoved() { return movePointerControl(); }
function touchEnded() { return endPointerControl(); }
function mousePressed() { return startPointerControl(); }
function mouseDragged() { return movePointerControl(); }
function mouseReleased() { return endPointerControl(); }

function keyPressed() {
  if (keyCode === ENTER && !gameStarted) {
    startGame();
    return false;
  }
  if (keyCode === ENTER && (gameOver || gameClear)) {
    // 名前入力中の誤リセットを防ぐ。再開はランキング画面のボタンから行う。
    return false;
  }
  if (keyCode === 32 && gameStarted && !gameOver && !gameClear) {
    shootPlayerBullet();
    return false;
  }
}

function drawScanLines() {
  stroke(0, 255, 255, 20);
  for (let y = 0; y < height; y += 4) line(0, y, width, y);
}

function draw() {
  background(11, 12, 28);

  for (let star of stars) {
    star.update();
    star.draw();
  }

  if (!gameStarted) {
    drawScanLines();
    return;
  }

  if (gameOver) {
    drawGameOver();
    return;
  }

  if (gameClear) {
    drawGameClear();
    return;
  }

  push();
  if (shakeAmount > 0) {
    translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
    shakeAmount *= 0.88;
  }

  for (let i = smokes.length - 1; i >= 0; i--) {
    smokes[i].update();
    smokes[i].draw();
    if (smokes[i].isDead()) smokes.splice(i, 1);
  }

  updatePlayerHitTimers();
  player.update();
  if (autoShotOnTouch || keyIsDown(32)) shootPlayerBullet();
  player.draw();
  drawPlayerHitEffect();
  drawInvincibleHalo();

  if (isBossBattle && boss) {
    boss.update();
    boss.draw();
    updateBossBullets();
  }

  updateBullets();
  updateEnemies();

  pop();
  drawHUD();
}


function finishGame(resultType) {
  if (resultScreenShown) return;
  resultScreenShown = true;

  isPointerDown = false;
  autoShotOnTouch = false;

  if (resultType === 'clear') {
    gameClear = true;
  } else {
    gameOver = true;
  }

  if (typeof showRankingScreen === 'function') {
    // bossLevel 1: 第1ボス段階、bossLevel 2: 第2ボス段階。
    showRankingScreen(score, resultType, bossLevel);
  }
}

function resetGame() {
  player = new Player(width / 2, height - 76);
  bullets = [];
  enemies = [];
  smokes = [];
  bossBullets = [];

  killCount = 0;
  score = 0;
  redPhaseKillCount = 0;
  redTotalKillCount = 0;
  boss = null;
  bossLevel = 1;
  nextBossNeed = bossRedKillTargets[0];
  isBossBattle = false;
  enemySpawnLevel = 1;
  playerInvincibleTimer = 0;
  playerHitEffectTimer = 0;
  playerHitEffectX = 0;
  playerHitEffectY = 0;

  lastShotTime = 0;
  shakeAmount = 0;
  gameOver = false;
  gameClear = false;
  resultScreenShown = false;
  if (typeof hideRankingScreen === 'function') hideRankingScreen();
  gameStarted = true;

  const title = document.getElementById('title-ui');
  if (title) title.style.display = 'none';
}


function isPlayerVulnerable() {
  return playerInvincibleTimer <= 0 && !gameOver && !gameClear;
}

function damagePlayer() {
  if (!isPlayerVulnerable()) return false;
  if (!player || typeof player.hp !== 'number') return false;

  // 固まり対策：被弾時にゲーム進行を止める処理は一切しない。
  // 自機を消す・全弾消し・復活待ち・強い画面揺れは使わず、表示演出と短い無敵だけにする。
  player.hp = max(0, player.hp - 1);
  shakeAmount = 5;
  playerHitEffectTimer = 20;
  playerHitEffectX = player.getHitX();
  playerHitEffectY = player.getHitY();
  playerInvincibleTimer = 90;

  if (player.hp <= 0) {
    finishGame('gameover');
  }
  return true;
}

function updatePlayerHitTimers() {
  if (playerInvincibleTimer > 0) playerInvincibleTimer--;
  if (playerHitEffectTimer > 0) playerHitEffectTimer--;
}

function drawPlayerHitEffect() {
  if (playerHitEffectTimer <= 0) return;
  const f = 20 - playerHitEffectTimer;
  const alpha = map(playerHitEffectTimer, 0, 20, 0, 210);

  // 軽いリング演出だけ。全面塗りつぶしは端末によって重く見えるため使わない。
  noFill();
  strokeWeight(3);
  stroke(255, 80, 80, alpha);
  circle(playerHitEffectX, playerHitEffectY, 22 + f * 3.0);

  stroke(255, 230, 80, alpha * 0.8);
  circle(playerHitEffectX, playerHitEffectY, 12 + f * 1.8);

  noStroke();
}

function drawInvincibleHalo() {
  if (playerInvincibleTimer <= 0) return;
  if (frameCount % 8 >= 4) return;
  noFill();
  stroke(120, 220, 255, 180);
  strokeWeight(2);
  circle(player.getHitX(), player.getHitY(), 34);
  noStroke();
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].draw();
    if (bullets[i].offscreen()) bullets.splice(i, 1);
  }

  if (isBossBattle && boss) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (boss.hit(bullets[i])) {
        boss.hp--;
        shakeAmount = 7;
        bullets.splice(i, 1);

        if (boss.hp <= 0) {
          score += bossLevel === 1 ? 2500 : 6000;
          boss = null;
          isBossBattle = false;
          bossBullets = [];
          enemies = [];

          if (bossLevel >= 2) {
            finishGame('clear');
          } else {
            // 1体目を倒した後、赤い敵カウントを0に戻して、改めて15体で2体目。
            bossLevel = 2;
            redPhaseKillCount = 0;
            nextBossNeed = bossRedKillTargets[1];
            enemySpawnLevel = 2;
          }
        }
        break;
      }
    }
  }
}

function maybeSpawnEnemies() {
  if (isBossBattle) return;

  // 赤玉だけでボスがすぐ出ないように、赤の比率は下げる。
  // その代わり黄色と紫を増やして、避ける難しさを上げる。
  const spawnEvery = bossLevel === 1 ? 12 : 8;
  if (frameCount % spawnEvery !== 0) return;

  const r = random();
  if (r < 0.23) enemies.push(new Enemy());
  else if (r < 0.67) enemies.push(new FastEnemy());
  else enemies.push(new BouncerEnemy());

  // 追加湧きは黄色・紫中心。赤カウントを早めすぎず密度だけ上げる。
  const extraChance = bossLevel === 1 ? 0.32 : 0.55;
  if (random() < extraChance) {
    enemies.push(random() < 0.58 ? new FastEnemy() : new BouncerEnemy());
  }
  if (bossLevel === 2 && random() < 0.22) {
    enemies.push(random() < 0.15 ? new Enemy() : (random() < 0.62 ? new FastEnemy() : new BouncerEnemy()));
  }
}

function updateEnemies() {
  if (!isBossBattle && bossLevel <= bossRedKillTargets.length && redPhaseKillCount >= nextBossNeed) {
    boss = bossLevel === 1 ? new Boss2() : new Boss1();
    isBossBattle = true;
    enemies = [];
    return;
  }

  maybeSpawnEnemies();

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update(player);
    enemies[i].draw();

    for (let j = bullets.length - 1; j >= 0; j--) {
      if (dist(bullets[j].x, bullets[j].y, enemies[i].x, enemies[i].y) < enemies[i].size / 2 + bullets[j].size / 2) {
        shakeAmount = 5;
        killCount++;
        if (enemies[i].isRedEnemy) {
          redPhaseKillCount++;
          redTotalKillCount++;
        }
        score += enemies[i].scoreValue;
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        break;
      }
    }

    if (enemies[i] && isPlayerVulnerable() && player.hit(enemies[i])) {
      // 全消しはしないが、接触した敵だけは消して、同じ敵で連続被弾して固まったように見えるのを防ぐ。
      damagePlayer();
      enemies.splice(i, 1);
      continue;
    }

    if (enemies[i] && enemies[i].offscreen()) enemies.splice(i, 1);
  }
}

function updateBossBullets() {
  for (let i = bossBullets.length - 1; i >= 0; i--) {
    bossBullets[i].update();
    bossBullets[i].draw();

    if (bossBullets[i] && isPlayerVulnerable() && player.hitCircle(bossBullets[i].x, bossBullets[i].y, bossBullets[i].size / 2)) {
      // 全弾消しはしないが、当たった弾だけ消して、同じ弾で即連続ヒットしないようにする。
      damagePlayer();
      bossBullets.splice(i, 1);
      continue;
    }

    if (bossBullets[i] && bossBullets[i].offscreen()) bossBullets.splice(i, 1);
  }

  // 反射弾が永遠に増えすぎないように制限。2体目は弾幕を強くするため上限を増やす。
  const bulletLimit = bossLevel >= 2 ? 125 : 72;
  if (bossBullets.length > bulletLimit) bossBullets.splice(0, bossBullets.length - bulletLimit);
}

function drawHUD() {
  noStroke();
  fill(8, 18, 55, 185);
  rect(8, 8, min(190, width - 16), 100, 10);

  fill(0, 255, 255);
  textSize(15);
  textAlign(LEFT, TOP);
  text('SCORE : ' + score, 16, 16);
  text('KILL : ' + killCount, 16, 36);
  text('RED : ' + redPhaseKillCount + ' / ' + nextBossNeed, 16, 56);

  for (let i = 0; i < player.hp; i++) {
    text('❤️', 16 + i * 24, 76);
  }

  if (isBossBattle && boss) {
    textAlign(RIGHT, TOP);
    fill(255, 220, 100);
    textSize(14);
    text('BOSS ' + bossLevel, width - 14, 16);
  }
}

function drawGameOver() {
  background(10, 0, 20);
  textAlign(CENTER, CENTER);
  fill(255, 80, 80);
  textSize(min(44, width * 0.12));
  text('GAME OVER', width / 2, height / 2 - 50);

  fill(255);
  textSize(22);
  text('SCORE : ' + score, width / 2, height / 2);
  textSize(15);
  text('TAP / ENTER でもう一度', width / 2, height / 2 + 40);
}

function drawGameClear() {
  background(5, 20, 35);
  textAlign(CENTER, CENTER);
  fill(80, 255, 180);
  textSize(min(42, width * 0.11));
  text('GAME CLEAR!', width / 2, height / 2 - 60);

  fill(255);
  textSize(20);
  text('2体目のボスを撃破！', width / 2, height / 2 - 15);
  textSize(26);
  text('SCORE : ' + score, width / 2, height / 2 + 28);
  textSize(15);
  fill(220);
  text('TAP / ENTER でもう一度', width / 2, height / 2 + 72);
}
