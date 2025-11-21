export type InvoiceLineItem = {
  id: number;
  invoiceId: number;
  type: 'RENT' | 'MANAGEMENT_FEE' | 'ELECTRICITY_USAGE' | 'ELECTRICITY_BASIC';
  description: string;
  amountKrw: string;
  vatKrw: string;
};

export type InvoiceDetail = {
  id: number;
  leaseId: number;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  totalAmountKrw: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID';
  lineItems: InvoiceLineItem[];
  tenant: {
    id: number;
    name: string;
    email: string;
  };
  unit: {
    id: number;
    unitNumber: string;
    buildingId: number;
  };
  lease: {
    id: number;
    startDate: string;
    endDate: string;
  };
};
