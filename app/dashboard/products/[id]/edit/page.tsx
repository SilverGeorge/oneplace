import Link from "next/link";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#008080]">
          Dashboard / Products
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1a1a1a]">Edit Product #{resolved.id}</h1>
        <p className="mt-2 text-sm text-[#666]">
          Product edit route is ready. This route exists so table and grid edit actions work without
          a 404.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/dashboard/products"
            className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Products
          </Link>
          <button
            type="button"
            className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
          >
            Save changes
          </button>
        </div>
      </div>
    </main>
  );
}
