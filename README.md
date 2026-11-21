# Stock videos (4K, loop, orisinal)

Tiga video abstrak 3840x2160, 16:9, 30 fps, 20 detik, loop mulus, tanpa teks/logo:

| Scene | Konsep |
|---|---|
| `silk` | Garis aliran seperti sutra/tinta |
| `terrain` | Lanskap titik bergelombang 3D |
| `aurora` | Gradien cair + bokeh + grain halus |

## Cara render (GitHub Actions)
1. Unggah isi folder ini ke repo GitHub (termasuk folder `.github`).
2. Buka tab **Actions** → **Render videos** → **Run workflow**.
3. Centang `preview` dulu untuk tes cepat (1080p, 4 detik). Hapus centang untuk render 4K penuh.
4. Setelah selesai, unduh MP4 dari bagian **Artifacts** (disimpan 7 hari). Jangan commit MP4 ke git.

Render 4K lewat CPU lambat (kira-kira puluhan menit per video). Tiga video jalan paralel.

## Cek sebelum unggah ke Adobe Stock
- Resolusi 3840x2160, MP4/H.264, fps standar, durasi 5-60 detik: cek dengan `ffprobe`.
- Frame pada detik ke-5 dipakai sebagai gambar preview, pastikan tampilannya bagus.
- Label "Created using generative AI tools" di Contributor Portal bila berlaku (kode dibuat dengan bantuan AI). Cek ketentuan terbaru Adobe.
- Tanpa teks, logo, atau watermark. Judul dan kata kunci harus menggambarkan isi (abstract, loop, background, 4K).

## Lokal (opsional)
`npm install && npx playwright install chromium`, lalu `node render.js --scene silk`. Butuh `ffmpeg` terpasang.
