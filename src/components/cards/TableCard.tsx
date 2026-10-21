import React, { useState } from 'react';
import { BoardCard, TableCardData, TableColumn, TableRow } from '../../types/board';
import { Plus, Trash2, Hash, Type, CheckSquare, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

interface TableCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
}

export const TableCard: React.FC<TableCardProps> = ({ card, onUpdate }) => {
  const tableData: TableCardData = card.tableData || {
    title: card.title,
    columns: [
      { id: 'c1', header: 'Coluna 1', type: 'text', width: 160 },
      { id: 'c2', header: 'Coluna 2', type: 'text', width: 160 },
    ],
    rows: [],
  };

  const [newColName, setNewColName] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);

  const updateCell = (rowId: string, colId: string, value: string | number | boolean) => {
    const updatedRows = tableData.rows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [colId]: value,
          },
        };
      }
      return row;
    });

    onUpdate({
      tableData: {
        ...tableData,
        rows: updatedRows,
      },
    });
  };

  const updateHeader = (colId: string, header: string) => {
    const updatedCols = tableData.columns.map((col) =>
      col.id === colId ? { ...col, header } : col
    );
    onUpdate({
      tableData: {
        ...tableData,
        columns: updatedCols,
      },
    });
  };

  const addRow = () => {
    sound.playClick();
    const newRowId = `r-${Date.now()}`;
    const newCells: Record<string, string | number | boolean> = {};
    tableData.columns.forEach((col) => {
      newCells[col.id] = col.type === 'number' ? 0 : col.type === 'status' ? 'Pendente' : '';
    });

    onUpdate({
      tableData: {
        ...tableData,
        rows: [...tableData.rows, { id: newRowId, cells: newCells }],
      },
    });
  };

  const deleteRow = (rowId: string) => {
    sound.playDelete();
    onUpdate({
      tableData: {
        ...tableData,
        rows: tableData.rows.filter((r) => r.id !== rowId),
      },
    });
  };

  const addColumn = () => {
    if (!newColName.trim()) return;
    sound.playClick();
    const newColId = `col-${Date.now()}`;
    const newCol: TableColumn = {
      id: newColId,
      header: newColName.trim(),
      type: 'text',
      width: 120,
    };

    onUpdate({
      tableData: {
        ...tableData,
        columns: [...tableData.columns, newCol],
      },
    });
    setNewColName('');
    setIsAddingCol(false);
  };

  const deleteColumn = (colId: string) => {
    if (tableData.columns.length <= 1) return;
    sound.playDelete();
    onUpdate({
      tableData: {
        ...tableData,
        columns: tableData.columns.filter((c) => c.id !== colId),
      },
    });
  };

  // Compute numeric totals for numeric columns
  const numericTotals = tableData.columns.reduce((acc, col) => {
    if (col.type === 'number') {
      const sum = tableData.rows.reduce((s, row) => {
        const val = Number(row.cells[col.id]) || 0;
        return s + val;
      }, 0);
      acc[col.id] = sum;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-2.5 overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto max-h-64 border border-neutral-800 rounded-lg bg-neutral-950/70 select-text">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/80 font-mono text-[11px] text-neutral-400">
              {tableData.columns.map((col) => (
                <th
                  key={col.id}
                  style={{ minWidth: `${col.width || 120}px` }}
                  className="py-1.5 px-2.5 font-medium relative group/th"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={col.header}
                      onChange={(e) => updateHeader(col.id, e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="bg-transparent text-neutral-300 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-0.5 w-full"
                    />
                    {tableData.columns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteColumn(col.id)}
                        title="Remover coluna"
                        className="opacity-0 group-hover/th:opacity-100 text-neutral-500 hover:text-rose-400 p-0.5 ml-1 transition-opacity"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-8 py-1.5 px-1 text-center font-normal">
                <button
                  type="button"
                  onClick={() => setIsAddingCol(true)}
                  title="Adicionar Coluna"
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-neutral-800/60 font-sans text-xs">
            {tableData.rows.map((row) => (
              <tr key={row.id} className="hover:bg-white/5 transition-colors group/row">
                {tableData.columns.map((col) => (
                  <td key={col.id} className="py-1.5 px-2.5">
                    {col.type === 'status' ? (
                      <select
                        value={String(row.cells[col.id] || 'Pendente')}
                        onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={`text-[11px] font-mono font-medium rounded px-1.5 py-0.5 border cursor-pointer ${
                          row.cells[col.id] === 'Concluído'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : row.cells[col.id] === 'Ativo'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                        }`}
                      >
                        <option value="Pendente" className="bg-neutral-900 text-neutral-300">Pendente</option>
                        <option value="Ativo" className="bg-neutral-900 text-amber-300">Ativo</option>
                        <option value="Concluído" className="bg-neutral-900 text-emerald-300">Concluído</option>
                      </select>
                    ) : col.type === 'number' ? (
                      <input
                        type="number"
                        value={row.cells[col.id] !== undefined ? String(row.cells[col.id]) : ''}
                        onChange={(e) => updateCell(row.id, col.id, Number(e.target.value))}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="bg-transparent text-right font-mono text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1 w-full"
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(row.cells[col.id] || '')}
                        onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="bg-transparent text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1 w-full"
                      />
                    )}
                  </td>
                ))}

                {/* Delete row action */}
                <td className="w-8 py-1.5 px-1 text-center">
                  <button
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    title="Excluir linha"
                    className="opacity-0 group-row:opacity-100 text-neutral-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add column prompt modal/inline */}
      {isAddingCol && (
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900 rounded-lg border border-neutral-700" onPointerDown={(e) => e.stopPropagation()}>
          <input
            type="text"
            autoFocus
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addColumn();
              if (e.key === 'Escape') setIsAddingCol(false);
            }}
            placeholder="Nome da nova coluna..."
            className="flex-1 bg-neutral-950 text-xs px-2 py-1 rounded text-neutral-200 border border-neutral-800 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={addColumn}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded font-medium"
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => setIsAddingCol(false)}
            className="px-2 py-1 text-neutral-400 hover:text-white text-xs"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Table Footer Actions & Totals */}
      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-neutral-400">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Nova Linha</span>
        </button>

        <div className="flex items-center gap-3">
          <span>{tableData.rows.length} registros</span>
          {Object.entries(numericTotals).map(([colId, total]) => {
            const col = tableData.columns.find((c) => c.id === colId);
            return (
              <span key={colId} className="text-amber-300 font-semibold">
                Total {col?.header}: {total}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
