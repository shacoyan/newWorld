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
| Engineer 4 | GLM-5.1 | コードレビュー・品質管理 |
| Engineer 5 | GLM-5.1 | コードレビュー・品質管理 |

## ワークフロー

```
タスク受付（秘書）
    ↓
Tech Lead（opus-4-6）が設計
    → 設計書を docs/ に保存
    ↓
Engineer 1 & 2 & 3（GLM-5.1）が並列実装
    → 成果物をコードまたは docs/ に反映
    ↓
Engineer 3 & 4 & 5（GLM-5.1）が並列でコードレビュー
    → node tools/glm_engineer.js でGLMを呼び出す
    → フィードバックを Engineer 1 & 2 に共有
    ↓
Tech Lead が最終承認
    ↓
完了報告（秘書のTODOに記録）
```

## GLM エンジニアの呼び出し方

Engineer 2, 3, 4, 5 は GLM-5.1（Z.AI）で動作する。実行時は以下のように呼び出す:

```bash
# .env を読み込んでからスクリプトを実行
export $(cat .env | xargs) && echo "タスク内容" | node tools/glm_engineer.js --role "Engineer 2" --system "システムプロンプト"
```

- `--role`: Engineer 2 / Engineer 3 / Engineer 4 / Engineer 5
- `--system`: そのエンジニアの役割に応じたシステムプロンプト
- タスク内容は stdin から渡す

## ルール
- タスクは必ずTech Leadの設計フェーズから始める
- 設計書は `docs/YYYY-MM-DD-feature-name.md`
- デバッグログは `debug-log/YYYY-MM-DD-issue-name.md`
- 設計書は必ず「概要」「設計・方針」「詳細」「分担」の構成にする
- バグ修正時は「再発防止」セクションを必ず記入
- 技術的な意思決定は secretary/notes/ に意思決定ログとして残す
- Engineer 1, 2 & 3 は設計書をもとに並列で実装に専念する
- Engineer 4 & 5 は実装完了後に並列でレビューを行い、フィードバックをまとめる

## フォルダ構成
- `docs/` - 技術ドキュメント・設計書（Tech Lead作成）
- `debug-log/` - デバッグ・バグ調査ログ
