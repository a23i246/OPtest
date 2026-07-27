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
