第０創薬化学研究所　試験公開サイト（職員専用ページ更新版）

【設置方法】
ZIPを解凍し、index.html、各サブページ（.html）、css、js、image フォルダを
すべて同じ階層のままサーバーにアップロードしてください。

【ページ構成】
index.html         トップページ
about.html         私たちについて（作成中）
solutions.html     ソリューション（作成中）
news.html          ニュース（作成中）
reports.html       研究レポート（作成中）
staff.html         職員専用（パスワード入力）

【謎解き画像】
次の名前で画像を image フォルダへ配置してください。
  image/Security_1.png
  image/Security_2.png
  image/Security_3.png
  image/Security_4.png
  image/Security_5.png
  image/Security_6.png
枚数は任意です。Security_1.png から欠番なく連番にしてください。
HTMLがファイルの存在を順番に調べ、枚数を自動認識します（最大30枚）。
画像を置かない場合は「案内画像は現在準備中です。」と表示されます。
画像の縦横比は自由です。画面内に全体が収まるように表示します。

【正解パスワード】
正解は archives です。
大文字・小文字、半角・全角は区別せずに判定します。
例：archives / ARCHIVES / ａｒｃｈｉｖｅｓ / ＡＲＣＨＩＶＥＳ / 混在入力
入力前後に入った空白も無視します。
正解すると認証完了メッセージを表示します。
今後変更する場合は js/staff.js の STAFF_PASSWORD を編集してください。

【ロゴなど】
image/soyaku_logo.png      研究所ロゴ
image/hero_laboratory.svg  トップページ図版

【注意事項】
このパスワード判定は謎解き演出用のブラウザ内判定です。
ソースを調べればパスワードや認証後の表示を確認できます。
機密データを置く本当のアクセス制限には使用しないでください。
その場合はサーバー側での認証が必要です。
