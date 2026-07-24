// コレクション保存用の共通処理です。
// ARページとコレクションページの両方から使います。
// 保存先はブラウザの localStorage なので、同じ端末・同じブラウザ内で記録されます。

// localStorageに保存するときの名前です。
// 変更すると、今まで保存したコレクションが読み込めなくなるので基本触らないでください。
const COLLECTION_KEY = 'oc_dinosaur_collection_v1';

function getCollection() {
  try {
    // 保存済みデータを文字列として取得します。
    const raw = localStorage.getItem(COLLECTION_KEY);

    // JSON文字列を配列に戻します。未保存なら空配列にします。
    const values = raw ? JSON.parse(raw) : [];

    // データが配列ならそのまま返し、壊れていたら空配列にします。
    return Array.isArray(values) ? values : [];
  } catch (error) {
    // 保存データが壊れていてもページが止まらないようにします。
    console.warn('collection read error', error);
    return [];
  }
}

function saveCollection(ids) {
  // 同じ恐竜IDが重複しないようにします。
  const uniqueIds = [...new Set(ids)];

  // 配列をJSON文字列にしてlocalStorageへ保存します。
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(uniqueIds));
  return uniqueIds;
}

function addToCollection(id) {
  // ARでマーカーを見つけたときに呼ばれます。
  const current = getCollection();
  if (!current.includes(id)) current.push(id);
  return saveCollection(current);
}

function removeFromCollection(id) {
  // 指定した恐竜だけ削除したい場合の関数です。現在の画面では基本未使用です。
  return saveCollection(getCollection().filter((value) => value !== id));
}

function clearCollection() {
  // コレクションを全部削除します。リセットボタンで使います。
  localStorage.removeItem(COLLECTION_KEY);
}

function findDinosaur(id) {
  // js/dinosaurs.js の一覧から、指定IDの恐竜を1件探します。
  return (window.DINOSAURS || []).find((dino) => dino.id === id);
}

// スマホの前後移動をカメラのZ座標に反映させる擬似6DoFコンポーネント
AFRAME.registerComponent('pseudo-6dof', {
  schema: {
    factor: { type: 'number', default: 0.1 } // 移動の感度
  },
  init: function () {
    this.onDeviceMotion = this.onDeviceMotion.bind(this);
    this.enabled = false;
    this.baseZ = this.el.object3D.position.z;
    this.velocityZ = 0;
  },
  play: function () {
    window.addEventListener('devicemotion', this.onDeviceMotion);
  },
  pause: function () {
    window.removeEventListener('devicemotion', this.onDeviceMotion);
  },
  onDeviceMotion: function (event) {
    if (!this.enabled || !event.acceleration) return;
    
    // スマホの前後(Z軸)方向の加速度を取得（重力加速度を除いたもの）
    const accZ = event.acceleration.z;
    
    // 微小な手の震えなどを無視するための閾値（ノイズフィルター）
    if (accZ && Math.abs(accZ) > 0.15) {
      // 簡易的に加速度を速度に変換し、位置に足し合わせる
      this.velocityZ += accZ * this.data.factor;
    }
    
    // 速度を減衰させる（動き続けないようにする）
    this.velocityZ *= 0.8;
    this.el.object3D.position.z += this.velocityZ;
    
    // 近づきすぎ・離れすぎの制限（前後2m程度）
    const maxMove = 2.0;
    if (this.el.object3D.position.z < this.baseZ - maxMove) this.el.object3D.position.z = this.baseZ - maxMove;
    if (this.el.object3D.position.z > this.baseZ + maxMove) this.el.object3D.position.z = this.baseZ + maxMove;
  },
  updateEnabled: function(isEnable) {
    this.enabled = isEnable;
    if (!isEnable) {
        // 全画面を閉じたときは元のカメラ位置にリセットする
        this.el.object3D.position.z = this.baseZ;
        this.velocityZ = 0;
    }
  }
});
