# デプロイ・反映メモ（EXECUTIVE COMPASS）

## いまの構成（ここを押さえると混乱しにくい）

| 場所 | 役割 |
|------|------|
| **`Aqua Voice/EXECUTIVE _COMPASS/`** | 普段いじる LP の実体（HTML / CSS / JS / 画像）。**このフォルダ単体には `.git` がない。** |
| **松尾くんリポジトリのルート** | **GitHub `Oota-0505/HR-DOC-SUITE`** の `main`。バックアップ・履歴の本体。 |
| **`/.ec-demo-sync-worktree/`**（松尾くんルート直下） | **GitHub `Oota-0505/EC_demo`** と同じ中身用の作業場所。ここから **`ec-demo` に push** する。 |
| **Cloudflare Pages プロジェクト `ec-demo2`** | **`EC_demo` の `main`** を見ている。ここに push されて初めて本番 URL が更新される。 |

**だから二段階になる:** 親で保存（HR-DOC-SUITE）→ ワークツリーにコピーして EC_demo に push（本番）。**親だけ push しても Cloudflare は変わらない。**

---

## 前提チェック（初回だけ）

- 松尾くんのルートが Git で **`origin` → HR-DOC-SUITE** になっている。
- 同じルートで **`git remote add ec-demo https://github.com/Oota-0505/EC_demo.git`** が済んでいる（済んでいれば不要）。
- **`/Users/monet/Documents/松尾くん/.ec-demo-sync-worktree`** が存在し、その中で `git remote -v` に **`ec-demo`** が出る。  
  ※別マシンにしたら、下のコマンドの **`REPO=`** だけ書き換える。

---

## ★ 毎回やること（コピペ用）

**`COMMIT_MSG` を毎回の内容に変えてから**、ターミナルに貼り付けて実行する。

### 1）親リポジトリに保存（HR-DOC-SUITE）

```bash
REPO="/Users/monet/Documents/松尾くん"
COMMIT_MSG="EXECUTIVE COMPASS: （ここに変更内容）"

cd "$REPO" || exit 1
git add "Aqua Voice/EXECUTIVE _COMPASS/"
git status
git commit -m "$COMMIT_MSG"
git push origin main
```

### 2）本番用に EC_demo へ反映（Cloudflare `ec-demo2` が拾う）

```bash
REPO="/Users/monet/Documents/松尾くん"
LP="$REPO/Aqua Voice/EXECUTIVE _COMPASS"
WT="$REPO/.ec-demo-sync-worktree"
COMMIT_MSG="EXECUTIVE COMPASS: （親と同じ趣旨でよい）"

cd "$WT" || exit 1
git fetch ec-demo
git checkout -B lp-sync ec-demo/main
rsync -av --delete \
  --exclude='.git' \
  --exclude='.DS_Store' \
  "$LP/" "$WT/"
git add -A
git status
git commit -m "$COMMIT_MSG"
git push ec-demo HEAD:main
```

→ 数分以内に Cloudflare の **Deployments** に新しいコミットが出る。本番 URL（例: `ec-demo2.pages.dev`）を開き直す。

### 3）中身はそのまま、デプロイだけもう一度走らせたいとき

GitHub には既に最新が載っているのに、Cloudflare の一覧が古いコミットのままなどのとき。

```bash
WT="/Users/monet/Documents/松尾くん/.ec-demo-sync-worktree"
cd "$WT" || exit 1
git fetch ec-demo
git checkout lp-sync
git pull ec-demo main --ff-only
git commit --allow-empty -m "chore: Cloudflare Pages デプロイ再トリガー"
git push ec-demo HEAD:main
```

---

## プッシュ先の整理

| 操作 | リモート | 本番への影響 |
|------|-----------|----------------|
| `git push origin main`（松尾くんルート） | **HR-DOC-SUITE** | コード共有・バックアップ。**Cloudflare 自動では変わらない。** |
| `git push ec-demo HEAD:main`（ワークツリー内） | **EC_demo** | **Cloudflare Pages（ec-demo2）がビルド・公開。** |

---

## 変更が反映されないとき

### ブラウザ

- **スーパーリロード**: Mac `Cmd + Shift + R` / Windows `Ctrl + Shift + R`
- 開発者ツール → Network → **Disable cache** で再読み込み

### Cloudflare

- **Deployments** に、さきほど push した **コミットハッシュ**が載っているか確認する。
- 載っていない: GitHub の **EC_demo / main** と、Pages の **接続リポジトリ**が同じか確認。
- 載っているのに古い表示: ビルド完了待ち、または上記 **「3）デプロイ再トリガー」** を実行。

### よくある勘違い

- **`EXECUTIVE _COMPASS` だけ `cd` して `git push`**: そのフォルダは **独立 Git ではない**ので、この手順は使えない。必ず **松尾くんルート**と **`.ec-demo-sync-worktree`** のコマンドを使う。
- **親で `git add .`**: 他プロジェクトまで入る。LP だけなら **`Aqua Voice/EXECUTIVE _COMPASS/`** に限定する。

### パス・404

- 公開 URL が **リポジトリルート＝サイトルート**（Cloudflare Pages の一般的な設定）なら、`index.html` からの `css/style.css` など **相対パスで問題ない**。
- サブディレクトリ配下だけ公開している場合は、ホスト側の「ルートディレクトリ」設定とパスを合わせる。

---

## すんなり反映された場合

- 上記のどれにも当てはまらなければ、**キャッシュ**か**デプロイ待ち**で直ることが多い。
- 続く場合は **Cloudflare の該当デプロイのログ**と、**反映されていないファイル名**をメモしておくと原因が切り分けしやすい。
