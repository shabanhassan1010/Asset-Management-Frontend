export interface AskAssetQuestionRequest {
  question: string;
}

export interface AssetQuestionResult {
  id: number;
  assetCode: string;
  assetName: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  assetType?: string;
  category?: string;
  status?: string;
  employeeName?: string;
  departmentName?: string;
  locationName?: string;

  // Optional on purpose. For a non-admin the API omits this key entirely,
  // so the field is absent rather than null. The UI therefore decides whether
  // to show a cost column by looking at the DATA, never by checking the role -
  // which means the client cannot get the authorization decision wrong,
  // because it never makes one.
  purchaseCost?: number;
}

export interface AssetQuestionResponse {
  question: string;
  answer: string;
  assets: AssetQuestionResult[];
  totalCount: number;
  suggestions: string[];  
}

// What the chat renders. This is a view model and never leaves the browser -
// it is not the API shape.
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  assets?: AssetQuestionResult[];
  totalCount?: number;
  isError?: boolean;
  suggestions?: string[]; 
}