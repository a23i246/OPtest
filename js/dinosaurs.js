// 恐竜データの対応表です。
// 友人が恐竜名・説明・画像・3Dモデルを変える場合は、基本このファイルを編集します。

// collectionFitTarget : コレクション詳細画面で自動フィットさせる大きさ。大きく見せたい場合はここを上げます。
// collectionDistance  : コレクション詳細画面でカメラからどれくらい奥に置くか。
// collectionYOffset   : コレクション詳細画面で上下位置を少しだけ調整します。下に寄る場合は少し上げます。
// collectionRotation  : コレクション詳細画面を開いた直後の向き。正面がずれる場合はYの数字を調整します。
// collectionCameraZ   : コレクション詳細画面のカメラ位置。モデルの中に入り込む場合は大きくします。

window.DINOSAURS = [
  {
    id: 'protoceratops',
    name: 'プロトケラトプス',
    marker: 'assets/markers/pattern-stanp1.patt',
    markerImage: 'assets/images/pattern-stanp1.png',
    model: 'assets/models/protoceratops.glb',
    url: 'https://ja.wikipedia.org/wiki/%E3%83%97%E3%83%AD%E3%83%88%E3%82%B1%E3%83%A9%E3%83%88%E3%83%97%E3%82%B9',
    description: 'プロトケラトプスがARマーカーから飛び出して、君のコレクションに加わりました。フリルのある頭部が特徴的な恐竜です。',
    collectionFitTarget: 2.35,
    collectionDistance: 3.1,
    collectionYOffset: 0.04,
    collectionRotation: '0 0 0',
    arFitTarget: 1.45,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0.05     // ⭕ AR画面での上下位置
  },
  {
    id: 'ravjaa',
    name: 'ラウジャア',
    marker: 'assets/markers/pattern-stanp2.patt',
    markerImage: 'assets/images/pattern-stanp2.png',
    model: 'assets/models/ravjaa.glb',
    url: 'https://www.ous.ac.jp/common/files//202504071232270270933.pdf',
    description: 'ラウジャアがARマーカーから飛び出して、君のコレクションに加わりました。指で回して姿を確認してみましょう。',
    collectionFitTarget: 2.45,
    collectionDistance: 3.1,
    collectionYOffset: 0.06,
    collectionRotation: '0 0 0',
    arFitTarget: 1.25,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0.05     // ⭕ AR画面での上下位置
  },
  {
    id: 'corythosaurus',
    name: 'コリトサウルス',
    marker: 'assets/markers/pattern-stanp3.patt',
    markerImage: 'assets/images/pattern-stanp3.png',
    model: 'assets/models/corythosaurus.glb',
    url: 'https://www.ous.ac.jp/common/files//202210281320210885382.pdf',
    description: 'コリトサウルスがARマーカーから飛び出して、君のコレクションに加わりました。頭の大きなトサカが特徴的です。',
    collectionFitTarget: 2.45,
    collectionDistance: 3.1,
    collectionYOffset: 0.04,
    collectionRotation: '0 0 0',
    arFitTarget: 5.25,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0.05     // ⭕ AR画面での上下位置
  },
  {
    id: 'zavacephale',
    name: 'サヴァケファレ',
    marker: 'assets/markers/pattern-stanp4.patt',
    markerImage: 'assets/images/pattern-stanp4.png',
    model: 'assets/models/zavacephale.glb',
    url: 'https://blob-storage.f-portal.pref.fukushima.lg.jp/common-article/68d64086d6595221ff0b346d/20250918+%E6%9C%80%E5%8F%A4%E3%81%AE%E9%A0%AD%E7%AA%81%E3%81%8D%E6%81%90%E7%AB%9C%E5%8C%96%E7%9F%B3%E3%82%92%E6%96%B0%E5%B1%9E%E6%96%B0%E7%A8%AE%E3%80%8C%E3%82%B6%E3%83%B4%E3%82%A1%E3%82%B1%E3%83%95%E3%82%A1%E3%83%AC%E3%83%BB%E3%83%AA%E3%83%B3%E3%83%9D%E3%83%81%E3%82%A7%E3%80%8D%E3%82%92%E7%99%BA%E8%A6%8B+HP%E7%94%A8+%281%29-cleaned%281%29.pdf',
    description: 'サヴァケファレがARマーカーから飛び出して、君のコレクションに加わりました。丸みのある頭部に注目してみましょう。',
    collectionFitTarget: 1.35,
    collectionDistance: 5.4,
    collectionYOffset: 0.12,
    collectionCameraZ: 4.8,
    collectionRotation: '0 0 0',
    arFitTarget: 1.25,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0.05     // ⭕ AR画面での上下位置
  },
  {
    id: 'pinacosaurus',
    name: 'ピナコサウルス',
    marker: 'assets/markers/pattern-stanp5.patt',
    markerImage: 'assets/images/pattern-stanp5.png',
    model: 'assets/models/raujaa.glb',
    url: '',
    description: 'ピナコサウルスがARマーカーから飛び出して、君のコレクションに加わりました。※現在のファイル内にpinacosaurus名のGLBがないため、近い候補としてraujaa.glbを割り当てています。',
    collectionFitTarget: 2.45,
    collectionDistance: 3.1,
    collectionYOffset: 0.06,
    collectionRotation: '0 0 0',
    arFitTarget: 1.25,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0.05     // ⭕ AR画面での上下位置
  },
  {
    id: 'tarbosaurus',
    name: 'タルボサウルス',
    marker: 'assets/markers/pattern-stanp6.patt',
    markerImage: 'assets/images/pattern-stanp6.png',
    model: 'assets/models/torikosaurusu.glb',
    url: '',
    description: 'タルボサウルスがARマーカーから飛び出して、君のコレクションに加わりました。※現在のファイル内にtarbosaurus名のGLBがないため、近い候補としてtorikosaurusu.glbを割り当てています。',
    collectionFitTarget: 2.45,
    collectionDistance: 3.1,
    collectionYOffset: 0.04,
    collectionRotation: '0 0 0',
    arFitTarget: 1.25,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0.05     // ⭕ AR画面での上下位置
  }
];

window.TRIAL_MARKER = {
  name: 'お試しマーカー',
  marker: 'assets/markers/pattern-stanp.patt',
  markerImage: 'assets/images/pattern-stanp.png'
};