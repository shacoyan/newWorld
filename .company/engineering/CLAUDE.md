# 開発

## 役割
技術ドキュメント、設計書、デバッグログを管理する。

## チーム構成

| 役割 | モデル | 担当 |
|------|-------|------|
| Tech Lead | claude-opus-4-6 | 設計・アーキテクチャ・技術判断 |
| Engineer 1 | GLM-5.1 | 実装・コーディング |
| Engineer 2 | GLM-5.1 | 実装・コーディング |
| Engineer 3 | GLM-5.1 | 実装・コーディング |
| Engineer 4 | GLM-5.1 | 実装・コーディング |
| Engineer 5 | GLM-5.1 | 実装・コーディング |
| Engineer 6 | GLM-5.1 | 実装・コーディング |
| Engineer 7 | GLM-5.1 | 実装・コーディング |
| Reviewer 8  | GLM-5.1 | コードレビュー・品質管理 |
| Reviewer 9  | GLM-5.1 | コードレビュー・品質管理 |
| Reviewer 10 | GLM-5.1 | コードレビュー・品質管理 |

## ワークフロー

```
タスク受付（秘書）
    ↓
Tech Lead（opus-4-6）が設計
    → 設計書を docs/ に保存
    ↓
Engineer 1〜7（GLM-5.1）が並列実装
    → 成果物をコードまたは docs/ に反映
    ↓
Reviewer 8〜10（GLM-5.1）が並列でコードレビュー
    → node tools/glm_engineer.js でGLMを呼び出す
    → フィードバックを実装エンジニアに共有
    ↓
Tech Lead が最終承認
    ↓
完了報告（秘書のTODOに記録）
```

## GLM メンバーの呼び出し方

Engineer 1〜7 / Reviewer 8〜10 は全て GLM-5.1（Z.AI）で動作する。実行時は以下のように呼び出す:

```bash
# .env を読み込んでからスクリプトを実行
export $(cat .env | xargs) && echo "タスク内容" | node tools/glm_engineer.js --role "Engineer 2" --system "システムプロンプト"
# レビュアーの場合
export $(cat .env | xargs) && echo "レビュー対象コード" | node tools/glm_engineer.js --role "Reviewer 8" --system "シニアエンジニアとしてレビューしてください"
```

- `--role`: Engineer 1〜7 または Reviewer 8〜10 を指定
- `--system`: その役割に応じたシステムプロンプト
- タスク内容は stdin から渡す

## ルール

### Tech Lead の行動原則
- **Tech Lead は原則コードを書かない。** よっぽどの緊急事態（エンジニアでは対応不可能な構造的問題等）以外はコードに触れない。
- Tech Lead の仕事は「何を・どのように作るか」を明確に言語化し、Engineer 1〜7 に詳細な実装指示を渡すこと。
- 指示は曖昧にしない。対象ファイル・関数・行番号・期待する動作を具体的に記述する。
- バグや不具合を発見した場合も、自分で直さず「修正一覧」を作成して Engineer に渡す。

### 実装・レビューのルール
- タスクは必ずTech Leadの設計フェーズから始める
- 設計書は `docs/YYYY-MM-DD-feature-name.md`
- デバッグログは `debug-log/YYYY-MM-DD-issue-name.md`
- 設計書は必ず「概要」「設計・方針」「詳細」「分担」の構成にする
- バグ修正時は「再発防止」セクションを必ず記入
- 技術的な意思決定は secretary/notes/ に意思決定ログとして残す
- Engineer 1〜7 は Tech Lead の詳細指示をもとに並列で実装に専念する
- Reviewer 8〜10 は実装完了後に並列でレビューを行い、フィードバックをまとめる
- レビューで問題が出た場合 → Tech Lead が修正指示を作成 → Engineer 1〜7 が修正

## フォルダ構成
- `docs/` - 技術ドキュメント・設計書（Tech Lead作成）
- `debug-log/` - デバッグ・バグ調査ログ
