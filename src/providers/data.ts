import {BaseRecord, DataProvider, GetListParams, GetListResponse} from "@refinedev/core";
import { Subject } from "@/types";

export const mockSubjects: Subject[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "CS",
    description: "An introduction to programming, algorithms, and core computer science concepts.",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: 2,
    code: "MATH201",
    name: "Linear Algebra",
    department: "Math",
    description: "Study of vectors, matrices, and linear transformations with applications.",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: 3,
    code: "ENG110",
    name: "Academic Writing",
    department: "English",
    description: "Develops research, argumentation, and academic writing skills.",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
];

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
    filters = [],
    sorters = [],
    pagination,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    if(resource !== 'subjects') return { data: [] as TData[], total:0};

    let subjects = [...mockSubjects];

    subjects = subjects.filter((subject) =>
      filters.every((filter) => {
        if (!("field" in filter)) return true;

        const fieldValue = subject[filter.field as keyof Subject];
        if (filter.operator === "eq") return fieldValue === filter.value;
        if (filter.operator === "contains") {
          return String(fieldValue ?? "")
            .toLowerCase()
            .includes(String(filter.value ?? "").toLowerCase());
        }

        return true;
      }),
    );

    for (const sorter of sorters) {
      subjects.sort((a, b) => {
        const aValue = a[sorter.field as keyof Subject];
        const bValue = b[sorter.field as keyof Subject];
        const comparison = String(aValue ?? "").localeCompare(String(bValue ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });

        return sorter.order === "asc" ? comparison : -comparison;
      });
    }

    const total = subjects.length;
    const pageSize = pagination?.pageSize;
    if (pagination?.mode !== "off" && pageSize) {
      const currentPage = pagination.currentPage ?? 1;
      const start = (currentPage - 1) * pageSize;
      subjects = subjects.slice(start, start + pageSize);
    }

    return {
      data: subjects as unknown as TData[],
      total,
    }
  },
    getOne: async () => { throw new Error('This function is not present in mock') },
    create: async () => { throw new Error('This function is not present in mock') },
    update: async () => { throw new Error('This function is not present in mock') },
    deleteOne: async () => { throw new Error('This function is not present in mock') },

    getApiUrl: () => '',

}
  

