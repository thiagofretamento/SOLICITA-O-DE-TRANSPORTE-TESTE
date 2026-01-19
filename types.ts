
export interface TransportRequest {
  id: string;
  [key: string]: string;
}

export interface FieldDefinition {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'date' | 'time' | 'number' | 'email' | 'tel';
  required?: boolean;
}
