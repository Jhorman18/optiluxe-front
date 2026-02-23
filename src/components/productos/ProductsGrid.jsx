import ProductCard from "./ProductCard";
import { productsMock } from "../../data/productsMock";

export default function ProductsGrid() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
        {productsMock.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}