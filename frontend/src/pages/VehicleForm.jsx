import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import apiClient, { API_BASE_URL } from '../api/apiClient';
import { ArrowLeft, Plus, Trash2, Upload, AlertTriangle } from 'lucide-react';

export default function VehicleForm() {
  const { id } = useParams(); // undefined = create, number = edit
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);
  const [error, setError] = useState('');

  // Selected local image files to upload on save
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      category: 'PERSONAL',
      subcategory: '',
      title: '',
      description: '',
      locationCity: '',
      hourlyRate: '',
      dailyRate: '',
      monthlyRate: '',
      operatorAvailable: false,
      specifications: [{ specKey: '', specValue: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchVehicleData = async () => {
        try {
          const response = await apiClient.get(`/api/vehicles/${id}`);
          if (response.data.success) {
            const v = response.data.data;
            setValue('category', v.category);
            setValue('subcategory', v.subcategory);
            setValue('title', v.title);
            setValue('description', v.description || '');
            setValue('locationCity', v.locationCity);
            setValue('hourlyRate', v.hourlyRate || '');
            setValue('dailyRate', v.dailyRate || '');
            setValue('monthlyRate', v.monthlyRate || '');
            setValue('operatorAvailable', v.operatorAvailable || false);
            
            // Populate specifications
            if (v.specifications && v.specifications.length > 0) {
              setValue('specifications', v.specifications);
            } else {
              setValue('specifications', []);
            }

            setExistingImages(v.images || []);
          }
        } catch (err) {
          setError('Failed to fetch listing data for editing');
        } finally {
          setFetchingData(false);
        }
      };
      fetchVehicleData();
    }
  }, [id, isEdit, setValue]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    // Validate that at least one rate is non-null
    const hourly = parseFloat(data.hourlyRate);
    const daily = parseFloat(data.dailyRate);
    const monthly = parseFloat(data.monthlyRate);

    const hasRate = (!isNaN(hourly) && hourly > 0) || 
                    (!isNaN(daily) && daily > 0) || 
                    (!isNaN(monthly) && monthly > 0);

    if (!hasRate) {
      setError('At least one pricing rate (hourly, daily, or monthly) must be set and greater than zero.');
      setLoading(false);
      return;
    }

    // Format rates for payload
    const payload = {
      ...data,
      hourlyRate: isNaN(hourly) ? null : hourly,
      dailyRate: isNaN(daily) ? null : daily,
      monthlyRate: isNaN(monthly) ? null : monthly,
      // Filter out empty specification rows
      specifications: data.specifications.filter(s => s.specKey.trim() && s.specValue.trim())
    };

    try {
      let savedVehicleId = id;
      if (isEdit) {
        // Edit Vehicle Details
        const response = await apiClient.put(`/api/vehicles/${id}`, payload);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update listing');
        }
      } else {
        // Create Vehicle Details
        const response = await apiClient.post('/api/vehicles', payload);
        if (response.data.success) {
          savedVehicleId = response.data.data.id;
        } else {
          throw new Error(response.data.message || 'Failed to save listing');
        }
      }

      // Upload selected images one by one if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          await apiClient.post(`/api/vehicles/${savedVehicleId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }

      navigate('/owner');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while saving the listing.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return <div className="p-8 text-center animate-pulse font-medium text-brand-body">Loading details...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in pb-16">
      <button onClick={() => navigate('/owner')} className="text-sm font-medium flex items-center gap-2 hover:underline text-brand-ink">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to dashboard</span>
      </button>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-ink">
        {isEdit ? 'Edit vehicle listing' : 'List a new vehicle'}
      </h1>

      {error && (
        <div className="p-4 text-sm bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-brand-canvas border border-brand-surface-pressed p-6 md:p-8 rounded-xl">
        
        {/* Category selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Category <span className="text-red-500">*</span></label>
          <select
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none cursor-pointer"
            {...register('category', { required: 'Category is required' })}
          >
            <option value="PERSONAL">Personal Vehicle (Car, Bike, EV)</option>
            <option value="TRANSPORT">Transport Vehicle (Truck, Van, Tempo)</option>
            <option value="CONSTRUCTION">Construction Equipment (Excavator, Crane)</option>
            <option value="TRAVEL">Travel Vehicle (Traveller, Bus)</option>
          </select>
        </div>

        {/* Subcategory */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Subcategory / model type <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Sedan, SUV, Hydraulic Excavator"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
            {...register('subcategory', { required: 'Subcategory is required' })}
          />
          {errors.subcategory && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.subcategory.message}</p>}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Listing title <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Honda City 2022 Petrol, JCB Excavator 3DX"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Description</label>
          <textarea
            placeholder="Provide detail about vehicle conditions, rental terms, etc."
            rows="4"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none resize-none"
            {...register('description')}
          />
        </div>

        {/* Location City */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Location city <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Mumbai, Pune"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
            {...register('locationCity', { required: 'City location is required' })}
          />
          {errors.locationCity && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.locationCity.message}</p>}
        </div>

        {/* Pricing rates grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">
            Pricing rates (₹) <span className="text-red-500">*</span> <span className="text-brand-mute font-normal lowercase">(set at least one)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-brand-body">Hourly rate</span>
              <input
                type="number"
                placeholder="Rate per Hour"
                className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
                {...register('hourlyRate')}
              />
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-brand-body">Daily rate</span>
              <input
                type="number"
                placeholder="Rate per Day"
                className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
                {...register('dailyRate')}
              />
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-brand-body">Monthly rate</span>
              <input
                type="number"
                placeholder="Rate per Month"
                className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
                {...register('monthlyRate')}
              />
            </div>
          </div>
        </div>

        {/* Operator Checkbox */}
        <div className="flex items-center gap-3 p-4 bg-brand-canvas-soft border border-brand-surface-pressed rounded-none">
          <input
            type="checkbox"
            id="operator"
            className="w-4 h-4 bg-brand-canvas-soft text-brand-black border-brand-surface-pressed rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
            {...register('operatorAvailable')}
          />
          <label htmlFor="operator" className="text-xs font-medium cursor-pointer select-none">
            <span className="block font-bold text-brand-ink">Operator available</span>
            <span className="text-[10px] text-brand-body font-normal">Toggle if you provide a professional driver/operator for bookings</span>
          </label>
        </div>

        <hr className="border-brand-surface-pressed" />

        {/* Specifications row array */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Technical specifications</label>
            <button
              type="button"
              onClick={() => append({ specKey: '', specValue: '' })}
              className="text-xs text-brand-ink font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add specification</span>
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="e.g. Fuel Type, Capacity"
                  className="w-1/2 px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
                  {...register(`specifications.${index}.specKey`)}
                />
                <input
                  type="text"
                  placeholder="e.g. Diesel, 10 Tons"
                  className="w-1/2 px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
                  {...register(`specifications.${index}.specValue`)}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-pill border border-transparent hover:border-red-100 transition duration-150"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-brand-surface-pressed" />

        {/* Images uploads */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Vehicle images</label>
          
          {/* Existing images list if edit */}
          {isEdit && existingImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {existingImages.map((img) => (
                <div key={img.id} className="h-20 border border-brand-surface-pressed rounded-lg overflow-hidden relative group">
                  <img
                    src={img.imageUrl.startsWith('/uploads') ? `${API_BASE_URL}${img.imageUrl}` : img.imageUrl}
                    alt="Existing image"
                    className="w-full h-full object-cover"
                  />
                  {img.isPrimary && (
                    <span className="absolute bottom-1 left-1 bg-brand-black text-brand-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New files select area */}
          <div className="border border-dashed border-brand-surface-pressed hover:border-brand-ink rounded-lg p-8 text-center cursor-pointer transition relative bg-brand-canvas-soft">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-brand-body mx-auto mb-2" />
            <span className="block text-sm font-bold text-brand-ink">Click or drag images to upload</span>
            <span className="block text-xs text-brand-body font-normal mt-1">Supports PNG, JPG, JPEG</span>
          </div>

          {/* New files list selected queue */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 mt-4 bg-brand-canvas-soft border border-brand-surface-pressed p-4 rounded-lg">
              <span className="text-[10px] font-bold text-brand-body uppercase tracking-wider block mb-2">Upload queue</span>
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-medium text-brand-ink">
                  <span className="truncate max-w-[250px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    className="text-red-500 hover:underline hover:text-red-700 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit btn */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-black text-brand-white font-medium rounded-pill hover:bg-brand-black-elevated active:scale-[0.98] transition flex items-center justify-center text-sm"
        >
          {loading ? 'Saving listing details...' : isEdit ? 'Save changes' : 'Submit listing for approval'}
        </button>
      </form>
    </div>
  );
}
