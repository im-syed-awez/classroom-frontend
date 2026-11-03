import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { Search } from "lucide-react";
import { API_URL } from "@/providers/constants";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SearchResults = {
  classes: { id: number; name: string; status: string }[];
  subjects: { id: number; name: string; code: string }[];
  departments: { id: number; name: string; code: string }[];
  users: { id: string; name: string; email: string; role: string }[];
};

type SearchSection = {
  title: string;
  items: Array<Record<string, unknown>>;
  to: (item: Record<string, unknown>) => string;
  label: (item: Record<string, unknown>) => string;
};

async function searchAll(term: string): Promise<SearchResults> {
  const response = await fetch(`${API_URL}/analytics/search?q=${encodeURIComponent(term)}`, { credentials: "include" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error ?? "Search failed");
  return payload.data as SearchResults;
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const resultsQuery = useQuery({ queryKey: ["global-search", query], queryFn: () => searchAll(query), enabled: query.length >= 2 });
  const results = resultsQuery.data;
  const sections: SearchSection[] = [
    {
      title: "Classes",
      items: results?.classes ?? [],
      to: (item) => `/classes/show/${String(item.id)}`,
      label: (item) => `${String(item.name)} · ${String(item.status)}`,
    },
    {
      title: "Subjects",
      items: results?.subjects ?? [],
      to: (item) => `/subjects/show/${String(item.id)}`,
      label: (item) => `${String(item.name)} · ${String(item.code)}`,
    },
    {
      title: "Departments",
      items: results?.departments ?? [],
      to: (item) => `/departments/show/${String(item.id)}`,
      label: (item) => `${String(item.name)} · ${String(item.code)}`,
    },
    {
      title: "Users",
      items: results?.users ?? [],
      to: (item) => `/users/show/${String(item.id)}`,
      label: (item) => `${String(item.name)} · ${String(item.email)} · ${String(item.role)}`,
    },
  ];

  return <ListView>
    <Breadcrumb />
    <div className="mt-2 flex items-center gap-2"><Search className="h-6 w-6 text-primary" /><h1 className="page-title text-2xl font-bold">Search</h1></div>
    <p className="my-3 text-sm text-muted-foreground">Results for “{query}”</p>
    {query.length < 2 ? <p role="status">Enter at least two characters in the global search.</p> : resultsQuery.isLoading ? <p>Searching…</p> : resultsQuery.isError ? <p role="alert" className="text-destructive">{resultsQuery.error instanceof Error ? resultsQuery.error.message : "Search failed."}</p> : <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section) => <Card key={section.title}><CardHeader><CardTitle>{section.title}</CardTitle></CardHeader><CardContent>{section.items.length ? <ul className="space-y-2">{section.items.map((item, index) => <li key={String((item as Record<string, unknown>).id ?? `${section.title}-${index}`)}><Link className="text-primary underline-offset-4 hover:underline" to={section.to(item)}>{section.label(item)}</Link></li>)}</ul> : <p className="text-sm text-muted-foreground">No matches.</p>}</CardContent></Card>)}
    </div>}
  </ListView>;
}
