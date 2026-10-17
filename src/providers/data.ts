import { API_URL } from "@/providers/constants";
import { CreateResponse, ListResponse } from "@/types";
import { HttpError } from "@refinedev/core";
import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest"

// Displaying the security errors on the frontend
const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = 'Request failed';

  try {
    const payload = (await response.json()) as {message?: string }
    
    if(payload?.message) message = payload.message;
  } catch {
    // Ignore errors
  }
  return {
    message,
    statusCode: response.status
  }
}

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,
    // We are building out the params that our API will be able to consume; after applying it you will see the search-query work with: code, name.
    buildQueryParams: async ({ resource, pagination, filters, sorters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string|number> = { page, limit: pageSize };

      if (resource === 'subjects' && sorters?.length) {
        params.sortBy = sorters[0].field;
        params.sortOrder = sorters[0].order;
      }

      filters?.forEach((filter) => {
        const field = 'field' in filter ? filter.field : '';
        const value = String(filter.value);

        if (resource === 'subjects') {
          if (field === 'department' && value && value !== 'all') {
            params.department = value;
          }
          if (field === 'search' || field === 'name' || field === 'code') {
            if (value) params.search = value;
          }
        }

        if (resource === 'users' && field === 'role' && value) {
          params.role = value;
        }
      });
      // and finally we built it, now return it.
      return params;
    },
    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);
      
      const payload: ListResponse = await response.clone().json();

      return payload.data ?? [];
    },
    getTotalCount: async (response) => {
      if(!response.ok) throw await buildHttpError(response);

      const payload: ListResponse = await response.clone().json();

      const total = payload.pagination?.total ?? payload.data?.length ?? 0;
      return typeof total === 'string' ? Number(total) : total;
    }

  },
  create: {
    getEndpoint: ({ resource }) => resource,

    buildBodyParams: async ({variables}) => variables,

    mapResponse: async (response) => {
      const json: CreateResponse = await response.json();

      return json.data ?? [];
    }
      
    },
  
}

const { dataProvider } = createDataProvider(API_URL, options);

export {dataProvider};  

