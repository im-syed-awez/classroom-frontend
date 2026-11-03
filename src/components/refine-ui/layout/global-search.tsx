import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (term.length >= 2) navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return <form onSubmit={submit} role="search" className="flex w-full max-w-sm items-center gap-2">
    <div className="relative min-w-0 flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input aria-label="Global search" placeholder="Search classes, subjects…" className="h-9 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} />
    </div>
    <Button type="submit" variant="outline" size="sm" disabled={query.trim().length < 2}>Search</Button>
  </form>;
}
