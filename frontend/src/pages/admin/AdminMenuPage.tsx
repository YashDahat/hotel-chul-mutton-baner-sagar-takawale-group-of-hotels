import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ColDef } from 'ag-grid-community';
import { AdminDataGrid } from '@/components/admin/AdminDataGrid';
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog';
import { Button } from '@/components/ui/button';
import { useAdminProducts, useUpdateProduct } from '@/hooks/productHooks';
import { productService } from '@/services/productService';
import type { ProductDto, UpsertProductRequest } from '@/types/product';
import { AdminHead, ValueDialog } from '@/site/adminKit';

const toRequest = (p: ProductDto, patch: Partial<UpsertProductRequest>): UpsertProductRequest => ({
  name: p.name, slug: p.slug, description: p.description, price: p.price, category: p.category, active: p.active,
  workflowCode: p.workflowCode, branchScope: p.branchScope, availableBranchIds: p.availableBranchIds,
  stockTracked: p.stockTracked, stockPerBranch: p.stockPerBranch, stock: p.stock, imageUrl: p.imageUrl, images: p.images, features: p.features,
  variants: p.variants.map((v) => ({ id: v.id, label: v.label, sku: v.sku, price: v.price, stockTracked: v.stockTracked, stock: v.stock })),
  ...patch,
});

export default function AdminMenuPage() {
  const { data, isLoading } = useAdminProducts();
  const update = useUpdateProduct();
  const [priceFor, setPriceFor] = useState<ProductDto | null>(null);
  const [stockFor, setStockFor] = useState<ProductDto | null>(null);
  const rows = useMemo(() => data ?? [], [data]);
  const cols = useMemo<ColDef<ProductDto>[]>(() => [
    { field: 'name', headerName: 'Dish', minWidth: 200 },
    { field: 'category', headerName: 'Category' },
    { field: 'price', headerName: 'Price (₹)', filter: 'agNumberColumnFilter' },
    { headerName: 'Left today', valueGetter: (p) => (p.data?.stockTracked ? p.data.available ?? p.data.stock ?? 0 : 'Unlimited') },
    { headerName: 'On menu', valueGetter: (p) => (p.data?.active ? 'Yes' : 'Sold out / hidden') },
    { field: 'workflowCode', headerName: 'Order type' },
  ], []);
  return (
    <div>
      <AdminHead title="Menu" hint="Change today’s price, handi count, or hide a dish. Use Products for photos and full details.">
        <Button asChild variant="outline"><Link to="/admin/products">Full product editor</Link></Button>
        <BulkUploadDialog title="Bulk upload dishes" columns={['name', 'price', 'category', 'description']} sampleRow={['Mutton Thali', '450', 'Thali', 'Mutton sukka, rassa, bhakri']} templateName="dishes-template.csv" onUpload={productService.bulkUpload} />
      </AdminHead>
      <AdminDataGrid<ProductDto> rowData={rows} columnDefs={cols} testId="admin-menu-grid" emptyMessage={isLoading ? 'Loading…' : 'No dishes yet.'}
        actions={[
          { label: 'Edit price', onClick: (p) => setPriceFor(p) },
          { label: 'Set handi count', onClick: (p) => setStockFor(p), hidden: (p) => !p.stockTracked },
          { label: 'Hide from menu', onClick: (p) => update.mutate({ id: p.id, req: toRequest(p, { active: false }) }), hidden: (p) => !p.active },
          { label: 'Put back on menu', onClick: (p) => update.mutate({ id: p.id, req: toRequest(p, { active: true }) }), hidden: (p) => p.active },
        ]} />
      {priceFor ? <ValueDialog key={priceFor.id} open title={`Price — ${priceFor.name}`} label="Price (₹)" kind="number" min={0} max={100000} initial={String(priceFor.price)} pending={update.isPending}
        onClose={() => setPriceFor(null)} onSave={(v) => update.mutate({ id: priceFor.id, req: toRequest(priceFor, { price: Number(v) }) }, { onSuccess: () => setPriceFor(null) })} /> : null}
      {stockFor ? <ValueDialog key={`s${stockFor.id}`} open title={`Today’s count — ${stockFor.name}`} label="Portions available" kind="number" min={0} max={10000} initial={String(stockFor.stock ?? 0)} pending={update.isPending}
        onClose={() => setStockFor(null)} onSave={(v) => update.mutate({ id: stockFor.id, req: toRequest(stockFor, { stock: Number(v) }) }, { onSuccess: () => setStockFor(null) })} /> : null}
    </div>
  );
}
