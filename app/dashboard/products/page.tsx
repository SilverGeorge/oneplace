"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdCloudUpload,
  MdClose,
  MdContentCopy,
  MdDelete,
  MdDownload,
  MdEdit,
  MdFolder,
  MdGridView,
  MdInventory2,
  MdList,
  MdMenu,
  MdSearch,
  MdVisibility
} from "react-icons/md";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";
import { usePreviewMode } from "@/hooks/use-preview-mode";

type ProductStatus = "Active" | "Inactive" | "Draft" | "Out of Stock";
type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  rating?: number;
  reviews?: number;
  sold: number;
  dateAdded: string;
  image?: string;
};

type Category = {
  id: string;
  name: string;
  parentCategory?: string | null;
  slug: string;
  status: "Active" | "Inactive";
  createdAt: string;
  productCount: number;
  description?: string;
};

type TabId = "all" | "add" | "bulk" | "categories";
type CategoryModalState = { mode: "create" | "edit"; category?: Category } | null;

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition focus:border-[#008080] focus:outline-none";

export default function ProductsPage() {
  const pathname = usePathname() ?? "/dashboard/products";
  const isPreviewMode = usePreviewMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest first");
  const [isGridView, setIsGridView] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("Bulk Actions");
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [previewing, setPreviewing] = useState<Product | null>(null);

  const [categoryView, setCategoryView] = useState<"list" | "tree">("list");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>(null);
  const [categoryDeleting, setCategoryDeleting] = useState<Category | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          apiRequest<{ items: Product[] }>("/api/products"),
          apiRequest<{ items: Category[] }>("/api/categories")
        ]);
        if (!mounted) return;
        setProducts(productsRes.data.items);
        setCategories(categoriesRes.data.items);
      } catch {
        if (mounted) setToast("Could not load products data");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    void loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredProducts = useMemo(() => {
    let rows = products.filter((item) =>
      [item.name, item.sku, item.category].join(" ").toLowerCase().includes(query.toLowerCase())
    );
    if (categoryFilter !== "All categories")
      rows = rows.filter((item) => item.category === categoryFilter);
    if (statusFilter !== "All") rows = rows.filter((item) => item.status === statusFilter);
    if (priceFilter === "Under $50") rows = rows.filter((item) => item.price < 50);
    if (priceFilter === "$50-$100")
      rows = rows.filter((item) => item.price >= 50 && item.price <= 100);
    if (priceFilter === "$100-$500")
      rows = rows.filter((item) => item.price > 100 && item.price <= 500);
    if (priceFilter === "$500+") rows = rows.filter((item) => item.price > 500);
    if (stockFilter === "In Stock") rows = rows.filter((item) => item.stock > 10);
    if (stockFilter === "Low Stock")
      rows = rows.filter((item) => item.stock > 0 && item.stock <= 10);
    if (stockFilter === "Out of Stock") rows = rows.filter((item) => item.stock <= 0);
    if (dateFilter === "Last 7 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.2)));
    if (dateFilter === "Last 30 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.6)));
    if (dateFilter === "Last 90 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.9)));
    rows = [...rows].sort((a, b) => {
      if (sortBy === "Oldest first") return a.id.localeCompare(b.id);
      if (sortBy === "Alphabetical") return a.name.localeCompare(b.name);
      if (sortBy === "Price (high-low)") return b.price - a.price;
      if (sortBy === "Price (low-high)") return a.price - b.price;
      if (sortBy === "Most popular") return b.sold - a.sold;
      return b.id.localeCompare(a.id);
    });
    return rows;
  }, [products, query, categoryFilter, statusFilter, priceFilter, stockFilter, dateFilter, sortBy]);

  const filteredCategories = useMemo(
    () =>
      categories.filter((item) =>
        [item.name, item.slug, item.parentCategory ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(categorySearch.toLowerCase())
      ),
    [categories, categorySearch]
  );

  const productStats = useMemo(() => {
    const total = products.length;
    const active = products.filter((item) => item.status === "Active").length;
    const outOfStock = products.filter((item) => item.stock <= 0).length;
    const totalValue = products.reduce(
      (sum, item) => sum + item.price * Math.max(item.stock, 0),
      0
    );
    return { total, active, outOfStock, totalValue };
  }, [products]);

  const categoryStats = useMemo(() => {
    const total = categories.length;
    const parents = categories.filter((item) => !item.parentCategory).length;
    const children = categories.filter((item) => Boolean(item.parentCategory)).length;
    return { total, parents, children };
  }, [categories]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredProducts.map((item) => item.id));
  }

  async function applyBulkAction(action: string) {
    if (action === "Bulk Actions" || selectedIds.length === 0) return;
    if (action === "Delete selected") {
      setProducts((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setToast("Selected products deleted");
    } else if (action === "Change status") {
      setProducts((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, status: "Active" as const } : item
        )
      );
      setToast("Status updated for selected products");
    } else if (action === "Update stock") {
      setProducts((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, stock: item.stock + 5 } : item
        )
      );
      setToast("Stock updated for selected products");
    } else if (action === "Update price") {
      setProducts((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id)
            ? { ...item, price: Number((item.price * 1.03).toFixed(2)) }
            : item
        )
      );
      setToast("Price updated for selected products");
    } else if (action === "Edit category") {
      setProducts((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, category: "Electronics" } : item
        )
      );
      setToast("Category updated for selected products");
    }
    setSelectedIds([]);
    setBulkAction("Bulk Actions");
  }

  function duplicateProduct(product: Product) {
    const newProduct: Product = {
      ...product,
      id: `${product.id}-COPY`,
      sku: `${product.sku}-COPY`,
      name: `${product.name} Copy`,
      dateAdded: "Today"
    };
    setProducts((prev) => [newProduct, ...prev]);
    setToast("Product duplicated successfully");
  }

  function exportCsv() {
    const header = "ID,Name,SKU,Category,Price,Stock,Status,Rating,Reviews,Sold,Date Added\n";
    const body = filteredProducts
      .map((item) =>
        [
          item.id,
          item.name,
          item.sku,
          item.category,
          item.price.toFixed(2),
          item.stock,
          item.status,
          item.rating ?? "",
          item.reviews ?? "",
          item.sold,
          item.dateAdded
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "products.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="animate-form-fade min-h-screen bg-white">
      <div className="flex">
        <SidebarMenu
          pathname={pathname}
          isPreviewMode={isPreviewMode}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded p-2 text-[#008080] hover:bg-[#f0fffe] md:hidden"
            aria-label="Open menu"
          >
            <MdMenu size={24} />
          </button>
          <nav className="text-sm text-[#666]" aria-label="Breadcrumb">
            <Link
              href={withPreviewParam("/dashboard", isPreviewMode)}
              className="text-[#008080] hover:underline"
            >
              Dashboard
            </Link>{" "}
            &gt; Products
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Products</h1>
          <p className="text-sm text-[#666]">Manage your product inventory and catalog</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Products" },
              { id: "add", label: "Add Product" },
              { id: "bulk", label: "Bulk Upload" },
              { id: "categories", label: "Categories" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition",
                  activeTab === tab.id
                    ? "border-[#008080] bg-[#008080] font-semibold text-white"
                    : "border-[#e0e0e0] text-[#333] hover:bg-[#f0fffe]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "all" ? (
            <section className="animate-form-fade mt-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard label="Total Products" value={`${productStats.total}`} />
                <StatsCard label="Active Products" value={`${productStats.active}`} />
                <StatsCard label="Out of Stock" value={`${productStats.outOfStock}`} />
                <StatsCard
                  label="Total Value"
                  value={`$${productStats.totalValue.toLocaleString()}`}
                />
              </div>

              <div className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-7">
                  <div className="xl:col-span-2">
                    <label className="sr-only" htmlFor="product-search">
                      Search products
                    </label>
                    <div className="flex items-center rounded-lg border border-[#e0e0e0] px-3">
                      <MdSearch size={18} className="text-[#999]" />
                      <input
                        id="product-search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="ml-2 h-10 w-full text-sm outline-none"
                        placeholder="Search by product name, SKU, category..."
                      />
                    </div>
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={inputClass}
                  >
                    {["All categories", "Electronics", "Clothing", "Food", "Beauty", "Home"].map(
                      (item) => (
                        <option key={item}>{item}</option>
                      )
                    )}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={inputClass}
                  >
                    {["All", "Active", "Inactive", "Draft", "Out of Stock"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className={inputClass}
                  >
                    {["All", "Under $50", "$50-$100", "$100-$500", "$500+"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className={inputClass}
                  >
                    {["All", "In Stock", "Low Stock", "Out of Stock"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={inputClass}
                  >
                    {["All", "Last 7 days", "Last 30 days", "Last 90 days"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={inputClass}
                  >
                    {[
                      "Newest first",
                      "Oldest first",
                      "Alphabetical",
                      "Price (high-low)",
                      "Price (low-high)",
                      "Most popular"
                    ].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm",
                      !isGridView
                        ? "border-[#008080] bg-[#f0fffe] text-[#008080]"
                        : "border-[#e0e0e0] text-[#666]"
                    )}
                    onClick={() => setIsGridView(false)}
                    aria-label="List view"
                  >
                    <MdList size={18} /> List
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm",
                      isGridView
                        ? "border-[#008080] bg-[#f0fffe] text-[#008080]"
                        : "border-[#e0e0e0] text-[#666]"
                    )}
                    onClick={() => setIsGridView(true)}
                    aria-label="Grid view"
                  >
                    <MdGridView size={18} /> Grid
                  </button>
                  <select
                    value={bulkAction}
                    onChange={(e) => {
                      setBulkAction(e.target.value);
                      void applyBulkAction(e.target.value);
                    }}
                    className={inputClass}
                    disabled={selectedIds.length === 0}
                  >
                    {[
                      "Bulk Actions",
                      "Edit category",
                      "Update price",
                      "Update stock",
                      "Change status",
                      "Delete selected"
                    ].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm font-semibold text-[#333]"
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
                  >
                    <MdAdd size={18} /> Add Product
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="mt-4 h-40 animate-pulse rounded-xl bg-[#f3f3f3]" />
              ) : filteredProducts.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-[#d6e9e7] bg-[#f8fffe] p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f0f0]">
                    <MdInventory2 size={36} className="text-[#999]" />
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-[#1a1a1a]">No products yet</h2>
                  <p className="mt-1 text-sm text-[#666]">Start adding products to your store</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className="mt-3 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : isGridView ? (
                <ProductGrid
                  products={filteredProducts}
                  onDuplicate={duplicateProduct}
                  onDelete={setDeleting}
                  onPreview={setPreviewing}
                  isPreviewMode={isPreviewMode}
                />
              ) : (
                <ProductTable
                  products={filteredProducts}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  onDuplicate={duplicateProduct}
                  onDelete={setDeleting}
                  isPreviewMode={isPreviewMode}
                />
              )}
            </section>
          ) : null}

          {activeTab === "add" ? (
            <section className="animate-form-fade mt-4">
              <ProductForm
                categories={categories}
                onCancel={() => setActiveTab("all")}
                onCreate={(product) => {
                  setProducts((prev) => [product, ...prev]);
                  setToast("Product created successfully");
                  setActiveTab("all");
                }}
              />
            </section>
          ) : null}

          {activeTab === "bulk" ? (
            <section className="animate-form-fade mt-4 rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <BulkUploadArea
                onComplete={(imported, skipped, errors) => {
                  setToast(
                    `Import completed: ${imported} imported, ${skipped} skipped, ${errors} errors`
                  );
                  setActiveTab("all");
                }}
              />
            </section>
          ) : null}

          {activeTab === "categories" ? (
            <section className="animate-form-fade mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatsCard label="Total Categories" value={`${categoryStats.total}`} />
                <StatsCard label="Parent Categories" value={`${categoryStats.parents}`} />
                <StatsCard label="Sub-Categories" value={`${categoryStats.children}`} />
              </div>

              <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h2 className="text-[32px] font-bold text-[#1a1a1a]">Product Categories</h2>
                <p className="text-sm text-[#666]">Create and organize your product categories</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-lg border border-[#e0e0e0] px-3">
                    <MdSearch size={18} className="text-[#999]" />
                    <input
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="ml-2 h-10 text-sm outline-none"
                      placeholder="Search categories..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategoryView("list")}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm",
                      categoryView === "list"
                        ? "border-[#008080] bg-[#f0fffe] text-[#008080]"
                        : "border-[#e0e0e0]"
                    )}
                  >
                    List view
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryView("tree")}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm",
                      categoryView === "tree"
                        ? "border-[#008080] bg-[#f0fffe] text-[#008080]"
                        : "border-[#e0e0e0]"
                    )}
                  >
                    Tree view
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryModal({ mode: "create" })}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
                  >
                    <MdAdd size={18} /> Add Category
                  </button>
                </div>
              </div>

              <CategoriesTable
                categories={filteredCategories}
                treeView={categoryView === "tree"}
                onEdit={(category) => setCategoryModal({ mode: "edit", category })}
                onDelete={setCategoryDeleting}
              />
            </section>
          ) : null}
        </div>
      </div>

      {deleting ? (
        <ConfirmDialog
          title="Delete product?"
          description={`Delete product "${deleting.name}"? This cannot be undone.`}
          confirmText="Delete"
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            setProducts((prev) => prev.filter((item) => item.id !== deleting.id));
            setDeleting(null);
            setToast("Product deleted successfully");
          }}
        />
      ) : null}

      {previewing ? (
        <ProductPreviewModal product={previewing} onClose={() => setPreviewing(null)} />
      ) : null}

      {categoryModal ? (
        <CategoryModal
          mode={categoryModal.mode}
          category={categoryModal.category}
          categories={categories}
          onClose={() => setCategoryModal(null)}
          onSave={(payload) => {
            if (categoryModal.mode === "create") {
              const created: Category = {
                id: `cat-${Date.now()}`,
                createdAt: "Today",
                productCount: 0,
                ...payload
              };
              setCategories((prev) => [created, ...prev]);
              setToast("Category created");
            } else if (categoryModal.category) {
              setCategories((prev) =>
                prev.map((item) =>
                  item.id === categoryModal.category?.id ? { ...item, ...payload } : item
                )
              );
              setToast("Category updated");
            }
            setCategoryModal(null);
          }}
        />
      ) : null}

      {categoryDeleting ? (
        <ConfirmDialog
          title="Delete category?"
          description="Delete category? Products in this category will not be affected."
          confirmText="Delete"
          onCancel={() => setCategoryDeleting(null)}
          onConfirm={async () => {
            setCategories((prev) => prev.filter((item) => item.id !== categoryDeleting.id));
            setCategoryDeleting(null);
            setToast("Category deleted");
          }}
        />
      ) : null}

      {toast ? (
        <div className="fixed right-4 top-4 z-[90] rounded-lg bg-[#27ae60] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#666]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#008080]">{value}</p>
    </article>
  );
}

function statusBadge(status: ProductStatus) {
  return cn(
    "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
    status === "Active" && "bg-[#eafaf1] text-[#27ae60]",
    status === "Inactive" && "bg-[#e0e0e0] text-[#333]",
    status === "Draft" && "bg-[#dbeafe] text-[#1d4ed8]",
    status === "Out of Stock" && "bg-[#fdecea] text-[#e74c3c]"
  );
}

function ProductTable({
  products,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDuplicate,
  onDelete,
  isPreviewMode
}: {
  products: Product[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  isPreviewMode: boolean;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] text-left">
          <thead className="bg-[#f5f5f5] text-sm font-bold text-[#333]">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === products.length}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 accent-[#008080]"
                />
              </th>
              {[
                "Image",
                "Product Name",
                "SKU",
                "Category",
                "Price",
                "Stock",
                "Status",
                "Rating",
                "Orders",
                "Date Added",
                "Actions"
              ].map((head) => (
                <th key={head} className="px-4 py-3">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 10).map((item) => (
              <tr
                key={item.id}
                className="group h-[60px] border-t border-[#f0f0f0] text-sm text-[#666] hover:bg-[#f8fffe]"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    className="h-4 w-4 accent-[#008080]"
                  />
                </td>
                <td className="px-4 py-3">
                  <img
                    src={item.image ?? "https://picsum.photos/80?random=4"}
                    alt={item.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={withPreviewParam(`/dashboard/products/${item.id}/edit`, isPreviewMode)}
                    className="font-bold text-[#1a1a1a] hover:text-[#008080] hover:underline"
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-[#999]">{item.sku}</td>
                <td className="px-4 py-3 text-xs text-[#999]">{item.category}</td>
                <td className="px-4 py-3 text-sm font-bold text-[#008080]">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {item.stock > 0 ? (
                    `${item.stock} units`
                  ) : (
                    <span className="font-semibold text-[#e74c3c]">Out of Stock</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={statusBadge(item.status)}>{item.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[#999]">
                  {item.rating
                    ? `⭐ ${item.rating.toFixed(1)} (${item.reviews ?? 0} reviews)`
                    : "No ratings"}
                </td>
                <td className="px-4 py-3 text-xs text-[#999]">{item.sold.toLocaleString()} sold</td>
                <td className="px-4 py-3 text-xs text-[#999]">{item.dateAdded}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <Link
                      href={withPreviewParam(`/dashboard/products/${item.id}/edit`, isPreviewMode)}
                      className="rounded p-2 text-[#008080] hover:bg-[#e6fbf9]"
                      aria-label={`Edit ${item.name}`}
                    >
                      <MdEdit size={18} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDuplicate(item)}
                      className="rounded p-2 text-[#008080] hover:bg-[#e6fbf9]"
                      aria-label={`Duplicate ${item.name}`}
                    >
                      <MdContentCopy size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="rounded p-2 text-[#e74c3c] hover:bg-[#fdecea]"
                      aria-label={`Delete ${item.name}`}
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f0f0] p-3 text-sm text-[#666]">
        <span>Showing 1-10 of {products.length} products</span>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded border border-[#e0e0e0] px-3 py-1.5">
            Previous
          </button>
          <button type="button" className="rounded bg-[#008080] px-3 py-1.5 text-white">
            1
          </button>
          <button type="button" className="rounded border border-[#e0e0e0] px-3 py-1.5">
            2
          </button>
          <button type="button" className="rounded border border-[#e0e0e0] px-3 py-1.5">
            3
          </button>
          <button type="button" className="rounded border border-[#e0e0e0] px-3 py-1.5">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductGrid({
  products,
  onDuplicate,
  onDelete,
  onPreview,
  isPreviewMode
}: {
  products: Product[];
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPreview: (product: Product) => void;
  isPreviewMode: boolean;
}) {
  return (
    <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onPreview={onPreview}
          isPreviewMode={isPreviewMode}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  onDuplicate,
  onDelete,
  onPreview,
  isPreviewMode
}: {
  product: Product;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPreview: (product: Product) => void;
  isPreviewMode: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-sm transition hover:-translate-y-1.5 hover:shadow-lg">
      <img
        src={product.image ?? "https://picsum.photos/480/300?random=5"}
        alt={product.name}
        className="h-[180px] w-full object-cover"
      />
      <div className="p-4">
        <h3 className="text-sm font-bold text-[#1a1a1a]">{product.name}</h3>
        <p className="mt-1 text-base font-bold text-[#008080]">${product.price.toFixed(2)}</p>
        <p className="text-xs text-[#999]">{product.sku}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className={statusBadge(product.status)}>{product.status}</span>
          <span className="text-xs text-[#666]">
            {product.rating
              ? `⭐ ${product.rating.toFixed(1)} (${product.reviews ?? 0})`
              : "No ratings"}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <Link
            href={withPreviewParam(`/dashboard/products/${product.id}/edit`, isPreviewMode)}
            className="rounded p-2 text-[#008080] hover:bg-[#e6fbf9]"
          >
            <MdEdit size={18} />
          </Link>
          <button
            type="button"
            onClick={() => onDuplicate(product)}
            className="rounded p-2 text-[#008080] hover:bg-[#e6fbf9]"
          >
            <MdContentCopy size={18} />
          </button>
          <button
            type="button"
            onClick={() => onPreview(product)}
            className="rounded p-2 text-[#008080] hover:bg-[#e6fbf9]"
          >
            <MdVisibility size={18} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="rounded p-2 text-[#e74c3c] hover:bg-[#fdecea]"
          >
            <MdDelete size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductForm({
  categories,
  onCancel,
  onCreate
}: {
  categories: Category[];
  onCancel: () => void;
  onCreate: (product: Product) => void;
}) {
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [sku, setSku] = useState("SKU-1000");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [threshold, setThreshold] = useState(5);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [visibility, setVisibility] = useState("Public");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [weight, setWeight] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingTime, setShippingTime] = useState("2-3 business days");
  const [scheduleDate, setScheduleDate] = useState("");
  const [hasVariants, setHasVariants] = useState(false);
  const [publishNow, setPublishNow] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
  const seoScore = calculateSeoScore(metaTitle, metaDescription, slug, name);

  function onMainImageChange(files: FileList | null) {
    if (!files?.[0]) return;
    setMainImage(files[0]);
  }

  function onExtraImagesChange(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files).slice(0, Math.max(0, 10 - extraImages.length));
    setExtraImages((prev) => [...prev, ...selected]);
  }

  function handleSubmit() {
    if (!name.trim() || !category || price <= 0 || stock < 0 || !mainImage) {
      setFormError("Please fill all required fields and upload a main image.");
      return;
    }
    const created: Product = {
      id: `PRD-${Date.now()}`,
      name,
      sku,
      category,
      price,
      stock,
      status: publishNow ? "Active" : "Draft",
      rating: 0,
      reviews: 0,
      sold: 0,
      dateAdded: "Today",
      image: URL.createObjectURL(mainImage)
    };
    onCreate(created);
  }

  function handleSaveDraft() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <h2 className="text-[32px] font-bold text-[#1a1a1a]">Add New Product</h2>

        <section className="mt-4 space-y-4">
          <h3 className="text-base font-bold">Basic Information</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Product Name *">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(slug || toSlug(e.target.value));
                  setMetaTitle(metaTitle || e.target.value);
                }}
                className={inputClass}
                placeholder="Enter product name"
              />
              <p className="mt-1 text-xs text-[#999]">{name.length}/255 characters</p>
            </Field>
            <Field label="Short Description">
              <input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className={inputClass}
                placeholder="Max 160 chars for listing"
              />
              <p className="mt-1 text-xs text-[#999]">{shortDescription.length}/160 characters</p>
            </Field>
            <Field label="SKU *">
              <input value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Barcode">
              <input className={inputClass} placeholder="Optional" />
            </Field>
            <Field label="Category *">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item.id}>{item.name}</option>
                ))}
              </select>
            </Field>
            <Field label="SubCategory">
              <input className={inputClass} placeholder="Optional" />
            </Field>
            <Field label="Brand">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </Field>
            <Field label="Tags">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClass}
                placeholder="comma,separated,tags"
              />
            </Field>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <h3 className="text-base font-bold">Product Images</h3>
          <ImageUpload
            label="Main image *"
            helper="Drag main image here or click to browse (JPG, PNG up to 5MB)"
            onChange={onMainImageChange}
            image={mainImage}
            onRemove={() => setMainImage(null)}
          />
          <ImageUpload
            label={`Additional images (${extraImages.length}/10)`}
            helper="Drag images here to add (up to 10)"
            multiple
            onChange={onExtraImagesChange}
            files={extraImages}
            onRemoveAt={(index) => setExtraImages((prev) => prev.filter((_, i) => i !== index))}
          />
        </section>

        <Collapsible title="Full Description" open={showDescription} setOpen={setShowDescription}>
          <RichTextEditor value={fullDescription} onChange={setFullDescription} />
          <p className="mt-1 text-xs text-[#999]">{fullDescription.length}/5000 characters</p>
        </Collapsible>

        <section className="mt-6 space-y-4">
          <h3 className="text-base font-bold">Pricing & Stock</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Price *">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Cost">
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Margin">
              <input
                value={`${margin.toFixed(1)}% margin`}
                readOnly
                className={`${inputClass} bg-[#f9f9f9]`}
              />
            </Field>
            <Field label="Stock Quantity *">
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Low Stock Threshold">
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Discount Price">
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <Collapsible title="Product Variants" open={showVariants} setOpen={setShowVariants}>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="h-4 w-4 accent-[#008080]"
            />
            This product has variants
          </label>
          {hasVariants ? <VariantsTable /> : null}
        </Collapsible>

        <Collapsible
          title="Visibility & Publishing"
          open={showVisibility}
          setOpen={setShowVisibility}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Visibility">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className={inputClass}
              >
                {["Public", "Private", "Draft"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Publish Date">
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className={inputClass}
                disabled={publishNow}
              />
            </Field>
          </div>
          <label className="mt-2 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
              className="h-4 w-4 accent-[#008080]"
            />
            Publish immediately
          </label>
        </Collapsible>

        <Collapsible title="SEO Optimization" open={showSeo} setOpen={setShowSeo}>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Meta Title">
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-[#999]">{metaTitle.length}/60</p>
            </Field>
            <Field label="URL Slug">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Meta Description" className="md:col-span-2">
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className={inputClass}
                rows={3}
              />
              <p className="mt-1 text-xs text-[#999]">{metaDescription.length}/160</p>
            </Field>
          </div>
          <SEOScore score={seoScore} />
        </Collapsible>

        <Collapsible title="Shipping & Logistics" open={showShipping} setOpen={setShowShipping}>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Weight (kg)">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Shipping Cost">
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Shipping Time">
              <input
                value={shippingTime}
                onChange={(e) => setShippingTime(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Collapsible>

        {formError ? (
          <p className="mt-3 text-sm font-semibold text-[#e74c3c]">{formError}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-semibold text-[#333]"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
          >
            Publish
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
          >
            Cancel
          </button>
        </div>
        {saved ? <p className="mt-2 text-sm font-semibold text-[#27ae60]">Draft saved</p> : null}
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a]">Product Preview</h3>
          <div className="mt-3 rounded-lg border border-[#f0f0f0] p-3">
            <div className="h-36 rounded-md bg-[#f0f0f0]" />
            <p className="mt-2 text-sm font-bold">{name || "Product Name"}</p>
            <p className="text-sm font-semibold text-[#008080]">${price.toFixed(2)}</p>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="mt-2 rounded-lg border border-[#008080] px-3 py-1.5 text-xs font-semibold text-[#008080]"
            >
              View on Store
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a]">Form Helpers</h3>
          <ul className="mt-2 space-y-1 text-xs text-[#666]">
            <li>💡 Add detailed descriptions for better SEO</li>
            <li>📸 Upload at least 3 product images</li>
            <li>🏷️ Use relevant categories</li>
          </ul>
          <p className="mt-3 text-xs text-[#999]">
            Required: name, category, main image, price, stock.
          </p>
          <p className="mt-1 text-xs font-semibold text-[#27ae60]">
            {saved ? "Saved" : "Unsaved changes"}
          </p>
        </div>
      </aside>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#1a1a1a]">Product Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded p-1 hover:bg-[#f5f5f5]"
              >
                <MdClose size={20} />
              </button>
            </div>
            <p className="text-sm text-[#666]">{name || "Product Name"}</p>
            <p className="mt-1 text-lg font-bold text-[#008080]">${price.toFixed(2)}</p>
            <p className="mt-2 text-sm text-[#666]">
              {fullDescription || "No full description provided yet."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VariantsTable() {
  const [rows, setRows] = useState([
    {
      id: 1,
      size: "M",
      color: "Black",
      material: "Cotton",
      sku: "VAR-001",
      price: 39.99,
      stock: 20
    }
  ]);
  return (
    <div className="mt-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#f5f5f5] text-[#333]">
            <tr>
              {["Size", "Color", "Material", "SKU", "Price", "Stock", "Actions"].map((h) => (
                <th key={h} className="px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#f0f0f0]">
                <td className="px-3 py-2">{row.size}</td>
                <td className="px-3 py-2">{row.color}</td>
                <td className="px-3 py-2">{row.material}</td>
                <td className="px-3 py-2">{row.sku}</td>
                <td className="px-3 py-2">${row.price.toFixed(2)}</td>
                <td className="px-3 py-2">{row.stock}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))}
                    className="text-[#e74c3c] hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() =>
          setRows((prev) => [
            ...prev,
            {
              id: Date.now(),
              size: "L",
              color: "Blue",
              material: "Polyester",
              sku: `VAR-${Date.now()}`,
              price: 49.99,
              stock: 10
            }
          ])
        }
        className="mt-2 rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
      >
        + Add Variant
      </button>
    </div>
  );
}

function BulkUploadArea({
  onComplete
}: {
  onComplete: (imported: number, skipped: number, errors: number) => void;
}) {
  const [fileName, setFileName] = useState("");
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [existsAction, setExistsAction] = useState("Skip");
  const [createCategories, setCreateCategories] = useState(false);
  const [publishNow, setPublishNow] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors: number;
  } | null>(null);

  function downloadTemplate() {
    window.open("/api/products/bulk-upload/template", "_blank", "noopener,noreferrer");
  }

  function parseCsv(text: string) {
    const rows = text
      .trim()
      .split("\n")
      .map((row) => row.split(","));
    setPreviewRows(rows.slice(0, 10));
    const foundErrors: string[] = [];
    rows.slice(1).forEach((row, index) => {
      if (!row[0]) foundErrors.push(`Row ${index + 2}: Missing Product Name`);
      if (!row[2]) foundErrors.push(`Row ${index + 2}: Missing Category`);
      if (!row[3] || Number.isNaN(Number(row[3])))
        foundErrors.push(`Row ${index + 2}: Invalid price`);
    });
    setErrors(foundErrors.slice(0, 5));
  }

  function onFileChange(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      parseCsv(String(reader.result ?? ""));
    };
    reader.readAsText(file);
  }

  function startImport() {
    setImporting(true);
    setProgress(0);
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(timer);
          setImporting(false);
          const summary = {
            imported: Math.max(0, previewRows.length - errors.length),
            skipped: 1,
            errors: errors.length
          };
          setResult(summary);
          onComplete(summary.imported, summary.skipped, summary.errors);
          return 100;
        }
        return prev + 10;
      });
    }, 180);
  }

  return (
    <div>
      <h2 className="text-[32px] font-bold text-[#1a1a1a]">Bulk Product Upload</h2>
      <p className="text-sm text-[#666]">Import multiple products at once using CSV</p>
      <button
        type="button"
        onClick={downloadTemplate}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#008080] hover:underline"
      >
        <MdDownload size={18} /> Download CSV Template
      </button>

      <div className="mt-4 rounded-xl border border-[#e0e0e0] p-4">
        <h3 className="text-lg font-bold">Upload CSV File</h3>
        <div className="mt-3 rounded-xl border-2 border-dashed border-[#008080] bg-[#f0fffe] p-8 text-center">
          <MdCloudUpload size={48} className="mx-auto text-[#999]" />
          <p className="mt-2 text-sm text-[#666]">Drag CSV file here or click to browse</p>
          <p className="text-xs text-[#999]">Maximum 500 products per upload, 50MB max</p>
          <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white">
            Select File
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
          {fileName ? (
            <p className="mt-2 text-sm font-semibold text-[#1a1a1a]">{fileName}</p>
          ) : null}
        </div>
      </div>

      <ImportPreview rows={previewRows} errors={errors} />

      <div className="mt-4 rounded-xl border border-[#e0e0e0] p-4">
        <h3 className="text-base font-bold">Import Options</h3>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <select
            value={existsAction}
            onChange={(e) => setExistsAction(e.target.value)}
            className={inputClass}
          >
            {["Skip", "Update", "Replace"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={createCategories}
              onChange={(e) => setCreateCategories(e.target.checked)}
              className="h-4 w-4 accent-[#008080]"
            />{" "}
            Create new categories if missing
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
              className="h-4 w-4 accent-[#008080]"
            />{" "}
            Publish products immediately
          </label>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-semibold text-[#333]"
          >
            Back
          </button>
          <button
            type="button"
            disabled={!previewRows.length || importing}
            onClick={startImport}
            className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Confirm Import
          </button>
        </div>
      </div>

      {importing ? (
        <div className="mt-4 rounded-xl border border-[#e0e0e0] p-4">
          <p className="text-sm font-semibold text-[#1a1a1a]">Importing products... {progress}%</p>
          <div className="mt-2 h-2 rounded-full bg-[#f0f0f0]">
            <div
              className="h-2 rounded-full bg-[#008080] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#666]">Estimated time: 2 minutes</p>
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-xl border border-[#d7efe4] bg-[#f4fdf8] p-4">
          <p className="text-sm font-bold text-[#27ae60]">Import completed successfully!</p>
          <p className="mt-1 text-sm text-[#666]">
            {result.imported} imported, {result.skipped} skipped, {result.errors} errors
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
            >
              View All Products
            </button>
            <button
              type="button"
              className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#333]"
            >
              Import Another
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ImportPreview({ rows, errors }: { rows: string[][]; errors: string[] }) {
  if (!rows.length) return null;
  return (
    <div className="mt-4 rounded-xl border border-[#e0e0e0] p-4">
      <h3 className="text-base font-bold">Import Preview</h3>
      <p className="text-sm text-[#666]">
        Total rows: {Math.max(0, rows.length - 1)} • Valid rows:{" "}
        {Math.max(0, rows.length - 1 - errors.length)} • Errors: {errors.length}
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-xs">
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  "border-t border-[#f0f0f0]",
                  index === 0 && "bg-[#f5f5f5] font-semibold"
                )}
              >
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className="px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {errors.length ? (
        <div className="mt-3 rounded-lg bg-[#fdecea] p-3 text-xs text-[#e74c3c]">
          {errors.map((error) => (
            <p key={error}>• {error}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CategoriesTable({
  categories,
  treeView,
  onEdit,
  onDelete
}: {
  categories: Category[];
  treeView: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  if (!categories.length) {
    return (
      <div className="rounded-xl border border-dashed border-[#d6e9e7] bg-[#f8fffe] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f0f0]">
          <MdFolder size={34} className="text-[#999]" />
        </div>
        <h2 className="mt-3 text-2xl font-bold text-[#1a1a1a]">No categories yet</h2>
        <p className="text-sm text-[#666]">Create your first category to organize products</p>
      </div>
    );
  }

  if (treeView) {
    const parents = categories.filter((item) => !item.parentCategory);
    return (
      <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
        {parents.map((parent) => (
          <div key={parent.id} className="mb-3 rounded-lg border border-[#f0f0f0] p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#1a1a1a]">↕ {parent.name}</p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(parent)}
                  className="rounded p-1.5 text-[#008080] hover:bg-[#e6fbf9]"
                >
                  <MdEdit size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(parent)}
                  className="rounded p-1.5 text-[#e74c3c] hover:bg-[#fdecea]"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            </div>
            <div className="mt-2 pl-5">
              {categories
                .filter((item) => item.parentCategory === parent.name)
                .map((child) => (
                  <div
                    key={child.id}
                    className="mb-1 flex items-center justify-between text-sm text-[#666]"
                  >
                    <span>↳ {child.name}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(child)}
                        className="rounded p-1 text-[#008080] hover:bg-[#e6fbf9]"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(child)}
                        className="rounded p-1 text-[#e74c3c] hover:bg-[#fdecea]"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#f5f5f5] font-bold text-[#333]">
            <tr>
              {[
                "Category Name",
                "Count",
                "Parent Category",
                "Slug",
                "Status",
                "Date Created",
                "Actions"
              ].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="h-[52px] border-t border-[#f0f0f0] hover:bg-[#f8fffe]"
              >
                <td className="px-4 py-3 font-semibold text-[#1a1a1a]">{category.name}</td>
                <td className="px-4 py-3 text-xs text-[#666]">{category.productCount} products</td>
                <td className="px-4 py-3 text-xs text-[#666]">{category.parentCategory ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-[#999]">{category.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                      category.status === "Active"
                        ? "bg-[#eafaf1] text-[#27ae60]"
                        : "bg-[#e0e0e0] text-[#333]"
                    )}
                  >
                    {category.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#999]">{category.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(category)}
                      className="rounded p-1.5 text-[#008080] hover:bg-[#e6fbf9]"
                      aria-label={`Edit ${category.name}`}
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(category)}
                      className="rounded p-1.5 text-[#e74c3c] hover:bg-[#fdecea]"
                      aria-label={`Delete ${category.name}`}
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryModal({
  mode,
  category,
  categories,
  onClose,
  onSave
}: {
  mode: "create" | "edit";
  category?: Category;
  categories: Category[];
  onClose: () => void;
  onSave: (
    payload: Omit<Category, "id" | "createdAt" | "productCount" | "status"> & {
      status: "Active" | "Inactive";
    }
  ) => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [parentCategory, setParentCategory] = useState(category?.parentCategory ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [status, setStatus] = useState<"Active" | "Inactive">(category?.status ?? "Active");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-[#1a1a1a]">
          {mode === "create" ? "Add New Category" : "Edit Category"}
        </h3>
        <div className="mt-4 space-y-3">
          <Field label="Category Name *">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(toSlug(e.target.value));
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Parent Category">
            <select
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
              className={inputClass}
            >
              <option value="">None</option>
              {categories.map((item) => (
                <option key={item.id}>{item.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              rows={3}
            />
          </Field>
          <Field label="Slug">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
              className={inputClass}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                name,
                parentCategory: parentCategory || null,
                description,
                slug: slug || toSlug(name),
                status
              })
            }
            className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
          >
            {mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageUpload({
  label,
  helper,
  onChange,
  image,
  files,
  onRemove,
  onRemoveAt,
  multiple
}: {
  label: string;
  helper: string;
  onChange: (files: FileList | null) => void;
  image?: File | null;
  files?: File[];
  onRemove?: () => void;
  onRemoveAt?: (index: number) => void;
  multiple?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold text-[#333]">{label}</p>
      <label className="block cursor-pointer rounded-xl border-2 border-dashed border-[#008080] bg-[#f0fffe] p-6 text-center">
        <p className="text-sm text-[#666]">{helper}</p>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          multiple={multiple}
          className="hidden"
          onChange={(e) => onChange(e.target.files)}
        />
      </label>
      {image ? (
        <div className="mt-2 flex items-center gap-2">
          <img
            src={URL.createObjectURL(image)}
            alt="Main product"
            className="h-[80px] w-[80px] rounded-md object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg bg-[#e74c3c] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Remove
          </button>
        </div>
      ) : null}
      {files?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-[80px] w-[80px] rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveAt?.(index)}
                className="absolute right-1 top-1 rounded bg-white/80 p-0.5 text-[#e74c3c]"
              >
                <MdClose size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="mb-1 flex gap-1 text-xs">
        {["B", "I", "U", "List", "Link", "Table", "Code"].map((tool) => (
          <button
            key={tool}
            type="button"
            className="rounded border border-[#e0e0e0] bg-white px-2 py-1"
          >
            {tool}
          </button>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className={inputClass}
        placeholder="Write full product description..."
      />
    </div>
  );
}

function SEOScore({ score }: { score: number }) {
  const label = score < 30 ? "Poor" : score < 60 ? "Fair" : score < 85 ? "Good" : "Excellent";
  return (
    <div className="mt-3">
      <p className="text-sm font-semibold text-[#1a1a1a]">SEO Score: {label}</p>
      <div className="mt-1 h-2 rounded-full bg-[#f0f0f0]">
        <div
          className={cn(
            "h-2 rounded-full",
            score < 30 && "bg-[#e74c3c]",
            score >= 30 && score < 60 && "bg-[#f59e0b]",
            score >= 60 && score < 85 && "bg-[#3b82f6]",
            score >= 85 && "bg-[#27ae60]"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function ProductPreviewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-[#1a1a1a]">Product Preview</h3>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[#f5f5f5]">
            <MdClose size={20} />
          </button>
        </div>
        <img
          src={product.image ?? "https://picsum.photos/640/360?random=8"}
          alt={product.name}
          className="h-56 w-full rounded-lg object-cover"
        />
        <h4 className="mt-3 text-lg font-bold">{product.name}</h4>
        <p className="text-sm text-[#666]">
          {product.category} • {product.sku}
        </p>
        <p className="mt-1 text-lg font-bold text-[#008080]">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmText,
  onCancel,
  onConfirm
}: {
  title: string;
  description: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-[#1a1a1a]">{title}</h3>
        <p className="mt-2 text-sm text-[#666]">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block text-sm", className)}>
      <span className="mb-1 block text-xs font-bold text-[#333]">{label}</span>
      {children}
    </label>
  );
}

function Collapsible({
  title,
  open,
  setOpen,
  children
}: {
  title: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-lg border border-[#e0e0e0] p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left text-base font-bold text-[#1a1a1a]"
        onClick={() => setOpen(!open)}
      >
        {title}
        <span className="text-sm text-[#666]">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

function calculateSeoScore(
  metaTitle: string,
  metaDescription: string,
  slug: string,
  productName: string
): number {
  let score = 0;
  if (metaTitle.length >= 20 && metaTitle.length <= 60) score += 30;
  if (metaDescription.length >= 80 && metaDescription.length <= 160) score += 30;
  if (slug.length >= 5) score += 20;
  if (productName.length > 3) score += 20;
  return score;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
