// Field ekstra per label kategori. Sama persis dengan CAT_EXTRA di js/kalender.js lama.
export const CAT_EXTRA = {
  Koor: [
    { key: 'judul_lagu', label: 'Judul Lagu', type: 'text' },
    { key: 'link_guide', label: 'Link Guide', type: 'url' },
  ],
  Ibadah: [{ key: 'judul_tema', label: 'Judul Tema', type: 'text' }],
  Latihan: [
    { key: 'judul_lagu', label: 'Judul Lagu', type: 'text' },
    { key: 'link_guide', label: 'Link Guide', type: 'url' },
  ],
  Reversement: [{ key: 'tema_reversement', label: 'Tema Reversement', type: 'text' }],
  Olahraga: [
    { key: 'variant', label: 'Cabang Olahraga', type: 'select', options: ['badminton', 'basket', 'futsal', 'renang'] },
    { key: 'tempat', label: 'Tempat / Lapangan', type: 'text' },
    { key: 'uang_patungan', label: 'Uang Patungan', type: 'money' },
  ],
  'Perayaan Ulang Tahun': [
    { key: 'nama', label: 'Nama (yang berulang tahun)', type: 'text' },
    { key: 'poster_url', label: 'Poster Acara', type: 'url', adminOnly: true },
    { key: 'foto_url', label: 'Foto Pribadi', type: 'url', adminOnly: true },
  ],
  'Ulang Tahun Anggota': [
    { key: 'nama', label: 'Nama (yang berulang tahun)', type: 'text' },
    { key: 'poster_url', label: 'Poster Acara', type: 'url', adminOnly: true },
    { key: 'foto_url', label: 'Foto Pribadi', type: 'url', adminOnly: true },
  ],
};

export const GABUNGAN_CATS = ['koor', 'ibadah', 'latihan'];

export function getExtraFields(categoryLabel) {
  return CAT_EXTRA[categoryLabel] || [];
}
