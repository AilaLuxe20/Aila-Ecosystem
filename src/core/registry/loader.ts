import { products } from "./products";

export function loadProducts() {
    return products.filter((product) => product.enabled);
}

export function loadProduct(id: string) {
    return products.find((product) => product.id === id);
}