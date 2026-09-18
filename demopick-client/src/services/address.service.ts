export type AddressLabelType = 'home' | 'office' | 'court' | 'other';

export interface UserAddress {
  id: string;
  label: AddressLabelType;
  customLabel?: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

const STORAGE_KEY = 'demopick_user_addresses';

const INITIAL_ADDRESSES: UserAddress[] = [];

class AddressService {
  public getSavedAddresses(): UserAddress[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list.filter(
          (a: any) =>
            a &&
            a.recipientName &&
            a.recipientName !== 'Nguyễn Văn An' &&
            !a.id?.startsWith('addr-0')
        );
      }
      return [];
    } catch {
      return [];
    }
  }

  public saveAddresses(list: UserAddress[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  }

  public addAddress(data: Omit<UserAddress, 'id'>): UserAddress {
    const list = this.getSavedAddresses();
    const newId = `addr-${Date.now()}`;
    const newAddress: UserAddress = {
      ...data,
      id: newId,
      isDefault: data.isDefault || list.length === 0,
    };

    let updatedList = list;
    if (newAddress.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }
    updatedList = [newAddress, ...updatedList];
    this.saveAddresses(updatedList);
    return newAddress;
  }

  public updateAddress(id: string, data: Partial<UserAddress>): UserAddress | null {
    const list = this.getSavedAddresses();
    const target = list.find((a) => a.id === id);
    if (!target) return null;

    const updatedList = list.map((a) => {
      if (a.id === id) {
        return { ...a, ...data };
      }
      if (data.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    this.saveAddresses(updatedList);
    return updatedList.find((a) => a.id === id) || null;
  }

  public deleteAddress(id: string): void {
    const list = this.getSavedAddresses().filter((a) => a.id !== id);
    if (list.length > 0 && !list.some((a) => a.isDefault)) {
      list[0].isDefault = true;
    }
    this.saveAddresses(list);
  }

  public setDefaultAddress(id: string): void {
    const list = this.getSavedAddresses().map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    this.saveAddresses(list);
  }

  public getDefaultAddress(): UserAddress | null {
    const list = this.getSavedAddresses();
    return list.find((a) => a.isDefault) || list[0] || null;
  }
}

export const addressService = new AddressService();
