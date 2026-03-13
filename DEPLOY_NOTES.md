# デプロイ・反映メモ（EXECUTIVE COMPASS）

## ★ EXECUTIVE COMPASS だけ反映する（推奨）

**松尾くんリポジトリ全体を push すると時間がかかるので、この LP だけ反映したいときは次の手順だけ使う。**

1. ターミナルで **このフォルダ** に移動する  
   `cd "Aqua Voice/EXECUTIVE _COMPASS"`（松尾くんのルートから）
2. 変更を追加: `git add -A`
3. コミット: `git commit -m "メッセージ"`
4. プッシュ: `git push origin main`

→ **EC_demo** にだけ push され、数秒〜数十秒で終わる。松尾くん（HR-DOC-SUITE）側は触らない。

**やってはいけない**: 松尾くんのルートで `git add .` や `git push` をすると、他のプロジェクトまで含まれて時間がかかる。

---

## プッシュ先
- **リポジトリ**: https://github.com/Oota-0505/EC_demo
- **ブランチ**: `main`
- **ローカル**: `Aqua Voice/EXECUTIVE _COMPASS/` が独立した Git リポジトリ

---

## 変更が反映されない主な原因と対処

### 1. **ブラウザキャッシュ**
- **原因**: 古い CSS/JS/画像がキャッシュで表示される。
- **対処**:
  - スーパーリロード: **Mac** `Cmd + Shift + R` / **Windows** `Ctrl + Shift + R`
  - 開発者ツール → Network で「Disable cache」にチェックしてリロード
  - シークレットウィンドウで開き直す

### 2. **CDN・ホスティング側のキャッシュ**
- **原因**: GitHub Pages / Netlify / サーバーなどが静的ファイルをキャッシュしている。
- **対処**:
  - デプロイ完了後、数分待ってから再確認
  - 管理画面で「キャッシュのパージ」「再デプロイ」を実行
  - 必要なら `index.html` の CSS/JS にクエリ付与（例: `style.css?v=2`）してキャッシュを外す

### 3. **デプロイがまだ走っていない**
- **原因**: push しても、GitHub Pages / CI のビルドが未実行 or 失敗している。
- **対処**:
  - GitHub の Actions や Deploy タブでジョブの成功・失敗を確認
  - 失敗している場合はログでエラーを確認して修正

### 4. **参照しているリポジトリ・ブランチが違う**
- **原因**: 本番環境が別ブランチや別リポジトリを参照している。
- **対処**:
  - デプロイ設定で「どのリポジトリ・どのブランチから公開するか」を確認
  - EXECUTIVE COMPASS は **EC_demo の main** に push しているので、その組み合わせになっているか確認

### 5. **親リポジトリに EXECUTIVE _COMPASS の「中身」が含まれていない**
- **原因**: 松尾くんリポジトリ（HR-DOC-SUITE）で `Aqua Voice/` を add すると、EXECUTIVE _COMPASS は**別 Git のため「サブモジュール参照」だけ**入り、ファイルの中身は push されない。
- **対処**:
  - 本番用の更新は **必ず `Aqua Voice/EXECUTIVE _COMPASS` フォルダ内で** `git add` → `commit` → `git push origin main`（EC_demo へ）する。
  - 親リポジトリ側で EXECUTIVE COMPASS のファイルも含めて管理したい場合は、EXECUTIVE _COMPASS 内の `.git` を削除してから親で add する必要がある（通常は EC_demo 単体で push すれば十分）。

### 6. **パス・ファイル名の違い**
- **原因**: 本番環境のディレクトリ構成や、大文字・スペース入りフォルダ名（`EXECUTIVE _COMPASS`）の扱いが違う。
- **対処**:
  - 本番の URL（例: `https://xxx.github.io/EC_demo/`）で、`index.html` や `css/style.css` に直接アクセスできるか確認
  - 404 になる場合は、デプロイ設定の「公開ルート」や「Base URL」を確認

### 7. **CSS/JS の読み込みパス**
- **原因**: `index.html` が `css/style.css` を相対パスで読んでいるため、サブディレクトリで開くと 404 になる。
- **対処**:
  - GitHub Pages で「プロジェクトサイト」なら `https://ユーザー名.github.io/EC_demo/` がルートになるので、相対パス `css/style.css` で問題ない。
  - サブディレクトリに置く場合は、`/EC_demo/css/style.css` のようにルート相対パスに変更する必要がある場合あり。

---

## すんなり反映された場合
- 上記のどれにも当てはまらなければ、**キャッシュを消してのリロード**や**デプロイ完了待ち**で解決することが多いです。
- 問題が続く場合は、**どの環境（ローカル / GitHub Pages / 他サーバー）で、どのファイル（HTML/CSS/JS/画像）が反映されていないか**をメモしておくと原因の特定がしやすくなります。
