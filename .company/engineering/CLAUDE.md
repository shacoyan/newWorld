# 開発

## 役割
技術ドキュメント、設計書、デバッグログを管理する。

## メンバー一覧

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
| Engineer 8 | GLM-5.1 | 実装・コーディング |
| Engineer 9 | GLM-5.1 | 実装・コーディング |
| Reviewer 1 | GLM-5.1 | コードレビュー・品質管理 |
| Reviewer 2 | GLM-5.1 | コードレビュー・品質管理 |
| Reviewer 3 | GLM-5.1 | コードレビュー・品質管理 |
| Engineer 10 | GLM-5.1 | 統合・マージ担当 |
| Reviewer 4 | GLM-5.1 | 統合後の品質確認 |

## チーム編成

### Aチーム
| 役割 | メンバー |
|------|---------|
| 実装 | Engineer 1, 2, 3 |
| レビュー | Reviewer 1 |

### Bチーム
| 役割 | メンバー |
|------|---------|
| 実装 | Engineer 4, 5, 6 |
| レビュー | Reviewer 2 |

### Cチーム
| 役割 | メンバー |
|------|---------|
| 実装 | Engineer 7, 8, 9 |
| レビュー | Reviewer 3 |

### Dチーム（統合チーム）
| 役割 | メンバー |
|------|---------|
| 統合・マージ | Engineer 10 |
| 統合レビュー | Reviewer 4 |

## ワークフロー

```
タスク受付（秘書）
    ↓
Tech Lead（opus-4-6）が設計
    → 設計書を docs/ に保存
    → A/B/Cチームへ分担指示を作成
    ↓
A/B/Cチームが並列で実装（各チーム内でも並列）
    ↓
【各チーム内で完結するレビューサイクル】
    Aチーム: Engineer 1,2,3 実装 → Reviewer 1 レビュー
             バグあり → チーム内エンジニアが修正 → 再レビュー
             問題なし → Dチームへ提出

    Bチーム: Engineer 4,5,6 実装 → Reviewer 2 レビュー
             バグあり → チーム内エンジニアが修正 → 再レビュー
             問題なし → Dチームへ提出

    Cチーム: Engineer 7,8,9 実装 → Reviewer 3 レビュー
             バグあり → チーム内エンジニアが修正 → 再レビュー
             問題なし → Dチームへ提出
    ↓
【Dチーム：統合フェーズ】
    Engineer 10 が A/B/Cチームの成果物を受け取り統合・マージ
    → Reviewer 4 が統合後のコードを確認
    → 問題あり → Engineer 10 が修正 → 再確認
    → 問題なし → Tech Lead へ提出
    ↓
Tech Lead が最終承認
    ↓
完了報告（秘書のTODOに記録）
```

## GLM メンバーの呼び出し方

Engineer 1〜10 / Reviewer 1〜4 は全て GLM-5.1（Z.AI）で動作する。実行時は以下のように呼び出す:

```bash
# .env を読み込んでからスクリプトを実行
export $(cat .env | xargs) && echo "タスク内容" | node tools/glm_engineer.js --role "Engineer 2" --system "システムプロンプト"
# レビュアーの場合
export $(cat .env | xargs) && echo "レビュー対象コード" | node tools/glm_engineer.js --role "Reviewer 1" --system "シニアエンジニアとしてレビューしてください"
# Dチーム統合の場合
export $(cat .env | xargs) && echo "統合対象コード一式" | node tools/glm_engineer.js --role "Engineer 10" --system "A/B/Cチームの成果物を統合・マージしてください"
```

- `--role`: Engineer 1〜10 または Reviewer 1〜4 を指定
- `--system`: その役割に応じたシステムプロンプト
- タスク内容は stdin から渡す

## ルール

### Tech Lead の行動原則
- **Tech Lead は原則コードを書かない。** よっぽどの緊急事態（エンジニアでは対応不可能な構造的問題等）以外はコードに触れない。
- Tech Lead の仕事は「何を・どのように作るか」を明確に言語化し、各チームへ詳細な実装指示を渡すこと。
- 指示は曖昧にしない。対象ファイル・関数・行番号・期待する動作を具体的に記述する。
- バグや不具合を発見した場合も、自分で直さず「修正一覧」を作成して担当チームに渡す。

### 実装・レビューのルール
- タスクは必ずTech Leadの設計フェーズから始める
- 設計書は `docs/YYYY-MM-DD-feature-name.md`
- デバッグログは `debug-log/YYYY-MM-DD-issue-name.md`
- 設計書は必ず「概要」「設計・方針」「詳細」「分担」の構成にする
- バグ修正時は「再発防止」セクションを必ず記入
- 技術的な意思決定は secretary/notes/ に意思決定ログとして残す
- 各チームのエンジニアは並列で実装に専念する
- 各チームのレビュアーは実装完了後にレビューし、バグはチーム内で修正してから Dチーム へ提出
- **チーム内でレビュー→修正→再レビューが完結してから、Dチームへ渡す**
- Dチームは A/B/C の全成果物を受け取り統合し、Reviewer 4 の確認後に Tech Lead へ提出
- **Tech Lead への直接提出は Dチームのみ**。A/B/C は必ず Dチームを経由する

## フォルダ構成
- `docs/` - 技術ドキュメント・設計書（Tech Lead作成）
- `debug-log/` - デバッグ・バグ調査ログ
