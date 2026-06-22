// collection.html 専用の処理です。

// =========================================================
// 状態管理
// =========================================================
let modalModelRotationY = 0;
let modalModelZoom = 1;
let modalModelBaseTarget = 2.2;
let currentDetailDino = null;

// =========================================================
// GLBを自動で中央寄せ＋見える大きさにするコンポーネント
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

      this.el.object3D.scale.set(1, 1, 1);
      this.el.object3D.position.set(0, 0, 0);
      mesh.position.set(0, 0, 0);
      this.el.object3D.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(mesh);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxSize = Math.max(size.x, size.y, size.z);
      const baseScale = maxSize > 0 ? this.data.target / maxSize : 1;
      const finalScale = baseScale * this.data.zoom;
      this.el.object3D.scale.set(finalScale, finalScale, finalScale);

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
// コレクション一覧の生成
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
// 詳細モーダルを開く（フリーズしないカスタムオーバーレイに変更）
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
    modal.classList.add('is-active'); // showModal() の代わり
    document.body.style.overflow = 'hidden';
  }
}

// =========================================================
// 詳細モーダルを閉じる
// =========================================================
function closeDetail() {
  const wrap = document.getElementById('modal-model-wrap');
  const sky = document.getElementById('modal-bg-sky');
  const grass = document.getElementById('modal-bg-grass');
  const sceneEl = wrap ? wrap.querySelector('a-scene') : null;

  if (wrap && wrap.classList.contains('is-fullscreen')) {
    wrap.classList.remove('is-fullscreen');
    if (sky) sky.setAttribute('visible', 'false');
    if (grass) grass.setAttribute('visible', 'false');
    
    setTimeout(() => {
      if (sceneEl && sceneEl.resize) sceneEl.resize();
    }, 50);
  }

  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.classList.remove('is-active');
  }
  document.body.style.overflow = '';
  currentDetailDino = null;
}

// =========================================================
// 3Dモデルの拡大縮小
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
// 💡 フリーズを完全に防ぐ、透明レイヤーを通した安全な操作
// =========================================================
function setupModelInteraction() {
  const wrap = document.getElementById('modal-model-wrap');
  const touchLayer = document.getElementById('touch-layer'); // 操作を受け止める安全な透明シート
  const model = document.getElementById('modal-model');
  const sky = document.getElementById('modal-bg-sky');
  const grass = document.getElementById('modal-bg-grass');
  const sceneEl = wrap ? wrap.querySelector('a-scene') : null;

  if (!wrap || !touchLayer || !model) return;

  let isDragging = false;
  let startX = 0;
  let lastX = 0;
  let hasMoved = false;

  // A-Frameの画面ではなく、その上の透明シートに触れた時の処理
  touchLayer.addEventListener('pointerdown', (event) => {
    if (!currentDetailDino) return;
    isDragging = true;
    startX = event.clientX;
    lastX = event.clientX;
    hasMoved = false;
    
    // タッチ用シートにだけイベントを縛り付ける（A-Frameは干渉しないため安全）
    if (touchLayer.setPointerCapture) {
      touchLayer.setPointerCapture(event.pointerId);
    }
  });

  touchLayer.addEventListener('pointermove', (event) => {
    if (!isDragging || !currentDetailDino) return;

    const diffX = event.clientX - lastX;
    if (Math.abs(event.clientX - startX) > 5) {
      hasMoved = true;
    }
    lastX = event.clientX;

    // 指の動きに合わせてモデルを回転
    modalModelRotationY += diffX * 0.45;
    model.setAttribute('rotation', `0 ${modalModelRotationY} 0`);
  });

  function stopDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    
    if (touchLayer.releasePointerCapture && event.pointerId !== undefined) {
      try { touchLayer.releasePointerCapture(event.pointerId); } catch(e) {}
    }

    if (!currentDetailDino) return;

    // 指が動いていなければ「タップした」とみなして全画面化！
    if (!hasMoved && !wrap.classList.contains('is-fullscreen')) {
      wrap.classList.add('is-fullscreen');
      
      if (sky) {
        sky.setAttribute('color', '#67e8f9'); // 青空
        sky.setAttribute('visible', 'true');
      }
      if (grass) {
        grass.setAttribute('visible', 'true');
      }

      setTimeout(() => {
        if (sceneEl && sceneEl.resize) sceneEl.resize();
      }, 50);
    }
  }

  touchLayer.addEventListener('pointerup', stopDrag);
  touchLayer.addEventListener('pointercancel', stopDrag);
  touchLayer.addEventListener('pointerleave', stopDrag);
}

// =========================================================
// 初期起動イベント
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  renderCollection();
  setupModelInteraction();

  document.addEventListener('click', (event) => {
    const detailButton = event.target.closest('[data-detail]');
    if (detailButton && !detailButton.disabled) {
      openDetail(detailButton.dataset.detail);
      return;
    }

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