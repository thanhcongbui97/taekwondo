// ============================================================
// quanli-auth.js — Password config for quanli.html
// ============================================================
// SHA-256 hash of the access password.
// To regenerate the hash for a new password, run in PowerShell:
//   [BitConverter]::ToString(
//     [System.Security.Cryptography.SHA256]::Create().ComputeHash(
//       [System.Text.Encoding]::UTF8.GetBytes("YOUR_PASSWORD")
//     )
//   ).Replace("-", "").ToLower()
//
// Current password: Taeptit@123
// Current hash:     5dbdc8b2791c0b74846c3566dddc8d866b8997b28f863cb169ea1f8fd46b367e
//
// SECURITY NOTE: This is obfuscation, NOT real security.
// Anyone can read this file via browser DevTools.
// ============================================================

window.QUANLI_PASSWORD_HASH = '5dbdc8b2791c0b74846c3566dddc8d866b8997b28f863cb169ea1f8fd46b367e';
