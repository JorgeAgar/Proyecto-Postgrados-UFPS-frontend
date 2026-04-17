function InfoInscripcion() {
    return (
    <div className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-6">

      <div>
        <p><strong>Programa:</strong> Maestría en Gerencia de Proyectos</p>
        <p><strong>Periodo:</strong> 2026-1</p>
        <p><strong>Aspirante:</strong> Juan Pérez García</p>
        <p><strong>Documento:</strong> 1.090.123.456</p>
      </div>

      <div>
        <p><strong>Facultad:</strong> Ingenierías</p>
        <p><strong>Tipo:</strong> Nuevo Aspirante</p>
        <p className="text-red-600 text-xl font-bold">
          $150.000 COP
        </p>
      </div>

    </div>
    );
}

export default InfoInscripcion;