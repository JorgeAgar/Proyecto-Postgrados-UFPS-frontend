export default function InfoProgramaDetalle({ items }: { items: { titulo: string; descripcion: string }[] }) {
  return (
    <section className="flex flex-col gap-4 p-4 border rounded-md border-gray-700">
      <h2 className="m-0 p-0 text-sm font-semibold text-gray-700">
        Información General
      </h2>
      <div className="m-0 p-0 grid grid-cols-2 gap-4">
        {items.map((item, index) => (
          <Item key={index} titulo={item.titulo} descripcion={item.descripcion} />
        ))}
      </div>
    </section>
  );
}

function Item({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex flex-col gap-2 justify-start items-start">
      <h3 className="text-sm text-gray-700 m-0 p-0">{titulo}</h3>
      <p className="text-sm m-0 p-0">{descripcion}</p>
    </div>
  );
}
