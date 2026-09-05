// src/app/core/api-endpoints.ts

import { environment } from '../../../environments/environment';

const base = environment.apiUrl; // https://localhost:7266/api

export const API = {
  auth: {
    login:   `${base}/v1/auth/login`,
    refresh: `${base}/v1/auth/refresh`,
    logout:  `${base}/v1/auth/logout`,
    me:      `${base}/v1/auth/me`,
  },

  assets: {
    paginated:                  `${base}/v1/assets/paginated`,
    create:                     `${base}/v1/assets`,
    byId:       (id: number) => `${base}/v1/assets/${id}`,
    retire:     (id: number) => `${base}/v1/assets/${id}/retire`,
    transfers:  (id: number) => `${base}/v1/assets/${id}/transfers`,
  },

  dashboard: {
    summary: `${base}/v1/dashboard/summary`,
  },

  ai: {
    ask: `${base}/v1/ai/ask`,
  },

  users: {
    list:                   `${base}/v1/users`,
    create:                 `${base}/v1/users`,
    role:   (id: string) => `${base}/v1/users/${id}/role`,
    status: (id: string) => `${base}/v1/users/${id}/status`,
  },

  employees: {
  availableForUser: (departmentId: number) =>`${base}/v1/employees/available-for-user?departmentId=${departmentId}`,
    base:                                    `${base}/v1/employees`,
    paginated:                               `${base}/v1/employees/paginated`,
    byId:          (id: number) =>           `${base}/v1/employees/${id}`,
    status:        (id: number) =>           `${base}/v1/employees/${id}/status`,
},

  lookupAdmin: {
    category: {
      list:                 `${base}/v1/categories`,
      create:               `${base}/v1/categories`,
      byId: (id: number) => `${base}/v1/categories/${id}`,
    },
    assetType: {
      list:                 `${base}/v1/asset-types`,
      create:               `${base}/v1/asset-types`,
      byId: (id: number) => `${base}/v1/asset-types/${id}`,
    },
    department: {
      list:                 `${base}/v1/departments`,
      create:               `${base}/v1/departments`,
      byId: (id: number) => `${base}/v1/departments/${id}`,
    },
    location: {
      list:                  `${base}/v1/locations`,
      create:                `${base}/v1/locations`,
      byId: (id: number) =>  `${base}/v1/locations/${id}`,
    },
  },

  lookups: {
    categories:  `${base}/v1/categories`,
    assetTypes:  `${base}/v1/asset-types`,
    departments: `${base}/v1/departments`,
    locations:   `${base}/v1/locations`,
    employees:   `${base}/v1/employees`,
  },
};
