import { BACKEND_BASE_URL } from "@/constants"
import { ListResponse } from "@/types";
import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest"

if (!BACKEND_BASE_URL)
  throw new Error('BACKEND_BASE_URL is not configured. Please set VITE_BACKEND_BASE_URL in your .env file.');

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
      });
      // and finally we built it, now return it.
      return params;
    },
    mapResponse: async (response) => {
      const payload: ListResponse = await response.clone().json();

      return payload.data ?? [];
    },
    getTotalCount: async (response) => {
      const payload: ListResponse = await response.clone().json();

      const total = payload.pagination?.total ?? payload.data?.length ?? 0;
      return typeof total === 'string' ? Number(total) : total;
    }

  }
}

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export {dataProvider};  

