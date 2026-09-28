import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { BillOfMaterialsItem } from '../../types';
import { MetricCard } from '../shared/MetricCard';
import { 
  ListChecks, 
  FileDown, 
  Printer, 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  PackageCheck, 
  Layers 
} from 'lucide-react';

export const BomTab: React.FC = () => {
  const {
    computedBom,
    diagnostic
  } = useDiagnostic();

  const [filterCategory, setFilterCategory] = useState<string>('TODOS');

  const categories = Array.from(new Set(computedBom.map(b => b.category)));

  const filteredItems = filterCategory === 'TODOS'
    ? computedBom
    : computedBom.filter(b => b.category === filterCategory);

  const totalCostSoles = computedBom.reduce((acc, item) => acc + (item.totalCostSoles || 0), 0);
  const totalItemsCount = computedBom.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const handleExportCsv = () => {
    const headers = ['Categoría', 'Descripción del Material', 'Especificación Técnica', 'Cantidad', 'Unidad', 'Precio Unitario (S/.)', 'Total (S/.)'];
    const rows = computedBom.map(item => [
      `"${item.category}"`,
      `"${item.description}"`,
      `"${item.specification || ''}"`,
      item.quantity,
      `"${item.unit}"`,
      item.unitCostSoles.toFixed(2),
      item.totalCostSoles.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BOM_Materiales_${diagnostic.generalData.diagnosticCode || 'E-DIAGNOSIS'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Lista Consolidada de Materiales y Presupuesto Técnico (BOM)
          </h2>
          <p className="text-xs text-slate-500">
            Cómputo métrico consolidado de conductores, protecciones termomagnéticas, diferenciales, puesta a tierra, luminarias LED y sistema solar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileDown size={14} />
            <span>Exportar a Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Presupuesto Estimado de Materiales"
          value={`S/. ${totalCostSoles.toLocaleString('es-PE', { maximumFractionDigits: 2 })}`}
          subtitle="Precios referenciales de mercado peruano"
          highlightColor="indigo"
          icon={<DollarSign size={18} />}
        />
        <MetricCard
          title="Partidas y Materiales Computados"
          value={computedBom.length}
          subtitle={`${totalItemsCount.toFixed(0)} unidades / metros en total`}
          highlightColor="emerald"
          icon={<PackageCheck size={18} />}
        />
        <MetricCard
          title="Categorías Involucradas"
          value={categories.length}
          subtitle="Tableros, Cables, PAT, LED y Solar"
          highlightColor="amber"
          icon={<Layers size={18} />}
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-2">Filtrar Categoría:</span>
        <button
          onClick={() => setFilterCategory('TODOS')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            filterCategory === 'TODOS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Todas ({computedBom.length})
        </button>

        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterCategory === cat
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* BOM Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Ítem</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Descripción del Suministro</th>
                <th className="px-4 py-3">Especificación Técnica</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3 text-right">P. Unitario (S/.)</th>
                <th className="px-4 py-3 text-right">Subtotal (S/.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400 font-bold">
                    {String(idx + 1).padStart(2, '0')}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {item.category}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-bold text-slate-900">
                    {item.description}
                  </td>

                  <td className="px-4 py-3 text-slate-500 max-w-[280px]">
                    {item.specification || '-'}
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-slate-900 text-right">
                    {item.quantity.toLocaleString('es-PE', { maximumFractionDigits: 1 })}
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-500">
                    {item.unit}
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-700 text-right">
                    S/. {item.unitCostSoles.toFixed(2)}
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-slate-900 text-right">
                    S/. {item.totalCostSoles.toFixed(2)}
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No hay materiales registrados para esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
              <tr>
                <td colSpan={7} className="px-4 py-3 text-right uppercase text-[11px] tracking-wider">
                  Total Presupuestado de Suministros (Inc. IGV referencial):
                </td>
                <td className="px-4 py-3 font-mono text-amber-950 text-right text-sm">
                  S/. {totalCostSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
