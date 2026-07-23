import { products } from "./products";

export { products };

export function getProducts() {
    return products;
}

export function getProduct(id: string) {
    return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string) {
    return products.filter((p) => p.category === category);
}