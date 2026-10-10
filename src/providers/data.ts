import { BACKEND_BASE_URL } from "@/constants"
import { ListResponse } from "@/types";
import { createDataProvider, type CreateDataProviderOptions } from "@refinedev/rest"

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,
    // We are building out the params that our API will be able to consume; after applying it you will see the search-query work with: code, name.
    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string|number> = { page, limit: pageSize };

      filters?.forEach((filter) => {
        const field = 'field' in filter ? filter.field : '';
        const value = String(filter.value);

        if(resource === 'subjects') {
          if(field === 'department') params.department = value;
          if(field === 'name' || field === 'code') params.search = value;
        }
      })
      // and finally we built it, now return it.
      return params;
    },
    mapResponse: async (response) => {
      const payload: ListResponse = await response.json();

      return payload.data ?? [];

    },
    getTotalCount: async (response) => {
      const payload: ListResponse = await response.json();

      return payload.pagination?.total ?? payload.data?.length ?? 0;
    }

  }
}

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export {dataProvider};  

