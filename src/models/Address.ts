import { User } from "./User";

export interface Address {
  id?: number;
  street: string;
  number: string;
  latitude?: number | null;
  longitude?: number | null;
  user_id?: number;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export const AddressUtils = {
  hasValidCoordinates: (address: Address): boolean => {
    return !!(address.latitude && address.longitude);
  },
  
  getGoogleMapsUrl: (address: Address): string => {
    if (address.latitude && address.longitude) {
      return `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
    }
    // Fallback: usar dirección textual
    return `https://www.google.com/maps/search/${encodeURIComponent(address.street + ' ' + address.number)}`;
  },
  
  getEmbeddedMapUrl: (address: Address): string => {
    if (address.latitude && address.longitude) {
      return `https://maps.google.com/maps?q=${address.latitude},${address.longitude}&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(address.street + ' ' + address.number)}&z=15&output=embed`;
  }
};