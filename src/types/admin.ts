export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'catering'
  | 'events'
  | 'coupons'
  | 'storefront'
  | 'inventory'
  | 'finances'
  | 'fleet'
  | 'staff'
  | 'support';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Grains & Pulses' | 'Dairy & Oils' | 'Spices & Masala' | 'Vegetables & Meat' | 'Packaging';
  currentStock: number;
  minThreshold: number;
  unit: 'kg' | 'liters' | 'packets' | 'boxes';
  costPerUnit: number;
  lastRestocked: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'critical';
  linkedDishes: string[];
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: 'Raw Ingredients' | 'Fuel & Travel' | 'Staff Salaries' | 'Vehicle Maintenance' | 'Kitchen Utilities' | 'Packaging & Marketing';
  amount: number;
  paidTo: string;
  paymentMode: 'Bank Transfer' | 'UPI' | 'Cash';
  notes: string;
  receiptNumber?: string;
}

export interface VehicleRecord {
  id: string;
  type: 'Two Wheeler (Bike)' | 'Mini Truck (Tata Ace)' | 'Delivery Van';
  registrationNumber: string;
  driverName: string;
  driverPhone: string;
  status: 'Available' | 'On Delivery' | 'In Service';
  currentOrderId?: string;
  insuranceValidUntil: string;
  pollutionValidUntil: string;
  fuelType: 'Petrol' | 'Diesel' | 'EV';
  totalTripsCompleted: number;
  lastServiceDate: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Delivery Executive' | 'Head Chef' | 'Kitchen Assistant' | 'Catering Supervisor' | 'Operations Manager';
  phone: string;
  email: string;
  monthlySalary: number;
  status: 'Available' | 'On Delivery' | 'In Kitchen' | 'Off Duty' | 'On Leave';
  isPresentToday: boolean;
  assignedVehicleId?: string;
  ordersCompleted: number;
  rating: number;
  joinDate: string;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerPhone: string;
  orderId?: string;
  category: 'Order Delay' | 'Food Quality' | 'Packaging Issue' | 'Catering Inquiry' | 'Payment & Refund';
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}

export interface DeliveryProof {
  id: string;
  orderId: string;
  riderName: string;
  customerName: string;
  dropAddress: string;
  timestamp: string;
  photoUrl: string;
  customerSignatureNotes?: string;
  deliveryPartnerType: 'Company Staff' | 'Rapido' | 'Dunzo';
  thirdPartyTrackingId?: string;
}

export interface AdminAnalyticsSummary {
  todayRevenue: number;
  todayOrdersCount: number;
  activeOrdersCount: number;
  pendingCateringQuotesCount: number;
  pendingPaymentsAmount: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netOperatingProfit: number;
}
