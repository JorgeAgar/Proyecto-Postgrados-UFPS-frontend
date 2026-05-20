export type Item = {
    titulo: string;
    descripcion: string;
}

export default function InfoProgramaDetalle({ items }: { items: Item[] }) {
  return (
    <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-7 animate-fade-in-up delay-150">
      <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Información General
      </h2>
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 md:gap-y-9">
        {items.map((item, index) => (
          <Item key={index} titulo={item.titulo} descripcion={item.descripcion} index={index} />
        ))}
      </div>
    </section>
  );
}

function Item({
  titulo,
  descripcion,
  index = 0,
}: {
  titulo: string;
  descripcion: string;
  index?: number;
}) {
  return (
    <div
      className="min-w-0 animate-fade-in-up"
      style={{ animationDelay: `${150 + index * 50}ms` }}
    >
      <h3 className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
        {titulo}
      </h3>
      <p className="text-[15px] font-semibold leading-6 text-slate-900 break-words">
        {descripcion}
      </p>
    </div>
  );
}
