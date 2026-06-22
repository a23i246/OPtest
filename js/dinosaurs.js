// 恐竜データの対応表です。
// 友人が恐竜名・説明・画像・3Dモデルを変える場合は、基本このファイルを編集します。

// collectionFitTarget : コレクション詳細画面で自動フィットさせる大きさ。大きく見せたい場合はここを上げます。
// collectionDistance  : コレクション詳細画面でカメラからどれくらい奥に置くか。
// collectionYOffset   : コレクション詳細画面で上下位置を少しだけ調整します。下に寄る場合は少し上げます。
// collectionRotation  : コレクション詳細画面を開いた直後の向き。正面がずれる場合はYの数字を調整します。
// collectionCameraZ   : コレクション詳細画面のカメラ位置。モデルの中に入り込む場合は大きくします。
// arFitTarget          : ARでfit-gltf-on-markerがモデルを自動フィットさせる基準サイズ。
// arYOffset            : モデル本体を足元基準で少し上下させる微調整。
// arControlBaseScale   : AR下部パネルの「サイズ 0.00」のときに使う倍率。
// arControlBaseYOffset : AR下部パネルの「上下 0.00」のときに使う上下位置。

window.DINOSAURS = [
  {
    id: 'protoceratops',
    name: 'プロトケラトプス',
    marker: 'assets/markers/st1.patt',
    markerImage: 'assets/images/st1.png',
    model: 'assets/models/protoceratops.glb',
    url: 'https://ja.wikipedia.org/wiki/%E3%83%97%E3%83%AD%E3%83%88%E3%82%B1%E3%83%A9%E3%83%88%E3%83%97%E3%82%B9',
    description: 'プロトケラトプスがARマーカーから飛び出して、君のコレクションに加わりました。フリルのある頭部が特徴的な恐竜です。',
    collectionFitTarget: 2.35,
    collectionDistance: 3.1,
    collectionYOffset: 0.04,
    collectionRotation: '0 0 0',
    arFitTarget: 1.45,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0,    // ⭕ AR画面での上下位置
    arControlBaseScale: 4.00,      // ⭕ 下部パネルで「サイズ 0.00」と表示する基準倍率
    arControlBaseYOffset: -0.03    // ⭕ 下部パネルで「上下 0.00」と表示する基準位置
  },
  {
    id: 'ravjaa',
    name: 'ラウジャア',
    marker: 'assets/markers/st2.patt',
    markerImage: 'assets/images/st2.png',
    model: 'assets/models/ravjaa.glb',
    url: 'https://www.ous.ac.jp/common/files//202504071232270270933.pdf',
    description: 'ラウジャアがARマーカーから飛び出して、君のコレクションに加わりました。指で回して姿を確認してみましょう。',
    collectionFitTarget: 2.45,
    collectionDistance: 3.1,
    collectionYOffset: 0.06,
    collectionRotation: '0 0 0',
    arFitTarget: 20,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0,     // ⭕ AR画面での上下位置（足元補正後は大きいマイナス値を使わない）
    arControlBaseScale: 1.00,
    arControlBaseYOffset: 0.00
  },
  {
    id: 'corythosaurus',
    name: 'コリトサウルス',
    marker: 'assets/markers/st3.patt',
    markerImage: 'assets/images/st3.png',
    model: 'assets/models/corythosaurus.glb',
    url: 'https://www.ous.ac.jp/common/files//202210281320210885382.pdf',
    description: 'コリトサウルスがARマーカーから飛び出して、君のコレクションに加わりました。頭の大きなトサカが特徴的です。',
    collectionFitTarget: 2.45,
    collectionDistance: 3.1,
    collectionYOffset: 0.04,
    collectionRotation: '0 0 0',
    arFitTarget: 20,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0,     // ⭕ AR画面での上下位置（足元補正後は大きいマイナス値を使わない）
    arControlBaseScale: 1.00,
    arControlBaseYOffset: 0.00
  },
  {
    id: 'zavacephale',
    name: 'サヴァケファレ',
    marker: 'assets/markers/st4.patt',
    markerImage: 'assets/images/st4.png',
    model: 'assets/models/zavacephale.glb',
    url: 'https://blob-storage.f-portal.pref.fukushima.lg.jp/common-article/68d64086d6595221ff0b346d/20250918+%E6%9C%80%E5%8F%A4%E3%81%AE%E9%A0%AD%E7%AA%81%E3%81%8D%E6%81%90%E7%AB%9C%E5%8C%96%E7%9F%B3%E3%82%92%E6%96%B0%E5%B1%9E%E6%96%B0%E7%A8%AE%E3%80%8C%E3%82%B6%E3%83%B4%E3%82%A1%E3%82%B1%E3%83%95%E3%82%A1%E3%83%AC%E3%83%BB%E3%83%AA%E3%83%B3%E3%83%9D%E3%83%81%E3%82%A7%E3%80%8D%E3%82%92%E7%99%BA%E8%A6%8B+HP%E7%94%A8+%281%29-cleaned%281%29.pdf',
    description: 'サヴァケファレがARマーカーから飛び出して、君のコレクションに加わりました。丸みのある頭部に注目してみましょう。',
    collectionFitTarget: 1.35,
    collectionDistance: 5.4,
    collectionYOffset: 0.12,
    collectionCameraZ: 4.8,
    collectionRotation: '0 0 0',
    arFitTarget: 10,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0,    // ⭕ AR画面での上下位置
    arControlBaseScale: 0.20,      // ⭕ 写真で合わせた値。画面ではこれを「サイズ 0.00」として扱う
    arControlBaseYOffset: -0.07    // ⭕ 写真で合わせた値。画面ではこれを「上下 0.00」として扱う
  },
  {
    id: 'pinacosaurus',
    name: 'ピナコサウルス',
    marker: 'assets/markers/st5.patt',
    markerImage: 'assets/images/st5.png',
    model: 'assets/models/pinacosaurus.glb',
    url: '',
    description: 'ピナコサウルスがARマーカーから飛び出して、君のコレクションに加わりました。※現在のファイル内にpinacosaurus名のGLBがないため、近い候補としてraujaa.glbを割り当てています。',
    collectionFitTarget: 2.45,
    collectionDistance: 3.1,
    collectionYOffset: 0.06,
    collectionRotation: '0 0 0',
    arFitTarget: 10,  // ⭕ AR画面での3Dモデルの大きさ
    //arFitTarget: 1.25,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0.02,  // ⭕ AR画面での上下位置
    arControlBaseScale: 1.00,
    arControlBaseYOffset: 0.00
  },
  {
    id: 'tarbosaurus',
    name: 'タルボサウルス',
    marker: 'assets/markers/st6.patt',
    markerImage: 'assets/images/st6.png',
    model: 'assets/models/torikosaurusu.glb',
    url: '',
    description: 'タルボサウルスがARマーカーから飛び出して、君のコレクションに加わりました。※現在のファイル内にtarbosaurus名のGLBがないため、近い候補としてtorikosaurusu.glbを割り当てています。',
    collectionFitTarget: 2.45,
    collectionDistance: 3.1,
    collectionYOffset: 0.04,
    collectionRotation: '0 0 0',
    // ⭕ タルボサウルス用のGLBは元データの見た目が大きいため、初期値を小さめにしています。
    arFitTarget: 0.08,  // ⭕ AR画面での3Dモデルの大きさ
    arYOffset: 0,     // ⭕ AR画面での上下位置（足元補正後は大きいマイナス値を使わない）
    arControlBaseScale: 0.20,
    arControlBaseYOffset: -0.03
  }
];

window.TRIAL_MARKER = {
  name: 'お試しマーカー',
  marker: 'assets/markers/st.patt',
  markerImage: 'assets/images/st.png'
};
