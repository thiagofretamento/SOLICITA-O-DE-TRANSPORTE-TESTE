
export interface TransportRequest {
  id: string;
  [key: string]: string;
}

export interface Passenger {
  id: string;
  name: string;
  cpf: string;
}

export interface SavedPassengerList {
  id: string;
  processNumber: string;
  departureDate: string;
  returnDate: string;
  originCity: string;
  destinationCity: string;
  passengers: Passenger[];
  updatedAt: number;
}

export interface FieldDefinition {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'date' | 'time' | 'number' | 'email' | 'tel';
  required?: boolean;
}
