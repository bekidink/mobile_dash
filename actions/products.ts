"use server";

import slugify from "slugify";

import { createClient } from "@/supabase/server";
import {
  ProductsWithCategoriesResponse,
  UpdateProductSchema,
} from "@/types/product";
import { CreateProductSchemaServer } from "@/models/product";
import { revalidatePath } from "next/cache";

export const getProductsWithCategories =
  async (): Promise<ProductsWithCategoriesResponse> => {
    const supabase = createClient();
    const { data, error } = await (await supabase)
      .from("products")
      .select("*, category:category(*)")
      .returns<ProductsWithCategoriesResponse>();

    if (error) {
      throw new Error(`
        Error fetching products with categories: ${error.message}`);
    }

    return data || [];
  };

export const createProduct = async ({
  category,
  heroImage,
  images,
  maxQuantity,
  price,
  title,
}: CreateProductSchemaServer) => {
  const supabase = createClient();
  const slug = slugify(title, { lower: true });

  const { data, error } = await (await supabase).from("products").insert({
    category,
    heroImage,
    imagesUrl: images,
    maxQuantity,
    price,
    slug,
    title,
  });

  if (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }

  revalidatePath("/admin/products");

  return data;
};

export const updateProduct = async ({
  category,
  heroImage,
  imagesUrl,
  maxQuantity,
  price,
  slug,
  title,
}: UpdateProductSchema) => {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from("products")
    .update({
      category,
      heroImage,
      imagesUrl,
      maxQuantity,
      price,
      title,
    })
    .match({ slug });

  if (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }

  revalidatePath("/admin/products");

  return data;
};

export const deleteProduct = async (slug: string) => {
  const supabase = createClient();
  const { error } = await (await supabase).from("products").delete().match({ slug });

  if (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }

  revalidatePath("/admin/products");
};
