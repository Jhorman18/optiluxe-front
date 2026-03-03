export default function ContactoHero() {
  return (
    <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 text-white py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block border border-blue-300 text-blue-100 text-xs font-medium px-4 py-1.5 rounded-full mb-6 tracking-wide">
          Contacto
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Estamos Aquí{" "}
          <span className="text-blue-200">Para Ti</span>
        </h1>
        <p className="text-blue-100 text-base md:text-lg max-w-xl mx-auto">
          ¿Tienes alguna pregunta? Contáctanos y con gusto te atenderemos
        </p>
      </div>
    </section>
  );
}
