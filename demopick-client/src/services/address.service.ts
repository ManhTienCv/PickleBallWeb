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

const INITIAL_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-01',
    label: 'home',
    recipientName: 'Nguyễn Văn An',
    phone: '0987654321',
    streetAddress: 'Số 10 Đường Pickleball, Phường Dịch Vọng',
    district: 'Quận Cầu Giấy',
    city: 'Hà Nội',
    isDefault: true,
    lat: 21.0333,
    lng: 105.7917,
  },
  {
    id: 'addr-02',
    label: 'office',
    recipientName: 'Nguyễn Văn An (Công ty)',
    phone: '0987654321',
    streetAddress: 'Tầng 18, Toà nhà Keangnam Landmark 72, Phạm Hùng',
    district: 'Quận Nam Từ Liêm',
    city: 'Hà Nội',
    isDefault: false,
    lat: 21.0167,
    lng: 105.7833,
  },
  {
    id: 'addr-03',
    label: 'court',
    recipientName: 'Nguyễn Văn An (Sân Quận 7)',
    phone: '0987654321',
    streetAddress: 'Cụm Sân DemoPick Pickleball, 123 Đường Pickleball, Tân Phong',
    district: 'Quận 7',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
    lat: 10.7324,
    lng: 106.7029,
  },
];

class AddressService {
  public getSavedAddresses(): UserAddress[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADDRESSES));
        return INITIAL_ADDRESSES;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADDRESSES;
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

    let updatedList = list.map((a) => {
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
    let list = this.getSavedAddresses().filter((a) => a.id !== id);
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
