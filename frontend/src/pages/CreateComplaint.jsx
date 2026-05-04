import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FiUpload, FiMapPin, FiAlignLeft, FiType, FiList, FiArrowLeft } from "react-icons/fi";

function CreateComplaint() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    location: "",
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    // Attempt to geocode the location entered by the user
    let lat = null;
    let lng = null;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lng = parseFloat(geoData[0].lon);
      }
    } catch (error) {
      console.warn("Geocoding failed, continuing without coordinates:", error);
    }

    const locationObj = {
      address: formData.location,
      ...(lat !== null && lng !== null ? { lat, lng } : {})
    };

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("location", JSON.stringify(locationObj));
    
    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      await API.post("/complaints", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Complaint submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-6 font-medium"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white tracking-wide">File a New Complaint</h2>
            <p className="text-indigo-100 mt-2 text-sm">Provide details about the issue to help us resolve it quickly.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-1">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <FiType className="mr-2 text-indigo-500" /> Complaint Title <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Pothole on Main Street"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-700 bg-slate-50 focus:bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="flex items-center text-sm font-semibold text-slate-700">
                  <FiList className="mr-2 text-indigo-500" /> Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none text-slate-700 bg-slate-50 focus:bg-white"
                  >
                    <option value="road">Road & Infrastructure</option>
                    <option value="water">Water Supply</option>
                    <option value="garbage">Garbage & Sanitation</option>
                    <option value="electricity">Electricity</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="flex items-center text-sm font-semibold text-slate-700">
                  <FiMapPin className="mr-2 text-indigo-500" /> Location <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Street name or landmark"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-700 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <FiAlignLeft className="mr-2 text-indigo-500" /> Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none text-slate-700 bg-slate-50 focus:bg-white"
                required
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <FiUpload className="mr-2 text-indigo-500" /> Upload Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:bg-slate-50 transition-colors">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <div className="flex flex-col items-center">
                      <img src={previewUrl} alt="Preview" className="h-32 object-contain rounded-lg mb-4" />
                      <label className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Change image</span>
                        <input name="image" type="file" accept="image/*" className="sr-only" onChange={handleChange} />
                      </label>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="mx-auto h-10 w-10 text-slate-400" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input name="image" type="file" accept="image/*" className="sr-only" onChange={handleChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Submit Complaint"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateComplaint;
