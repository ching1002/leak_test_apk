# 修漏系統行動版 APK 測試

這個資料夾是獨立的離線測試版前端，來源參考既有 `frontend`，但 API 已改為 `src/mock` 假資料，不會呼叫 `publish/leak_dmz` 或 `publish/leak_Internal`。

已從 `publish/leak_Internal` 的 `/internal/auth/areas` 取得區域清單並存入 `src/mock/mock-data.ts`。假資料只保留可展示的區域、站所與案件測試資料，沒有保存資料庫連線字串、LDAP、JWT secret 或其他敏感設定。

## 測試登入

- 驗證碼固定：`1234`
- 總處角色：帳號輸入 `hq`，任意密碼
- 區處角色：帳號輸入 `district`，任意密碼
- 站所角色：其他任意帳號，任意密碼

## 開發與 APK

```bash
npm install
npm run dev
npm run build
npm run android:sync
npm run android:open
```

Android 權限設定在 `android/app/src/main/AndroidManifest.xml`，目前保留網路狀態與網路權限，未要求相機、定位、儲存空間等高風險權限。

## GitHub Actions

已提供 `.github/workflows/android-debug-apk.yml`。把本資料夾內容推到 GitHub 後，可在 Actions 手動執行 `Build Android Debug APK`，完成後下載 `pw-repair-test-debug-apk` artifact。
