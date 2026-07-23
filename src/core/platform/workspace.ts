import { products } from "../registry";

export function getWorkspaceProducts() {
    return products.filter((product) => product.enabled);
}