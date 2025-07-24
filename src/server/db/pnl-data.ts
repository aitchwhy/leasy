import type { TenantBilling } from '@/shared/types'

// Data from "PNL임차인" sheet in the Excel file
// 2025년 5월분 data
export const pnlTenantData: TenantBilling[] = [
  {
    id: 'tenant-b102',
    unit: 'B102',
    name: '디아삽',
    businessNumber: '211-10-21870',
    monthlyRent: 2080000,
    electricityCharge: 66234,
    waterCharge: 41778,
    vat: 208000,
    totalAmount: 2396012
  },
  {
    id: 'tenant-101',
    unit: '101',
    name: '늘봄약국',
    businessNumber: '298-04-00449',
    monthlyRent: 2918710,
    electricityCharge: 73424,
    waterCharge: 17397,
    vat: 291871,
    totalAmount: 3301401
  },
  {
    id: 'tenant-102',
    unit: '102',
    name: '제이랩',
    businessNumber: '720-32-00051',
    monthlyRent: 1620000,
    electricityCharge: 38564,
    waterCharge: 17397,
    vat: 162000,
    totalAmount: 1837960
  },
  {
    id: 'tenant-201',
    unit: '201',
    name: 'MK math',
    businessNumber: '261-81-02257',
    monthlyRent: 1890000,
    electricityCharge: 52749,
    waterCharge: 15961,
    vat: 189000,
    totalAmount: 2147710
  },
  {
    id: 'tenant-202',
    unit: '202',
    name: '굿슬립신경과',
    businessNumber: '201-06-71129',
    monthlyRent: 2000000,
    electricityCharge: 157982,
    waterCharge: 22967,
    vat: 200000,
    totalAmount: 2380949
  },
  {
    id: 'tenant-301',
    unit: '301',
    name: '서울브레인신경과',
    businessNumber: '211-90-68256',
    monthlyRent: 3500000,
    electricityCharge: 144692,
    waterCharge: 29159,
    vat: 350000,
    totalAmount: 4023851
  },
  {
    id: 'tenant-302',
    unit: '302',
    name: '올고톡',
    businessNumber: '211-87-84329',
    monthlyRent: 2150000,
    electricityCharge: 27258,
    waterCharge: 23203,
    vat: 215000,
    totalAmount: 2415461
  },
  {
    id: 'tenant-401',
    unit: '401',
    name: '라이언아카데미',
    businessNumber: '120-87-43696',
    monthlyRent: 2400000,
    electricityCharge: 45416,
    waterCharge: 15833,
    vat: 240000,
    totalAmount: 2701249
  },
  {
    id: 'tenant-402',
    unit: '402',
    name: '라이언아카데미',
    businessNumber: '745-87-00012',
    monthlyRent: 2080000,
    electricityCharge: 110847,
    waterCharge: 21210,
    vat: 208000,
    totalAmount: 2420057
  },
  {
    id: 'tenant-501',
    unit: '501',
    name: '다와',
    businessNumber: '211-86-76652',
    monthlyRent: 1600000,
    electricityCharge: 123994,
    waterCharge: 10817,
    vat: 160000,
    totalAmount: 1894811
  },
  {
    id: 'tenant-502',
    unit: '502',
    name: '라이언아카데미',
    businessNumber: '261-81-03770',
    monthlyRent: 1410000,
    electricityCharge: 68218,
    waterCharge: 12448,
    vat: 141000,
    totalAmount: 1631666
  },
  {
    id: 'tenant-503',
    unit: '503',
    name: '예원연습실',
    businessNumber: '000-00-00000',
    monthlyRent: 1200000,
    electricityCharge: 115497,
    waterCharge: 9512,
    vat: 120000,
    totalAmount: 1445009
  }
]

// Calculate total monthly revenue (including VAT)
export const totalMonthlyRevenue = pnlTenantData.reduce((sum, tenant) =>
  sum + tenant.monthlyRent + tenant.vat, 0
)

// Building summary
export const pnlBuildingSummary = {
  id: 'pnl-001',
  name: 'PNL Building',
  address: '서울특별시 강남구 논현로 159길 17',
  owner: 'Il Keun Lee',
  totalUnits: 13,
  occupiedUnits: 12,
  monthlyRevenue: totalMonthlyRevenue
}
