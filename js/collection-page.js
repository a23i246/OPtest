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
// 前の方式は js/dinosaurs.js の collectionScale / collectionPosition をそのまま使っていました。
// ただ、GLBごとに原点やサイズが違うため、ラウジャア・ピナコサウルス系が枠外に寄ったり、
// モデルが下側ギリギリに出ることがありました。
// ここでは読み込んだGLBの外接ボックスを見て、中心が画面中央に来るように自動補正します。
if (window.AFRAME && !AFRAME.components['fit-gltf-in-collection']) {
  AFRAME.registerComponent('fit-gltf-in-collection', {
    schema: {
      target: { type: 'number', default: 2.2 },
      zoom: { type: 'number', default: 1 },
      distance: { type: 'number', default: 3.1 },
      yOffset: { type: 'number', default: 0.05 }
    },

    init: function () {
      this.el.addEventListener('model-loaded', () => this.fit());
      this.el.addEventListener('model-error', (event) => {
        console.error('collection model-error:', event);
        const title = document.getElementById('modal-title');
        if (title) title.textContent += '（モデル読込失敗）';
      });
    },

    update: function () {
      this.fit();
    },

    fit: function () {
      const mesh = this.el.getObject3D('mesh');
      if (!mesh || !window.THREE) return;

      // いったん標準状態に戻してから外接ボックスを取ります。
      this.el.object3D.scale.set(1, 1, 1);
      this.el.object3D.position.set(0, 0, -this.data.distance);
      this.el.object3D.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(mesh);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxSize = Math.max(size.x, size.y, size.z);
      if (!Number.isFinite(maxSize) || maxSize <= 0) return;

      const target = this.data.target * this.data.zoom;
      const scale = target / maxSize;

      // GLBの中心が画面中央に来るように原点ズレを打ち消します。
      // zはカメラから少し奥へ置きます。
      this.el.object3D.scale.set(scale, scale, scale);
      this.el.object3D.position.set(
        -center.x * scale,
        -center.y * scale + this.data.yOffset,
        -this.data.distance - center.z * scale
      );
      this.el.object3D.updateMatrixWorld(true);
    }
  });
}

function updateZoomLabel() {
  const label = document.getElementById('model-zoom-label');
  if (label) label.textContent = `${Math.round(modalModelZoom * 100)}%`;
}

function applyModalModelScale() {
  const model = document.getElementById('modal-model');
  if (!model) return;

  model.setAttribute('fit-gltf-in-collection', {
    target: modalModelBaseTarget,
    zoom: modalModelZoom,
    distance: currentDetailDino?.collectionDistance || 3.1,
    yOffset: currentDetailDino?.collectionYOffset ?? 0.05
  });
  updateZoomLabel();
}

function zoomModalModel(direction) {
  if (direction === 'in') {
    modalModelZoom = Math.min(4, modalModelZoom * 1.25);
  } else if (direction === 'out') {
    modalModelZoom = Math.max(0.35, modalModelZoom / 1.25);
  } else if (direction === 'reset') {
    modalModelZoom = 1;
  }
  applyModalModelScale();
}

function renderCollection() {
  const root = document.getElementById('collection-root');
  const collected = getCollection();
  const dinos = window.DINOSAURS || [];

  const totalEl = document.getElementById('collection-total');
  if (totalEl) totalEl.textContent = `${collected.length} / ${dinos.length}`;

  if (!root) return;
  root.innerHTML = '';

  dinos.forEach((dino, index) => {
    const isCollected = collected.includes(dino.id);
    const card = document.createElement('article');
    card.className = `collection-item ${isCollected ? '' : 'locked'}`;

    card.innerHTML = `
      <div class="collection-thumb-wrap">
        <img src="${dino.markerImage}" alt="${dino.name}のマーカー画像" loading="lazy">
        <span class="stamp-number">${String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3>${isCollected ? dino.name : '？？？'}</h3>
      <p>${isCollected ? dino.description : 'まだ見つけていない恐竜です。会場のマーカーを探してみましょう。'}</p>
      <button class="button light" data-detail="${dino.id}" ${isCollected ? '' : 'disabled'}>${isCollected ? '詳しく見る' : '未収集'}</button>
    `;

    root.appendChild(card);
  });
}

function openDetail(id) {
  const dino = findDinosaur(id);
  if (!dino) return;

  currentDetailDino = dino;

  const modal = document.getElementById('detail-modal');
  const title = document.getElementById('modal-title');
  const description = document.getElementById('modal-description');
  const link = document.getElementById('modal-link');
  const model = document.getElementById('modal-model');
  const scene = document.querySelector('#modal-model-wrap a-scene');
  const camera = document.querySelector('#modal-model-wrap [camera]');

  if (title) title.textContent = dino.name;
  if (description) description.textContent = dino.description;

  if (link) {
    if (dino.url) {
      link.href = dino.url;
      link.hidden = false;
    } else {
      link.hidden = true;
    }
  }

  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  if (camera) {
    // サヴァケファレのように、モデルの奥行きや原点のクセでカメラが中に入り込む場合があるため、
    // 恐竜ごとにカメラ位置を変えられるようにしています。基本値は 3.4 です。
    camera.setAttribute('position', `0 0 ${Number(dino.collectionCameraZ) || 3.4}`);
  }

  if (model) {
    model.removeAttribute('gltf-model');
    model.removeAttribute('animation');

    // 初期サイズ。恐竜ごとに collectionFitTarget を指定でき、なければ2.2です。
    modalModelBaseTarget = Number(dino.collectionFitTarget) || 2.2;
    modalModelZoom = 1;

    const startRotation = dino.collectionRotation || '0 0 0';
    const parts = startRotation.split(' ').map(Number);
    modalModelRotationY = Number.isFinite(parts[1]) ? parts[1] : 0;
    model.setAttribute('rotation', startRotation);

    applyModalModelScale();

    requestAnimationFrame(() => {
      scene?.resize?.();
      model.setAttribute('gltf-model', `url(${dino.model})`);
      setTimeout(() => scene?.resize?.(), 150);
      setTimeout(() => scene?.resize?.(), 500);
    });
  }
}

function closeDetail() {
  const modal = document.getElementById('detail-modal');
  const model = document.getElementById('modal-model');
  if (model) model.removeAttribute('gltf-model');

  currentDetailDino = null;
  modalModelZoom = 1;
  updateZoomLabel();

  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function setupModelSwipeRotation() {
  const wrap = document.getElementById('modal-model-wrap');
  const model = document.getElementById('modal-model');
  if (!wrap || !model) return;

  let isDragging = false;
  let lastX = 0;

  wrap.addEventListener('pointerdown', (event) => {
    isDragging = true;
    lastX = event.clientX;
    wrap.setPointerCapture?.(event.pointerId);
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

window.addEventListener('DOMContentLoaded', () => {
  renderCollection();
  setupModelSwipeRotation();

  document.addEventListener('click', (event) => {
    const detailButton = event.target.closest('[data-detail]');
    if (detailButton && !detailButton.disabled) openDetail(detailButton.dataset.detail);

    const zoomButton = event.target.closest('[data-model-zoom]');
    if (zoomButton) {
      zoomModalModel(zoomButton.dataset.modelZoom);
      return;
    }

    const closeButton = event.target.closest('[data-close-modal]');
    if (closeButton) closeDetail();

    const clearButton = event.target.closest('[data-clear-collection]');
    if (clearButton && confirm('コレクションをすべて削除しますか？')) {
      clearCollection();
      renderCollection();
      closeDetail();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDetail();
  });
});
