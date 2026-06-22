// collection.html 専用の処理です。
// 役割：コレクション一覧を表示する、カード詳細を開く、3Dモデルを横回転させる、拡大縮小する、リセットする。

// =========================================================
// 3Dモデルの横回転・拡大縮小用の状態管理
// =========================================================
let modalModelRotationY = 0;
let modalModelZoom = 1;
let modalModelBaseTarget = 2.2;
let currentDetailDino = null;

// =========================================================
// コレクション詳細用：GLBを自動で中央寄せ＋見える大きさにするコンポーネント
// =========================================================
if (window.AFRAME && !AFRAME.components['fit-gltf-in-collection']) {
  AFRAME.registerComponent('fit-gltf-in-collection', {
    schema: {
      target: { type: 'number', default: 2.2 },
      zoom: { type: 'number', default: 1 },
      distance: { type: 'number', default: 3.1 },
      yOffset: { type: 'number', default: 0 }
    },
    update: function () {
      this.applyFit();
    },
    init: function () {
      this.el.addEventListener('model-loaded', () => {
        this.applyFit();
      });
    },
    applyFit: function () {
      const mesh = this.el.getObject3D('mesh');
      if (!mesh || !window.THREE) return;

      // 位置とスケールを一旦初期化して計測
      this.el.object3D.scale.set(1, 1, 1);
      this.el.object3D.position.set(0, 0, 0);
      mesh.position.set(0, 0, 0);
      this.el.object3D.updateMatrixWorld(true);

      // モデルの正確な境界ボックス（サイズと中心点）を計算
      const box = new THREE.Box3().setFromObject(mesh);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // 1. スケール計算（一番長い辺を基準に target サイズにフィットさせる）
      const maxSize = Math.max(size.x, size.y, size.z);
      const baseScale = maxSize > 0 ? this.data.target / maxSize : 1;
      const finalScale = baseScale * this.data.zoom; // ズーム倍率を乗算
      this.el.object3D.scale.set(finalScale, finalScale, finalScale);

      // 2. 位置計算（カメラの正面奥 distance の位置に配置し、モデル自体の中心ズレを相殺）
      // Y位置は足元を少し接地させるため box.min.y をベースに yOffset で微調整
      this.el.object3D.position.set(0, 0, -this.data.distance);
      mesh.position.set(
        -center.x,
        -box.min.y + (this.data.yOffset / finalScale),
        -center.z
      );

      this.el.object3D.updateMatrixWorld(true);
    }
  });
}

// =========================================================
// 画面描画：コレクション一覧の生成
// =========================================================
function renderCollection() {
  const grid = document.getElementById('collection-grid');
  const totalEl = document.getElementById('collection-total');
  if (!grid) return;

  const collectedIds = typeof getCollection === 'function' ? getCollection() : [];
  const dinosaurs = window.DINOSAURS || [];

  if (totalEl) {
    totalEl.textContent = `${collectedIds.length} / ${dinosaurs.length}`;
  }

  grid.innerHTML = '';

  dinosaurs.forEach((dino) => {
    const isCollected = collectedIds.includes(dino.id);
    const card = document.createElement('div');
    card.className = `card ${isCollected ? 'unlocked' : 'locked'}`;
    
    if (isCollected) {
      card.setAttribute('data-detail', dino.id);
    }

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'card-thumb-wrap';

    const img = document.createElement('img');
    img.className = 'card-thumb';
    img.src = dino.markerImage || 'assets/images/default.png';
    img.alt = dino.name;
    thumbWrap.appendChild(img);

    if (!isCollected) {
      const lock = document.createElement('div');
      lock.className = 'lock-icon';
      lock.textContent = '🔒';
      thumbWrap.appendChild(lock);
    }

    const name = document.createElement('h2');
    name.className = 'card-name';
    name.textContent = isCollected ? dino.name : '???';

    card.appendChild(thumbWrap);
    card.appendChild(name);
    grid.appendChild(card);
  });
}

// =========================================================
// 詳細表示モーダルを開く
// =========================================================
function openDetail(id) {
  const dino = window.DINOSAURS ? window.DINOSAURS.find(d => d.id === id) : null;
  if (!dino) return;

  currentDetailDino = dino;
  modalModelRotationY = 0;
  modalModelZoom = 1;
  modalModelBaseTarget = dino.collectionFitTarget !== undefined ? dino.collectionFitTarget : 2.2;

  document.getElementById('modal-title').textContent = dino.name;
  document.getElementById('modal-desc').textContent = dino.description || '';
  document.getElementById('model-zoom-label').textContent = '100%';

  const wikiBtn = document.getElementById('modal-wiki');
  if (wikiBtn) {
    if (dino.url) {
      wikiBtn.href = dino.url;
      wikiBtn.style.display = 'inline-block';
    } else {
      wikiBtn.style.display = 'none';
    }
  }

  const modelEntity = document.getElementById('modal-model');
  if (modelEntity) {
    modelEntity.removeAttribute('gltf-model');
    modelEntity.removeAttribute('fit-gltf-in-collection');
    modelEntity.setAttribute('rotation', `0 ${modalModelRotationY} 0`);
    
    modelEntity.setAttribute('gltf-model', dino.model);
    modelEntity.setAttribute('fit-gltf-in-collection', {
      target: modalModelBaseTarget,
      zoom: modalModelZoom,
      distance: dino.collectionDistance !== undefined ? dino.collectionDistance : 3.1,
      yOffset: dino.collectionYOffset !== undefined ? dino.collectionYOffset : 0
    });
  }

  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.showModal();
    document.body.style.overflow = 'hidden'; // 背後のスクロールを固定
  }
}

// =========================================================
// 詳細表示モーダルを閉じる
// =========================================================
function closeDetail() {
  const wrap = document.getElementById('modal-model-wrap');
  const sky = document.getElementById('modal-bg-sky');
  const grass = document.getElementById('modal-bg-grass');
  const sceneEl = wrap ? wrap.querySelector('a-scene') : null;

  // 🛠️ もし全画面モードになっていたら解除する
  if (wrap && wrap.classList.contains('is-fullscreen')) {
    wrap.classList.remove('is-fullscreen');
    // 背景を非表示（透明ベース）に戻す
    if (sky) sky.setAttribute('visible', 'false');
    if (grass) grass.setAttribute('visible', 'false');
    
    setTimeout(() => {
      if (sceneEl && sceneEl.resize) sceneEl.resize();
    }, 50);
  }

  const modal = document.getElementById('detail-modal');
  if (modal) modal.close();
  document.body.style.overflow = '';
  currentDetailDino = null;
}

// =========================================================
// 3Dモデルの拡大縮小ボタンの処理
// =========================================================
function zoomModalModel(type) {
  if (!currentDetailDino) return;

  if (type === 'in') {
    modalModelZoom = Math.min(modalModelZoom + 0.15, 2.5);
  } else if (type === 'out') {
    modalModelZoom = Math.max(modalModelZoom - 0.15, 0.4);
  } else if (type === 'reset') {
    modalModelZoom = 1;
  }

  const label = document.getElementById('model-zoom-label');
  if (label) {
    label.textContent = `${Math.round(modalModelZoom * 100)}%`;
  }

  const modelEntity = document.getElementById('modal-model');
  if (modelEntity) {
    modelEntity.setAttribute('fit-gltf-in-collection', 'zoom', modalModelZoom);
  }
}

// =========================================================
// 3Dモデルのスワイプ（ポインター）回転処理
// =========================================================
function setupModelSwipeRotation() {
  const wrap = document.getElementById('modal-model-wrap');
  const model = document.getElementById('modal-model');
  if (!wrap || !model) return;

  let isDragging = false;
  let lastX = 0;

  wrap.addEventListener('pointerdown', (event) => {
    // 🛠️ 全画面時は回転させ、通常枠の時はクリック(全画面化)を優先するため、
    // ドラッグ開始判定は全画面時、もしくはスワイプの意図が明確な場合のみに寄せる仕様にできます。
    isDragging = true;
    lastX = event.clientX;
    if (event.pointerId !== undefined) {
      wrap.setPointerCapture?.(event.pointerId);
    }
  });

  wrap.addEventListener('pointermove', (event) => {
    if (!isDragging) return;

    const diffX = event.clientX - lastX;
    lastX = event.clientX;
    modalModelRotationY += diffX * 0.55;
    model.setAttribute('rotation', `0 ${modalModelRotationY} 0`);
    event.preventDefault();
  });

  function stopDrag(event) {
    isDragging = false;
    if (event?.pointerId !== undefined) {
      wrap.releasePointerCapture?.(event.pointerId);
    }
  }

  wrap.addEventListener('pointerup', stopDrag);
  wrap.addEventListener('pointercancel', stopDrag);
  wrap.addEventListener('pointerleave', stopDrag);
}

// =========================================================
// 🛠️ 追加：3Dモデルの枠をシングルタップした時の全画面・草原切り替え処理
// =========================================================
function setupFullscreenToggle() {
  const wrap = document.getElementById('modal-model-wrap');
  const sky = document.getElementById('modal-bg-sky');
  const grass = document.getElementById('modal-bg-grass');
  const sceneEl = wrap ? wrap.querySelector('a-scene') : null;

  if (!wrap) return;

  wrap.addEventListener('click', () => {
    // すでに全画面化されている場合は、タップでの誤操作を防ぐため何もしない（閉じる時は右上の「×」ボタンで行う）
    if (wrap.classList.contains('is-fullscreen')) return;

    wrap.classList.add('is-fullscreen');
    
    // 背景（青空と緑の草原）を表示状態にする
    if (sky) {
      sky.setAttribute('color', '#67e8f9'); // 綺麗な水色（青空）
      sky.setAttribute('visible', 'true');
    }
    if (grass) {
      grass.setAttribute('visible', 'true');
    }

    // A-Frameに画面サイズが劇的に変わったことを通知（恐竜が横に引き伸ばされるのを防止）
    setTimeout(() => {
      if (sceneEl && sceneEl.resize) sceneEl.resize();
    }, 50);
  });
}

// =========================================================
// 初期起動イベント
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  renderCollection();
  setupModelSwipeRotation();
  setupFullscreenToggle(); // 🛠️ 関数呼び出しを追加

  document.addEventListener('click', (event) => {
    const detailButton = event.target.closest('[data-detail]');
    if (detailButton && !detailButton.disabled) openDetail(detailButton.dataset.detail);

    const zoomButton = event.target.closest('[data-model-zoom]');
    if (zoomButton) {
      zoomModalModel(zoomButton.dataset.modelZoom);
      return;
    }

    const closeButton = event.target.closest('[data-close-modal]');
    if (closeButton) {
      closeDetail();
      return;
    }

    const clearButton = event.target.closest('[data-clear-collection]');
    if (clearButton) {
      if (confirm('これまで集めた恐竜スタンプの記録がすべて消去されます。本当によろしいですか？')) {
        localStorage.clear();
        renderCollection();
        alert('コレクションをリセットしました。');
      }
    }
  });
});