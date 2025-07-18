import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import SideBar from "../layouts/SideBar";
import axios from "../../utils/axios";

const CreateProduct = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState("real-estate");
  const [category, setCategory] = useState("residential");
  const [totalValue, setTotalValue] = useState("");
  const [sharePrice, setSharePrice] = useState("");
  const [totalShares, setTotalShares] = useState("");
  const [minimumInvestment, setMinimumInvestment] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();

  // Validate the mathematical relationship
  const validateValues = () => {
    if (totalValue && sharePrice && totalShares) {
      const expectedTotalValue =
        parseFloat(sharePrice) * parseFloat(totalShares);
      const actualTotalValue = parseFloat(totalValue);

      if (Math.abs(expectedTotalValue - actualTotalValue) > 0.01) {
        setValidationError(
          `Total value must equal share price × total shares. Expected: $${expectedTotalValue.toFixed(
            2
          )}, Actual: $${actualTotalValue.toFixed(2)}`
        );
        return false;
      }
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setValidationError("");

    // Client-side validation
    if (!validateValues()) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("assetType", assetType);
    formData.append("category", category);
    formData.append("totalValue", totalValue);
    formData.append("sharePrice", sharePrice);
    formData.append("totalShares", totalShares);
    formData.append("minimumInvestment", minimumInvestment);
    if (image) {
      formData.append("images", image); // Changed from "image" to "images"
    }

    try {
      await axios.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const errorMessages = err.response.data.errors
          .map((error: any) => error.msg)
          .join(", ");
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message); // Show backend error message
      } else {
        setError("Error creating product");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update validation when values change
  const handleValueChange = (field: string, value: string) => {
    let newTotalValue = totalValue;
    let newSharePrice = sharePrice;
    let newTotalShares = totalShares;

    switch (field) {
      case "totalValue":
        setTotalValue(value);
        newTotalValue = value;
        break;
      case "sharePrice":
        setSharePrice(value);
        newSharePrice = value;
        break;
      case "totalShares":
        setTotalShares(value);
        newTotalShares = value;
        break;
    }

    // Validate with the updated values
    setTimeout(() => {
      if (newTotalValue && newSharePrice && newTotalShares) {
        const expectedTotalValue =
          parseFloat(newSharePrice) * parseFloat(newTotalShares);
        const actualTotalValue = parseFloat(newTotalValue);

        if (Math.abs(expectedTotalValue - actualTotalValue) > 0.01) {
          setValidationError(
            `Total value must equal share price × total shares. Expected: $${expectedTotalValue.toFixed(
              2
            )}, Actual: $${actualTotalValue.toFixed(2)}`
          );
        } else {
          setValidationError("");
        }
      }
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex md:hidden z-[50] fixed top-0 left-0  ">
        <SideBar />
      </div>
      <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
        <Navbar />
      </div>

      <div className="mt-30 text-black flex flex-col items-center">
        <h1 className="text-white text-4xl mb-10">Create New Product</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full max-w-2xl"
        >
          <div className="w-full mb-4">
            <label className="text-white text-2xl block mb-2">
              Product Title
            </label>
            <input
              className="p-3 rounded-lg bg-[#c4c0c0] w-full h-[58px] outline-0 text-lg"
              type="text"
              placeholder="Product Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="w-full mb-4">
            <label className="text-white text-2xl block mb-2">
              Product Description
            </label>
            <textarea
              className="p-3 rounded-lg bg-[#c4c0c0] w-full h-[250px] outline-0 text-lg"
              placeholder="Product Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={2000}
            />
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-white text-xl block mb-2">
                Asset Type
              </label>
              <select
                className="p-3 rounded-lg bg-[#c4c0c0] w-full h-[58px] outline-0 text-lg"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                required
              >
                <option value="real-estate">Real Estate</option>
                <option value="art">Art</option>
                <option value="collectibles">Collectibles</option>
                <option value="commodities">Commodities</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-white text-xl block mb-2">Category</label>
              <select
                className="p-3 rounded-lg bg-[#c4c0c0] w-full h-[58px] outline-0 text-lg"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
                <option value="industrial">Industrial</option>
                <option value="paintings">Paintings</option>
                <option value="sculptures">Sculptures</option>
                <option value="photography">Photography</option>
                <option value="digital-art">Digital Art</option>
                <option value="wine">Wine</option>
                <option value="watches">Watches</option>
                <option value="jewelry">Jewelry</option>
                <option value="coins">Coins</option>
                <option value="stamps">Stamps</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="platinum">Platinum</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-white text-xl block mb-2">
                Total Value ($)
              </label>
              <input
                className="p-3 rounded-lg bg-[#c4c0c0] w-full h-[58px] outline-0 text-lg"
                type="number"
                placeholder="Total Value"
                value={totalValue}
                onChange={(e) =>
                  handleValueChange("totalValue", e.target.value)
                }
                required
                min={1000}
                step="0.01"
              />
            </div>

            <div>
              <label className="text-white text-xl block mb-2">
                Share Price ($)
              </label>
              <input
                className="p-3 rounded-lg bg-[#c4c0c0] w-full h-[58px] outline-0 text-lg"
                type="number"
                placeholder="Share Price"
                value={sharePrice}
                onChange={(e) =>
                  handleValueChange("sharePrice", e.target.value)
                }
                required
                min={1}
                step="0.01"
              />
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-white text-xl block mb-2">
                Total Shares
              </label>
              <input
                className="p-3 rounded-lg bg-[#c4c0c0] w-full h-[58px] outline-0 text-lg"
                type="number"
                placeholder="Total Shares"
                value={totalShares}
                onChange={(e) =>
                  handleValueChange("totalShares", e.target.value)
                }
                required
                min={1}
              />
            </div>

            <div>
              <label className="text-white text-xl block mb-2">
                Minimum Investment ($)
              </label>
              <input
                className="p-3 rounded-lg bg-[#c4c0c0] w-full h-[58px] outline-0 text-lg"
                type="number"
                placeholder="Minimum Investment"
                value={minimumInvestment}
                onChange={(e) => setMinimumInvestment(e.target.value)}
                required
                min={1}
                step="0.01"
              />
            </div>
          </div>

          {validationError && (
            <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {validationError}
            </div>
          )}

          <div className="w-full mb-6">
            <label
              className="text-white text-2xl block mb-2"
              htmlFor="product-image"
            >
              Product Image
            </label>
            <input
              className="block w-full text-lg text-gray-900 bg-[#c4c0c0] rounded-lg border border-gray-300 cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-lg file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 transition"
              type="file"
              name="images"
              id="product-image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!validationError}
            className="mb-20 p-3 text-lg bg-[#c4c0c0] rounded-lg cursor-pointer hover:bg-green-700 hover:text-white transition disabled:opacity-50 w-full max-w-xs"
          >
            {loading ? "Creating Product..." : "Create Product"}
          </button>

          {error && (
            <div className="text-red-600 mt-4 text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 mt-4 text-center">
              Product created successfully! Redirecting...
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
