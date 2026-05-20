export default function DescripcionProgramaDetalle({ descripcion }: { descripcion: string }) {
  return (
    <section className="flex flex-col gap-4 p-4 border rounded-md border-gray-700">
      <h2 className="m-0 p-0 text-sm font-semibold text-gray-700">
        Descripción del Programa
      </h2>
      <p className="text-sm m-0 p-0">{descripcion}</p>
    </section>
  );
}