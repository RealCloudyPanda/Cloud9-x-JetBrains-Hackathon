# 4. Offline-only booth: localStorage + BroadcastChannel, no server

The leaderboard lives in the booth browser's localStorage and reaches the Leaderboard Monitor (a second window, same origin) through BroadcastChannel with a `storage` event fallback. There is no server or database, so the booth survives no Wi-Fi and needs no secrets; the trade-off is that scores never leave the machine and two booth machines cannot share a board (export to JSON is the escape hatch).
