import { products } from "./products";

export function searchProducts(query: string) {
    const q = query.toLowerCase();

    return products.filter(
        (product) =>
            product.name.toLowerCase().includes(q) ||
            product.description.toLowerCase().includes(q)
    );
}