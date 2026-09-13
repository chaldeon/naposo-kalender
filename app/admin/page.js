export default function AdminPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="font-serif text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
        Panel Admin
      </h1>
      <p className="text-sm" style={{ color: 'var(--text3)' }}>
        Rute ini dilindungi middleware.js — kalau Anda sampai di sini, sesi JWT Anda valid.
        CRUD events/announcements/dsb menyusul di sesi berikutnya.
      </p>
    </div>
  );
}
