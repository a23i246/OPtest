# 恐竜ARスタンプラリー Web版

オープンキャンパス用のWebARスタンプラリー雛形です。

## 構成

- `index.html`: QRで開くトップ。モデル等を事前読み込みし、進行率を表示します。
- `ar.html`: AR専用ページ。AR.js + A-Frameでマーカー認識します。
- `collection.html`: localStorageに保存したコレクションを表示します。
- `game.html`: 読み込み待ち用の簡易ゲームです。
- `assets/models`: GLBモデル
- `assets/markers`: AR.js用 `.patt` マーカー
- `assets/images`: マーカー画像
- `js/dinosaurs.js`: 恐竜名、説明、モデル、マーカーの対応表

## マーカー対応

- `st.patt`: お試しマーカー
- `st1.patt`〜`st6.patt`: 恐竜6体

## 編集する場所

恐竜名や説明を変える場合は、`js/dinosaurs.js` を編集してください。


## 友人がコレクションページを編集する場合

コメントを多めに入れたファイルは以下です。

- `collection.html`: 画面のHTML構造
- `js/dinosaurs.js`: 恐竜データの対応表
- `js/collection-page.js`: カード表示・詳細モーダル・リセット処理
- `js/collection.js`: コレクション保存処理
- `css/common.css`: カードやモーダルの見た目

詳しくは `COLLECTION_EDIT_GUIDE.md` を見てください。

## 起動方法

ローカルで確認するときは、直接HTMLを開かず、簡易サーバーを使ってください。

```bash
python -m http.server 8000
```

その後、ブラウザで次を開きます。

```txt
http://localhost:8000
```

スマホ実機で確認する場合は、GitHub Pages / Vercel / Netlify などHTTPSで公開してください。
カメラ利用にはHTTPSが必要です。

## 注意

このプロジェクトはA-FrameとAR.jsをCDNから読み込んでいます。
初回アクセス時はインターネット接続が必要です。
会場Wi-Fiでトップページを開き、読み込み完了後にARへ進む運用を想定しています。

現在のモデル合計は約108MBあり、WebARとしては重めです。
本番運用ではGLBを軽量化し、合計20〜30MB程度に抑えることを推奨します。

## collection.html が開けない場合

AR画面からコレクションを押して `ERR_FAILED` になる場合は、サーバーを起動しているフォルダが違う可能性があります。
PowerShellで必ず `index.html`、`ar.html`、`collection.html` が見えるフォルダに移動してから起動してください。

```powershell
cd C:\oc_project
 dir
npx serve . -l 3000
```

`dir` で `collection.html` が表示されない場合は、1つ下の `oc_project` フォルダに入ってください。

```powershell
cd C:\oc_project\oc_project
npx serve . -l 3000
```

ファイル名は小文字の `ar.html` に統一しています。公開サーバーでは大文字小文字が区別される場合があるため、リンクも小文字に統一してください。


## マーカー対応表（2026-06更新）

- st.patt: お試しマーカー
- st1.patt: プロトケラトプス / protoceratops.glb
- st2.patt: ラウジャア / ravjaa.glb
- st3.patt: コリトサウルス / corythosaurus.glb
- st4.patt: サヴァケファレ / zavacephale.glb
- st5.patt: ピナコサウルス / pinacosaurus.glb（pinacosaurus名のGLBがないため仮対応）
- st6.patt: タルボサウルス / torikosaurusu.glb（tarbosaurus名のGLBがないため仮対応）
