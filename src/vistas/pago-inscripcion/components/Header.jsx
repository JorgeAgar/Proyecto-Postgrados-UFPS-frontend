function Header() {
  return (
    <div className="bg-red-700 text-white px-6 py-4 flex justify-between">
      <div>
        <h1 className="font-bold">UFPS</h1>
        <p className="text-sm">Postgrados</p>
      </div>

      <div className="flex items-center gap-2">
        <span>Juan Pérez</span>
      </div>
    </div>
  );
}

export default Header;