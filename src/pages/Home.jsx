export default function Home() {
  return (
    <section className="grid gap-4">
      <h1 className="text-3xl font-bold">Cuidado responsable para tu mascota</h1>
      <p>Encuentra cuidadores verificados por ciudad y servicio.</p>
      <a
        href="/caregivers"
        className="inline-block border rounded px-4 py-2 hover:bg-gray-100 w-max"
      >
        Buscar cuidadores
      </a>
    </section>
  );
}
