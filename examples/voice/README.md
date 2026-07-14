# Zeta Voice

Zeta の Markdown 応答を台本として解釈し、VOICEVOX で参加型オーディオドラマとして再生する Bun の Web example です。

## 必要なもの

- Bun
- 起動済みの [VOICEVOX Engine](https://github.com/VOICEVOX/voicevox_engine)（既定: `http://127.0.0.1:50021`）
- Zeta のアクセストークンと、既存のルーム ID

## セットアップ

```bash
cd examples/voice
bun install
cp .env.example .env
```

`.env` に `ZETA_TOKEN`、`ZETA_REFRESH_TOKEN`、`ZETA_DEVICE_ID`、`ZETA_ROOM_ID` を設定します。認証情報は `data/zeta.example.json` を `data/zeta.json` にコピーして設定することもできます。更新されたトークンは、JSON を使った場合だけ同じファイルへ保存されます。

```bash
bun run dev
```

ブラウザで `http://localhost:3000` を開きます。既存ルームは「ルーム選択」から開けます。

## 実装内容

- `sender.type`、`speakerName`、`position` によるZetaメタデータベースの話者判定
- Markdown・イタリックの表示解析（本文は話者判定に使用しない）
- 同じ話者の連続部分を発話ブロックに統合
- 話者変更、段落、句読点、三点リーダーに応じた「間」
- 状況描写の「読み上げる」「一部を演出に変換」「表示だけ」切り替え
- ルームのキャラクターごとの VOICEVOX キャスティングと試聴
- キーワードによるプロット検索と新規ルーム作成、既存ルーム一覧からの会話再開
- プロット画像、キャラクター名・画像、既存ルームの会話履歴表示
- Zetaの実認証状態とVOICEVOX API接続状態・バージョンの表示
- メッセージ単位の話者変更、読み上げ停止、再試聴
- 話者・スタイル・話速・音高・抑揚・音量・正規化本文を含む音声キャッシュ
- 入力フォーカス、音声入力、送信時の 160ms フェードアウト割り込み
- Web Audio APIのAnalyserNodeによる、実際の再生音に連動した波形表示
- Web Speech Recognition の認識結果を「台詞」または「描写」に変換
- 描写ボタンの再クリックで `*描写*` を通常文へ戻すトグル操作

## 検証

```bash
bun test
bun run typecheck
```
