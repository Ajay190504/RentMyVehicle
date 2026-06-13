import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient, { API_BASE_URL } from '../api/apiClient';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const setBookingDraft = useCartStore((state) => state.setBookingDraft);
  const user = useAuthStore((state) => state.user);

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [rateType, setRateType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [months, setMonths] = useState('1');
  const [operatorRequested, setOperatorRequested] = useState(false);
  const [livePrice, setLivePrice] = useState({ units: 0, total: 0, rate: 0 });
  const [error, setError] = useState('');

  const getMinEndDate = (startDateVal) => {
    if (!startDateVal) return '';
    return startDateVal;
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const formatDateOnlyStr = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getComputedDates = () => {
    if (!startDate) return { start: null, end: null, startStr: '', endStr: '' };
    
    if (rateType === 'HOURLY' || rateType === 'DAILY') {
      if (!endDate) return { start: null, end: null, startStr: '', endStr: '' };
      return {
        start: new Date(startDate),
        end: new Date(endDate),
        startStr: startDate,
        endStr: endDate
      };
    } else if (rateType === 'MONTHLY') {
      const startD = new Date(startDate);
      const endD = new Date(startD.getTime() + parseInt(months) * 30 * 24 * 60 * 60 * 1000);
      const pad = (num) => String(num).padStart(2, '0');
      const endStr = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}T${pad(endD.getHours())}:${pad(endD.getMinutes())}`;
      return {
        start: startD,
        end: endD,
        startStr: startDate,
        endStr: endStr
      };
    }
    return { start: null, end: null, startStr: '', endStr: '' };
  };

  const checkOverlap = (reqStart, reqEnd) => {
    if (!vehicle || !vehicle.activeBookings || vehicle.activeBookings.length === 0) return null;
    
    for (const b of vehicle.activeBookings) {
      const bStart = new Date(b.startDatetime);
      const bEnd = new Date(b.endDatetime);
      
      if (reqStart < bEnd && reqEnd > bStart) {
        return b;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await apiClient.get(`/api/vehicles/${id}`);
        if (response.data.success) {
          const v = response.data.data;
          setVehicle(v);
          if (v.dailyRate) setRateType('DAILY');
          else if (v.hourlyRate) setRateType('HOURLY');
          else if (v.monthlyRate) setRateType('MONTHLY');
        }
      } catch (error) {
        console.error(error);
        setError('Vehicle listing not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    if (!vehicle || !rateType) {
      setLivePrice({ units: 0, total: 0, rate: 0 });
      return;
    }

    const { start, end } = getComputedDates();
    if (!start || !end || start >= end) {
      setLivePrice({ units: 0, total: 0, rate: 0 });
      return;
    }

    const overlap = checkOverlap(start, end);
    if (overlap) {
      setError(`Overlaps with an existing booking: ${formatDateStr(overlap.startDatetime)} to ${formatDateStr(overlap.endDatetime)}`);
      setLivePrice({ units: 0, total: 0, rate: 0 });
      return;
    } else {
      setError('');
    }

    let rate = 0;
    let units = 1;
    let operatorRateVal = 0;

    if (rateType === 'HOURLY') {
      rate = vehicle.hourlyRate || 0;
      const diffMs = end - start;
      units = Math.ceil(diffMs / 3600000);
      operatorRateVal = 150;
    } else if (rateType === 'DAILY') {
      rate = vehicle.dailyRate || 0;
      const diffMs = end - start;
      units = Math.ceil(diffMs / 86400000);
      operatorRateVal = 1000;
    } else if (rateType === 'MONTHLY') {
      rate = vehicle.monthlyRate || 0;
      units = parseInt(months);
      operatorRateVal = 15000;
    }

    units = Math.max(1, units);
    let total = rate * units;
    if (operatorRequested && vehicle.operatorAvailable) {
      total += operatorRateVal * units;
    }

    setLivePrice({ 
      units, 
      total, 
      rate, 
      operatorRate: operatorRequested && vehicle.operatorAvailable ? operatorRateVal : 0 
    });
  }, [startDate, endDate, months, operatorRequested, rateType, vehicle]);

  const handleRateTypeChange = (type) => {
    setRateType(type);
    setStartDate('');
    setEndDate('');
    setMonths('1');
    setError('');
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'CUSTOMER' && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      setError('Only customers, owners, and admins can request reservations.');
      return;
    }

    const { start, end, startStr, endStr } = getComputedDates();
    if (!start || !end) {
      setError('Please select valid rental dates.');
      return;
    }

    if (start >= end) {
      setError('End date must be after start date.');
      return;
    }

    const overlap = checkOverlap(start, end);
    if (overlap) {
      setError(`Overlaps with an existing booking: ${formatDateStr(overlap.startDatetime)} to ${formatDateStr(overlap.endDatetime)}`);
      return;
    }

    const primaryImg = vehicle.images.find(img => img.isPrimary)?.imageUrl || 
                       (vehicle.images.length > 0 ? vehicle.images[0].imageUrl : '');

    setBookingDraft({
      vehicleId: vehicle.id,
      vehicleTitle: vehicle.title,
      vehicleImageUrl: primaryImg,
      vehicleCategory: vehicle.category,
      rateTypeUsed: rateType,
      startDatetime: startStr,
      endDatetime: endStr,
      operatorRequested: operatorRequested && vehicle.operatorAvailable,
      totalAmount: livePrice.total,
      units: livePrice.units,
      rateValue: livePrice.rate
    });

    navigate('/confirm-booking');
  };

  const nextImage = () => {
    if (vehicle?.images?.length) {
      setActiveImageIndex((prev) => (prev + 1) % vehicle.images.length);
    }
  };

  const prevImage = () => {
    if (vehicle?.images?.length) {
      setActiveImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold text-brand-body">Loading details...</div>;
  if (error && !vehicle) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="space-y-6 fade-in pb-20 md:pb-8">
      <button onClick={() => navigate('/search')} className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:underline">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to search</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side */}
        <div className="flex-1 space-y-6">
          <div className="relative h-[280px] md:h-[420px] bg-brand-canvas-soft rounded-xl overflow-hidden border border-brand-canvas-soft group">
            {vehicle.images.length > 0 ? (
              <>
                <img
                  src={vehicle.images[activeImageIndex].imageUrl.startsWith('/uploads') 
                    ? `${API_BASE_URL}${vehicle.images[activeImageIndex].imageUrl}` 
                    : vehicle.images[activeImageIndex].imageUrl}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />
                {vehicle.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-brand-canvas rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-brand-canvas rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-body text-xs font-bold uppercase">No Image Available</div>
            )}
            <span className="absolute top-4 left-4 text-[9px] uppercase font-extrabold tracking-widest bg-brand-primary text-brand-on-primary px-3 py-1 rounded-pill shadow-md">
              {vehicle.category}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-extrabold text-brand-body uppercase tracking-wider">{vehicle.subcategory}</span>
            <h1 className="display-xl mt-1 text-brand-ink uppercase">{vehicle.title}</h1>
            <p className="text-brand-body text-xs font-bold flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-brand-ink" />
              <span>{vehicle.locationCity.toUpperCase()}</span>
            </p>
          </div>

          <hr className="border-brand-canvas-soft" />

          {/* Specs */}
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-body mb-4">Specifications</span>
            {vehicle.specifications.length === 0 ? (
              <p className="text-brand-body text-xs italic">No custom specifications provided.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicle.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between items-center bg-brand-canvas-soft p-3.5 rounded-lg border border-brand-canvas-softer">
                    <span className="text-[9px] font-extrabold text-brand-body uppercase tracking-wider">{spec.specKey}</span>
                    <span className="text-xs font-bold text-brand-ink">{spec.specValue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-brand-canvas-soft" />

          {/* Description */}
          <div className="space-y-2">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-body">Description details</span>
            <p className="text-brand-body text-xs leading-relaxed font-semibold whitespace-pre-wrap">
              {vehicle.description || 'No description listed.'}
            </p>
          </div>
        </div>

        {/* Right Side: Sticky Calculator */}
        <div className="w-full lg:w-96">
          <div className="bg-brand-canvas border border-brand-canvas-soft p-6 rounded-xl shadow-sm space-y-6 lg:sticky lg:top-20">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-ink pb-3 border-b border-brand-canvas-soft">
              Rental Pricing
            </span>

            {error && (
              <div className="p-3 text-xs font-bold bg-red-50 text-red-600 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleBookNow} className="space-y-4">
              {/* Rate buttons */}
              <div>
                <label className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-2">Billing Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {vehicle.hourlyRate && (
                    <button
                      type="button"
                      onClick={() => handleRateTypeChange('HOURLY')}
                      className={`py-2 px-1 text-center rounded-pill-tab border text-[10px] uppercase font-bold tracking-wider transition ${
                        rateType === 'HOURLY'
                          ? 'border-brand-primary bg-brand-canvas-soft font-extrabold'
                          : 'border-brand-canvas-soft hover:border-brand-body bg-white'
                      }`}
                    >
                      <span className="block font-extrabold">₹{vehicle.hourlyRate}</span>
                      <span className="text-[8px] text-brand-body">Hour</span>
                    </button>
                  )}
                  {vehicle.dailyRate && (
                    <button
                      type="button"
                      onClick={() => handleRateTypeChange('DAILY')}
                      className={`py-2 px-1 text-center rounded-pill-tab border text-[10px] uppercase font-bold tracking-wider transition ${
                        rateType === 'DAILY'
                          ? 'border-brand-primary bg-brand-canvas-soft font-extrabold'
                          : 'border-brand-canvas-soft hover:border-brand-body bg-white'
                      }`}
                    >
                      <span className="block font-extrabold">₹{vehicle.dailyRate}</span>
                      <span className="text-[8px] text-brand-body">Day</span>
                    </button>
                  )}
                  {vehicle.monthlyRate && (
                    <button
                      type="button"
                      onClick={() => handleRateTypeChange('MONTHLY')}
                      className={`py-2 px-1 text-center rounded-pill-tab border text-[10px] uppercase font-bold tracking-wider transition ${
                        rateType === 'MONTHLY'
                          ? 'border-brand-primary bg-brand-canvas-soft font-extrabold'
                          : 'border-brand-canvas-soft hover:border-brand-body bg-white'
                      }`}
                    >
                      <span className="block font-extrabold">₹{vehicle.monthlyRate}</span>
                      <span className="text-[8px] text-brand-body">Month</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Already Booked Periods */}
              {vehicle.activeBookings && vehicle.activeBookings.length > 0 && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 space-y-1.5">
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-amber-800">
                    Already Booked Periods (Unavailable)
                  </span>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                    {vehicle.activeBookings.map((b, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-bold text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-100/60">
                        <span>{formatDateStr(b.startDatetime)}</span>
                        <span className="text-[8px] font-normal uppercase text-amber-600">to</span>
                        <span>{formatDateStr(b.endDatetime)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Fields depending on Billing Tier */}
              {rateType === 'HOURLY' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-1.5">Start Date-Time</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-brand-canvas-soft border-none text-xs font-bold focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-1.5">End Date-Time</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-brand-canvas-soft border-none text-xs font-bold focus:outline-none rounded-none"
                    />
                  </div>
                </div>
              )}

              {rateType === 'DAILY' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-1.5">Start Date-Time</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setEndDate('');
                      }}
                      className="w-full px-3 py-2.5 bg-brand-canvas-soft border-none text-xs font-bold focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-1.5">End Date-Time</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-brand-canvas-soft border-none text-xs font-bold focus:outline-none rounded-none"
                    />
                  </div>
                </div>
              )}

              {rateType === 'MONTHLY' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-1.5">Start Date-Time</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-brand-canvas-soft border-none text-xs font-bold focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-1.5">Duration (Months)</label>
                    <select
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                      className="w-full px-3 py-2.5 bg-brand-canvas-soft border-none text-xs font-bold focus:outline-none rounded-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>
                          {m} {m === 1 ? 'Month' : 'Months'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {startDate && (
                    <div className="p-3 bg-brand-canvas-soft rounded-lg text-xs font-semibold">
                      <span className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-1">Estimated End Date-Time</span>
                      <span className="text-brand-ink">{formatDateOnlyStr(getComputedDates().endStr)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Operator */}
              {vehicle.operatorAvailable && (
                <div className="flex items-center gap-3 p-3 bg-brand-canvas-soft rounded-lg">
                  <input
                    type="checkbox"
                    id="operator"
                    checked={operatorRequested}
                    onChange={(e) => setOperatorRequested(e.target.checked)}
                    className="w-4 h-4 accent-brand-primary rounded"
                  />
                  <label htmlFor="operator" className="text-xs font-semibold cursor-pointer select-none">
                    <span className="block font-extrabold text-[10px] uppercase">Include Operator</span>
                    <span className="text-[9px] text-brand-body">Professional driver included in rate</span>
                  </label>
                </div>
              )}

              {/* Summary */}
              {livePrice.units > 0 && (
                <div className="p-3 bg-brand-canvas-soft border-t border-brand-canvas-softer space-y-1 text-xs">
                  <div className="flex justify-between text-brand-body font-bold text-[10px] uppercase">
                    <span>Duration ({livePrice.units} {rateType.toLowerCase()})</span>
                    <span>₹{livePrice.rate} × {livePrice.units}</span>
                  </div>
                  {operatorRequested && vehicle.operatorAvailable && (
                    <div className="flex justify-between text-brand-body font-bold text-[10px] uppercase">
                      <span>Operator Fee ({livePrice.units} {rateType.toLowerCase()})</span>
                      <span>₹{livePrice.operatorRate} × {livePrice.units}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-brand-canvas-softer">
                    <span className="text-[10px] font-extrabold uppercase text-brand-ink">Total Estimations</span>
                    <span className="text-base font-extrabold text-brand-primary">₹{livePrice.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-brand-primary text-brand-on-primary font-bold text-xs uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated active:scale-[0.98] transition flex items-center justify-center"
              >
                See price / Book Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
