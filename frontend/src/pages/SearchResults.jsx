import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient, { API_BASE_URL } from '../api/apiClient';
import { MapPin, ArrowLeft, SlidersHorizontal } from 'lucide-react';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryParam = searchParams.get('category') || '';
  const cityParam = searchParams.get('city') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const rateTypeParam = searchParams.get('rateType') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [city, setCity] = useState(cityParam);
  const [category, setCategory] = useState(categoryParam);
  const [subcategory, setSubcategory] = useState(subcategoryParam);
  const [rateType, setRateType] = useState(rateTypeParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);

  const [vehicles, setVehicles] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryParam) params.append('category', categoryParam);
        if (subcategoryParam) params.append('subcategory', subcategoryParam);
        if (cityParam) params.append('city', cityParam);
        if (rateTypeParam) params.append('rateType', rateTypeParam);
        if (minPriceParam) params.append('minPrice', minPriceParam);
        if (maxPriceParam) params.append('maxPrice', maxPriceParam);
        params.append('page', pageParam);
        params.append('size', 6);

        const response = await apiClient.get(`/api/vehicles?${params.toString()}`);
        if (response.data.success) {
          setVehicles(response.data.data.content || []);
          setTotalPages(response.data.data.totalPages || 0);
        }
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchParams, categoryParam, cityParam, subcategoryParam, rateTypeParam, minPriceParam, maxPriceParam, pageParam]);

  const applyFilters = () => {
    const newParams = {};
    if (category) newParams.category = category;
    if (city) newParams.city = city;
    if (subcategory) newParams.subcategory = subcategory;
    if (rateType) newParams.rateType = rateType;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    newParams.page = 0;
    setSearchParams(newParams);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setCity('');
    setCategory('');
    setSubcategory('');
    setRateType('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    const currentParams = Object.fromEntries([...searchParams]);
    currentParams.page = newPage;
    setSearchParams(currentParams);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-3 bg-brand-canvas-soft hover:bg-brand-surface-pressed rounded-full transition"
        >
          <ArrowLeft className="w-4 h-4 text-brand-ink" />
        </button>
        <div>
          <h1 className="display-lg text-brand-ink uppercase tracking-tight">Available vehicles</h1>
          <p className="text-brand-body text-xs font-semibold">
            {cityParam ? `Showing listings in ${cityParam.toUpperCase()}` : 'Showing all active catalog'}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filter Panel (Left) */}
        <aside className="hidden md:block w-64 bg-brand-canvas border border-brand-canvas-soft p-5 rounded-xl h-fit space-y-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-canvas-soft pb-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-ink flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </span>
            <button
              onClick={clearFilters}
              className="text-[10px] text-brand-body hover:text-brand-ink hover:underline font-extrabold uppercase"
            >
              Clear
            </button>
          </div>

          <div className="space-y-4">
            {/* City */}
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-brand-body mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-brand-body mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold bg-white"
              >
                <option value="">All Categories</option>
                <option value="PERSONAL">Personal</option>
                <option value="TRANSPORT">Transport</option>
                <option value="CONSTRUCTION">Construction</option>
                <option value="TRAVEL">Travel</option>
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-brand-body mb-1.5">Subcategory</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Sedan, JCB"
                className="w-full px-3 py-2 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold"
              />
            </div>

            {/* Rate Type */}
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-brand-body mb-1.5">Rate Type</label>
              <select
                value={rateType}
                onChange={(e) => setRateType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold bg-white"
              >
                <option value="">Any Rate Type</option>
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-brand-body mb-1.5">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 px-2 py-2 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold"
                />
                <span className="text-brand-body text-xs font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 px-2 py-2 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold"
                />
              </div>
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full py-2.5 bg-brand-primary text-brand-on-primary font-bold text-xs uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated active:scale-[0.98] transition"
          >
            Apply Filters
          </button>
        </aside>

        {/* Mobile Filter Trigger */}
        <div className="md:hidden flex w-full">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full py-3 bg-brand-canvas-soft text-brand-ink rounded-pill flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-brand-surface-pressed transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter Search</span>
          </button>
        </div>

        {/* Mobile Filters Drawer Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-brand-primary bg-opacity-40 flex justify-end">
            <div className="w-4/5 max-w-sm bg-brand-canvas h-full p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-brand-canvas-soft pb-4">
                  <span className="font-extrabold text-sm uppercase tracking-wider">Filters</span>
                  <button onClick={() => setShowMobileFilters(false)} className="text-xs font-bold text-brand-body uppercase">Close</button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Location City"
                    className="w-full px-3 py-3 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-3 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold bg-white"
                  >
                    <option value="">All Categories</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="CONSTRUCTION">Construction</option>
                    <option value="TRAVEL">Travel</option>
                  </select>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Subcategory"
                    className="w-full px-3 py-3 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold"
                  />
                  <select
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value)}
                    className="w-full px-3 py-3 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold bg-white"
                  >
                    <option value="">Any Rate Type</option>
                    <option value="HOURLY">Hourly</option>
                    <option value="DAILY">Daily</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 px-2.5 py-3 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 px-2.5 py-3 text-xs bg-brand-canvas-soft border-none focus:bg-brand-canvas-softer focus:outline-none transition rounded-none font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-brand-canvas-soft mt-6">
                <button onClick={clearFilters} className="w-1/2 py-3 bg-brand-canvas-soft text-brand-ink font-bold rounded-pill text-xs uppercase tracking-wider hover:bg-brand-surface-pressed transition">Clear</button>
                <button onClick={applyFilters} className="w-1/2 py-3 bg-brand-primary text-brand-on-primary font-bold rounded-pill text-xs uppercase tracking-wider hover:bg-brand-black-elevated transition">Apply</button>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-brand-canvas-soft h-64 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="border border-brand-canvas-soft p-16 text-center space-y-4 rounded-xl">
              <p className="text-brand-body font-bold text-sm uppercase tracking-wider">No matching vehicles listed.</p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-brand-primary text-brand-on-primary font-bold text-xs uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => {
                  const primaryImg = vehicle.images.find(img => img.isPrimary)?.imageUrl || 
                                     (vehicle.images.length > 0 ? vehicle.images[0].imageUrl : '');
                  const displayPrice = vehicle.dailyRate || vehicle.hourlyRate || vehicle.monthlyRate;
                  const rateUnit = vehicle.dailyRate ? 'DAY' : vehicle.hourlyRate ? 'HOUR' : 'MONTH';

                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                      className="border border-brand-canvas-soft bg-brand-canvas hover:border-brand-primary transition duration-150 cursor-pointer flex flex-col h-full rounded-xl overflow-hidden group shadow-sm"
                    >
                      <div className="h-40 w-full bg-brand-canvas-soft relative overflow-hidden">
                        {primaryImg ? (
                          <img
                            src={primaryImg.startsWith('/uploads') ? `${API_BASE_URL}${primaryImg}` : primaryImg}
                            alt={vehicle.title}
                            className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-body text-xs font-bold uppercase">No Image</div>
                        )}
                        <span className="absolute top-3 right-3 text-[9px] uppercase font-extrabold tracking-wider bg-brand-primary text-brand-on-primary px-2 py-0.5 rounded-pill">
                          {vehicle.category}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-brand-body uppercase tracking-wider">{vehicle.subcategory}</span>
                          <h3 className="font-extrabold text-sm text-brand-ink line-clamp-1 mt-0.5">{vehicle.title}</h3>
                          <p className="text-brand-body text-[10px] mt-1 font-semibold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-ink" />
                            <span>{vehicle.locationCity}</span>
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-brand-canvas-soft flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-brand-body uppercase">Starting From</span>
                            <span className="font-extrabold text-xs">₹{displayPrice?.toLocaleString('en-IN')} <span className="text-[9px] font-normal text-brand-body">/ {rateUnit}</span></span>
                          </div>
                          <span className="text-[9px] font-extrabold bg-brand-primary text-brand-on-primary px-3 py-1.5 uppercase tracking-wider rounded-pill group-hover:bg-brand-black-elevated transition">
                            Book
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={pageParam === 0}
                    onClick={() => handlePageChange(pageParam - 1)}
                    className="px-4 py-2 border border-brand-canvas-soft text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-canvas-soft disabled:opacity-50 transition"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-extrabold text-brand-body px-2">
                    {pageParam + 1} / {totalPages}
                  </span>
                  <button
                    disabled={pageParam === totalPages - 1}
                    onClick={() => handlePageChange(pageParam + 1)}
                    className="px-4 py-2 border border-brand-canvas-soft text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-canvas-soft disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
