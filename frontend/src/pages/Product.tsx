import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts, addToCart } from "../api/api";
import { toast } from "react-toastify";
import { FiShoppingCart } from "react-icons/fi";

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  sizes: string[];
  brand: string;
  discount: string;
  rating: number;
  reviews: string;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        // Защита: если response.data не массив, делаем пустой массив
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    const userId = localStorage.getItem("userId");
    const quantity = 1;
    
    // ЗАЩИТА 1: Безопасно получаем размер
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M";
    const selectedSize = selectedSizes[product._id] || defaultSize;

    if (!userId) {
      toast.error("Please log in to add items to cart.");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size before adding to cart.");
      return;
    }

    const payload = {
      userId,
      productId: product._id,
      // ЗАЩИТА 2: Безопасно получаем картинку
      img1: product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/250",
      title: product.title,
      price: product.price,
      quantity,
      size: selectedSize,
    };

    try {
      const res = await addToCart(payload);
      toast.success(res.data.message);
    } catch {
      toast.error("Error adding to cart");
    }
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold text-teal-600 mb-8">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* ЗАЩИТА 3: Проверяем, что products - это массив */}
        {Array.isArray(products) && products.map((product) => {
          // Безопасные размеры для конкретного товара
          const productSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L"];
          // Безопасная картинка
          const productImage = product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/250";

          return (
            <div
              key={product._id}
              className="group border border-neutral-300 rounded-lg bg-white hover:shadow-lg transition"
            >
              <div className="p-4">
                <Link to={`/products/${product._id}`}>
                  <img
                    src={productImage}
                    alt={product.title}
                    className="w-full h-[250px] object-cover rounded-md"
                    loading="lazy"
                  />
                </Link>

                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                    {product.brand || "Brand"}
                  </span>
                </div>

                <h2 className="text-lg font-semibold mt-2">{product.title}</h2>

                <p className="text-gray-600">
                  <span className="text-xl font-bold">$ {product.price}</span>
                </p>

                <p className="text-yellow-500 text-sm">
                  Rating: <span className="font-bold">{product.rating || 0}</span> ⭐ ({product.reviews || 0} reviews)
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <label className="text-sm font-semibold">Sizes:</label>
                    <select
                      className="ml-2 border px-2 py-1 rounded-md cursor-pointer"
                      value={selectedSizes[product._id] || productSizes[0]}
                      onChange={(e) => handleSizeChange(product._id, e.target.value)}
                    >
                      {/* ЗАЩИТА 4: Безопасный map по размерам */}
                      {productSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="px-4 cursor-pointer flex gap-2 items-center bg-[#319795] text-white py-1.5 rounded-md hover:bg-teal-700 transition"
                    onClick={() => handleAddToCart(product)}
                  >
                    <FiShoppingCart className="h-5 w-5 text-white" />
                    Add Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Products;
