/* 公開設定 — Supabase のキーをここに貼る。
   anon public key はフロントに露出してOK(RLSが各ユーザーの行だけに制限するため)。
   service_role key は絶対にここに置かない。
   空のままなら、アプリは従来どおり端末内(localStorage)保存で動作する。 */
window.APP_CONFIG = {
  supabaseUrl: "",      // 例: https://xxxx.supabase.co
  supabaseAnonKey: ""   // anon public key
};
