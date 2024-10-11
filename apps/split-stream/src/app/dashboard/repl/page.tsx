import { PgRepl } from "@/components/pg-repl";

export default function PageRepl() {
  return (
    <div className="flex-1 w-full flex">
      <PgRepl className={`h-[calc(100vh-8rem)]`} />
    </div>
  );
}