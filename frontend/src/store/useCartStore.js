import { create } from 'zustand';

export const useCartStore = create((set) => ({
  bookingDraft: JSON.parse(localStorage.getItem('bookingDraft')) || null,

  setBookingDraft: (draft) => {
    localStorage.setItem('bookingDraft', JSON.stringify(draft));
    set({ bookingDraft: draft });
  },

  clearBookingDraft: () => {
    localStorage.removeItem('bookingDraft');
    set({ bookingDraft: null });
  },
}));
