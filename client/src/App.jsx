

import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });

  async function loadProducts() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load products");
      setProducts(await response.json());
      setError("");
    } catch {
      setError("Could not connect to the backend. Please check the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

async function handleDelete(id) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        "The server returned HTML instead of JSON. Please check the backend."
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not delete product");
    }

    setProducts((current) =>
      current.filter((product) => product._id !== id)
    );

    setMessage("Product deleted successfully!");
    setError("");
  } catch (err) {
    setError(err.message || "Could not delete product.");
  }
}

async function handleEdit(product) {
  const name = prompt("Enter product name:", product.name);
  if (name === null) return;

  const price = prompt("Enter product price:", product.price);
  if (price === null) return;

  const category = prompt("Enter product category:", product.category);
  if (category === null) return;

  const stock = prompt("Enter stock quantity:", product.stock);
  if (stock === null) return;

  const description = prompt(
    "Enter product description:",
    product.description
  );
  if (description === null) return;

  try {
    const response = await fetch(`${API_URL}/${product._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        category,
        stock: Number(stock),
        description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update product");
    }

    setProducts((current) =>
      current.map((item) =>
        item._id === product._id ? data : item
      )
    );

    setMessage("Product updated successfully!");
    setError("");
  } catch (err) {
    setError(err.message || "Could not update product.");
  }
}






  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add product");

      setProducts((current) => [...current, data]);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: "",
      });
      setMessage("Product added successfully!");
    } catch (err) {
      setError(err.message || "Could not add product.");
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Product Management</h1>
          <p>Manage your store products in one place.</p>
        </div>
        <span className="status">● Store Dashboard</span>
      </header>

      <main className="container">
        <section className="summary">
          <p>Total Products</p>
          <h2>{products.length}</h2>
        </section>

        <section className="form-section">
          <h2>Add New Product</h2>
          <p>Enter product details below.</p>

          <form className="product-form" onSubmit={handleSubmit}>
            <label>
              Product Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>

            <label>
              Category
              <input name="category" value={form.category} onChange={handleChange} required />
            </label>

            <label>
              Price (₹)
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
            </label>

            <label>
              Stock Quantity
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
            </label>

            <label className="full-width">
              Description
              <textarea name="description" value={form.description} onChange={handleChange} required />
            </label>

            <label className="full-width">
              Image URL (optional)
              <input name="image" type="url" value={form.image} onChange={handleChange} placeholder="https://example.com/image.jpg" />
            </label>

            <button type="submit">Add Product</button>
          </form>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </section>

        <h2 className="section-title">Your Products</h2>

        {loading && <p>Loading products...</p>}
        {!loading && !error && products.length === 0 && <p>No products found.</p>}

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product._id}>
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <span>📦</span>
                )}
              </div>
              <div className="product-info">
                <span className="category">{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                
<div className="product-footer">
  <strong>₹{product.price}</strong>
  <span>Stock: {product.stock}</span>
</div>


<button
  className="edit-button"
  onClick={() => handleEdit(product)}
>
  Edit Product
</button>

<button
  className="delete-button"
  onClick={() => handleDelete(product._id)}
>
  Delete Product
</button>


              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
