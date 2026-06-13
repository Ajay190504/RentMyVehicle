import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { API_BASE_URL } from '../api/apiClient';
import { Car, Truck, Hammer, Bus, Search, MapPin } from 'lucide-react';

export default function CustomerHome() {
  const [city, setCity] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categories = [
    { name: 'Personal', key: 'PERSONAL', desc: 'Cars, bikes, EVs', icon: Car },
    { name: 'Transport', key: 'TRANSPORT', desc: 'Pickups, vans, trucks', icon: Truck },
    { name: 'Construction', key: 'CONSTRUCTION', desc: 'JCBs, cranes, mixers', icon: Hammer },
    { name: 'Travel', key: 'TRAVEL', desc: 'Minibuses, luxury vans', icon: Bus },
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await apiClient.get('/api/vehicles?size=3');
        if (response.data.success) {
          setFeatured(response.data.data.content || []);
        }
      } catch (error) {
        console.error('Failed to fetch listings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      navigate(`/search?city=${encodeURIComponent(city.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="space-y-12 fade-in max-w-6xl mx-auto py-4">
      {/* Hero band - white surface with card-elevated request-form-card */}
      <div className="bg-brand-canvas border border-brand-surface-pressed p-8 md:p-12 rounded-xl flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-ink leading-tight">
            Rental vehicles on demand.
          </h1>
          <p className="text-brand-body text-sm md:text-base font-normal leading-relaxed">
            Monetize your fleet or browse and rent specialized vehicles. Select durations matching your project. Instant verification, secure bookings.
          </p>
        </div>

        {/* Flat search form */}
        <form onSubmit={handleSearch} className="w-full md:w-96 space-y-4 bg-brand-canvas border border-brand-surface-pressed p-6 rounded-xl">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Location area</span>
            <div className="flex items-center gap-2 border border-brand-surface-pressed p-3 bg-brand-canvas-soft rounded-none">
              <MapPin className="text-brand-ink w-4.5 h-4.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Where do you need a vehicle?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm font-normal text-brand-ink focus:ring-0 placeholder-brand-mute"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-brand-black text-brand-white text-sm font-medium rounded-pill hover:bg-brand-black-elevated active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search vehicles</span>
          </button>
        </form>
      </div>

      {/* Monochrome Category Blocks */}
      <div className="space-y-4">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-body">Market categories</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                onClick={() => navigate(`/search?category=${cat.key}`)}
                className="p-6 border border-brand-surface-pressed bg-brand-canvas hover:border-brand-ink transition duration-150 cursor-pointer flex flex-col justify-between h-40 rounded-xl"
              >
                <div className="text-brand-ink">
                  <Icon className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm tracking-tight text-brand-ink">{cat.name}</h3>
                  <p className="text-brand-body text-[11px] font-normal">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-body">Featured active listings</span>
          <button onClick={() => navigate('/search')} className="text-xs font-bold text-brand-ink hover:underline uppercase tracking-wider">
            View all
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-brand-surface-pressed bg-brand-canvas h-64 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="border border-brand-surface-pressed bg-brand-canvas p-16 text-center text-brand-body text-sm font-medium rounded-xl">
            No active vehicle listings available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.slice(0, 3).map((vehicle) => {
              const primaryImg = vehicle.images.find(img => img.isPrimary)?.imageUrl || 
                                 (vehicle.images.length > 0 ? vehicle.images[0].imageUrl : '');
              const displayPrice = vehicle.dailyRate || vehicle.hourlyRate || vehicle.monthlyRate;
              const rateUnit = vehicle.dailyRate ? 'day' : vehicle.hourlyRate ? 'hour' : 'month';

              return (
                <div
                  key={vehicle.id}
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="border border-brand-surface-pressed bg-brand-canvas hover:border-brand-ink transition duration-150 cursor-pointer flex flex-col group rounded-xl overflow-hidden"
                >
                  <div className="h-48 w-full bg-brand-canvas-soft relative overflow-hidden border-b border-brand-surface-pressed">
                    {primaryImg ? (
                      <img
                        src={primaryImg.startsWith('/uploads') ? `${API_BASE_URL}${primaryImg}` : primaryImg}
                        alt={vehicle.title}
                        className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-body text-xs font-medium uppercase">No image</div>
                    )}
                    <span className="absolute top-3 right-3 text-[9px] uppercase font-bold tracking-wider bg-brand-black text-brand-white px-2.5 py-0.5 rounded-pill border border-brand-black">
                      {vehicle.category.toLowerCase()}
                    </span>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brand-body uppercase tracking-wider">{vehicle.subcategory}</span>
                      <h3 className="font-bold text-base text-brand-ink line-clamp-1 leading-tight">{vehicle.title}</h3>
                      <p className="text-brand-body text-xs font-normal flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-ink" />
                        <span>{vehicle.locationCity}</span>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-brand-canvas-soft flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-brand-body uppercase tracking-wider">Rate starting</span>
                        <span className="font-bold text-sm text-brand-ink">₹{displayPrice?.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-brand-body">/ {rateUnit}</span></span>
                      </div>
                      <span className="text-[11px] font-medium bg-brand-black text-brand-white px-4 py-2 rounded-pill hover:bg-brand-black-elevated transition">
                        View
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
