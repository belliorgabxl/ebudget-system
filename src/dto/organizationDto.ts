// Organization DTOs based on API documentation

export interface OrganizationResponse {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateOrganizationRequest {
  name: string;
  type?: string;
}

export interface UpdateOrganizationRequest {
  id: string;
  name: string;
  type?: string;
}

export interface OrganizationListResponse {
  data: OrganizationResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetOrganizationsParams {
  page?: number;
  limit?: number;
  name?: string;
  type?: string;
  is_active?: boolean;
}
