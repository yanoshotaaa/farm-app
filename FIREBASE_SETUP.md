# Firebase設定ガイド

このアプリはFirebase Firestoreを使用してデータを保存します。以下の手順で設定してください。

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `farm-app`）
4. Google Analyticsは任意で有効化
5. プロジェクトを作成

## 2. Firestoreデータベースの作成

1. Firebase Consoleで「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. セキュリティルールを選択：
   - **テストモードで開始**（開発用、後で本番用に変更）
4. ロケーションを選択（例: `asia-northeast1` - 東京）

## 3. 認証の有効化

1. Firebase Consoleで「Authentication」を選択
2. 「始める」をクリック
3. 「メール/パスワード」を有効化

## 4. Webアプリの登録

1. Firebase Consoleで「プロジェクトの設定」（歯車アイコン）をクリック
2. 「アプリを追加」→「Web」（</>アイコン）を選択
3. アプリのニックネームを入力（例: `farm-app-web`）
4. 「アプリを登録」をクリック
5. 表示された設定情報をコピー

## 5. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の内容を追加：

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

**重要**: `.env` ファイルは `.gitignore` に含まれているため、GitHubにはプッシュされません。

## 6. Firestoreセキュリティルール（本番用）

開発が完了したら、以下のセキュリティルールを設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 7. インデックスの作成

Firestore Consoleで以下の複合インデックスを作成：

1. `crops` コレクション:
   - `userId` (昇順) + `createdAt` (降順)

2. `growthRecords` コレクション:
   - `cropId` (昇順) + `userId` (昇順) + `date` (降順)

3. `tasks` コレクション:
   - `userId` (昇順) + `dueDate` (昇順)
   - `userId` (昇順) + `cropId` (昇順) + `dueDate` (昇順)

4. `farmAreas` コレクション:
   - `userId` (昇順) + `createdAt` (降順)

5. `chatMessages` コレクション:
   - `userId` (昇順) + `timestamp` (昇順)

## 8. 開発サーバーの起動

```bash
npm run dev
```

環境変数が正しく設定されていれば、Firebaseに接続されます。

## トラブルシューティング

- **エラー: "Firebase: Error (auth/configuration-not-found)"**
  → `.env` ファイルが正しく作成されているか確認

- **エラー: "Missing or insufficient permissions"**
  → Firestoreセキュリティルールを確認

- **データが表示されない**
  → ブラウザのコンソールでエラーを確認
  → Firestore Consoleでデータが作成されているか確認

