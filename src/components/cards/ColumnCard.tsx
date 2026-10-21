import React, { useState } from 'react';
import { BoardCard, ColumnCardData, ColumnItem, NoteChecklistItem, PortPosition, TableColumn } from '../../types/board';
import {
  Plus,
  Trash2,
  Layers,
  FileText,
  CheckSquare,
  Square,
  Table as TableIcon,
  Globe,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  Circle,
  CheckCircle2,
  ExternalLink,
  GripVertical,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface ColumnCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
  onExtractToBoard?: (item: ColumnItem) => void;
  onStartDragItemOut?: (columnCard: BoardCard, item: ColumnItem, startEvt: React.PointerEvent) => void;
  isDropTarget?: boolean;
  connectingFrom?: { cardId: string; port: PortPosition; itemId?: string } | null;
  onStartConnectItem?: (itemId: string, port: PortPosition) => void;
  onConnectToItemPort?: (itemId: string, port: PortPosition) => void;
}

export const ColumnCard: React.FC<ColumnCardProps> = ({
  card,
  onUpdate,
  onExtractToBoard,
  onStartDragItemOut,
  isDropTarget = false,
  connectingFrom,
  onStartConnectItem,
  onConnectToItemPort,
}) => {
  const columnData: ColumnCardData = card.columnData || {
    title: card.title,
    items: [],
  };

  const updateItems = (newItems: ColumnItem[]) => {
    onUpdate({
      columnData: {
        ...columnData,
        items: newItems,
      },
    });
  };

  const updateItem = (itemId: string, updates: Partial<ColumnItem>) => {
    const updated = columnData.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateItems(updated);
  };

  const deleteItem = (itemId: string) => {
    sound.playDelete();
    updateItems(columnData.items.filter((i) => i.id !== itemId));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...columnData.items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    sound.playClick();
    updateItems(newItems);
  };

  // Checklist item management inside a column item
  const addChecklistItem = (itemId: string, text: string) => {
    const item = columnData.items.find((i) => i.id === itemId);
    if (!item) return;
    const currentList = item.checklist || [];
    const newChk: NoteChecklistItem = {
      id: `chk-${Date.now()}`,
      text,
      completed: false,
    };
    updateItem(itemId, { checklist: [...currentList, newChk] });
    sound.playClick();
  };

  const toggleChecklistItem = (itemId: string, chkId: string) => {
    const item = columnData.items.find((i) => i.id === itemId);
    if (!item || !item.checklist) return;
    const updated = item.checklist.map((c) =>
      c.id === chkId ? { ...c, completed: !c.completed } : c
    );
    updateItem(itemId, { checklist: updated });
    sound.playClick();
  };

  const deleteChecklistItem = (itemId: string, chkId: string) => {
    const item = columnData.items.find((i) => i.id === itemId);
    if (!item || !item.checklist) return;
    const updated = item.checklist.filter((c) => c.id !== chkId);
    updateItem(itemId, { checklist: updated });
    sound.playDelete();
  };

  // Table column & row management inside a column table item
  const addTableColumn = (itemId: string, headerName?: string) => {
    const item = columnData.items.find((i) => i.id === itemId);
    if (!item) return;
    const currentCols = item.tableData?.columns || [
      { id: 'c1', header: 'Item', type: 'text' },
      { id: 'c2', header: 'Valor', type: 'text' },
    ];
    const newColId = `col-${Date.now()}`;
    const newCol: TableColumn = {
      id: newColId,
      header: headerName || `Coluna ${currentCols.length + 1}`,
      type: 'text',
      width: 120,
    };
    const currentRows = item.tableData?.rows || [];
    updateItem(itemId, {
      tableData: {
        title: item.tableData?.title || item.title || 'Tabela',
        columns: [...currentCols, newCol],
        rows: currentRows,
      },
    });
    sound.playClick();
  };

  const deleteTableColumn = (itemId: string, colId: string) => {
    const item = columnData.items.find((i) => i.id === itemId);
    if (!item || !item.tableData) return;
    const currentCols = item.tableData.columns || [];
    if (currentCols.length <= 1) return; // Keep at least one column
    const updatedCols = currentCols.filter((c) => c.id !== colId);
    const updatedRows = (item.tableData.rows || []).map((row) => {
      const nextCells = { ...row.cells };
      delete nextCells[colId];
      return { ...row, cells: nextCells };
    });
    updateItem(itemId, {
      tableData: {
        ...item.tableData,
        columns: updatedCols,
        rows: updatedRows,
      },
    });
    sound.playDelete();
  };

  const updateTableHeader = (itemId: string, colId: string, header: string) => {
    const item = columnData.items.find((i) => i.id === itemId);
    if (!item || !item.tableData) return;
    const currentCols = item.tableData.columns || [];
    const updatedCols = currentCols.map((col) =>
      col.id === colId ? { ...col, header } : col
    );
    updateItem(itemId, {
      tableData: {
        ...item.tableData,
        columns: updatedCols,
      },
    });
  };

  const addTableRow = (itemId: string) => {
    const item = columnData.items.find((i) => i.id === itemId);
    if (!item) return;
    const cols = item.tableData?.columns || [
      { id: 'c1', header: 'Item', type: 'text' },
      { id: 'c2', header: 'Valor', type: 'text' },
    ];
    const rows = item.tableData?.rows || [];
    const newRow = {
      id: `r-${Date.now()}`,
      cells: {},
    };
    updateItem(itemId, {
      tableData: {
        title: item.tableData?.title || item.title || 'Tabela',
        columns: cols,
        rows: [...rows, newRow],
      },
    });
    sound.playClick();
  };

  const deleteTableRow = (itemId: string, rowId: string) => {
    const item = columnData.items.find((i) => i.id === itemId);
    if (!item || !item.tableData) return;
    const currentRows = item.tableData.rows || [];
    updateItem(itemId, {
      tableData: {
        ...item.tableData,
        rows: currentRows.filter((r) => r.id !== rowId),
      },
    });
    sound.playDelete();
  };

  const updateTableCell = (
    itemId: string,
    rowId: string,
    colId: string,
    val: string
  ) => {
    const item = columnData.items.find((i) => i.id === itemId);
    if (!item || !item.tableData) return;
    const rows = item.tableData.rows.map((r) =>
      r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: val } } : r
    );
    updateItem(itemId, {
      tableData: {
        ...item.tableData,
        rows,
      },
    });
  };

  return (
    <div
      className={`space-y-3 transition-all ${
        isDropTarget
          ? 'ring-2 ring-purple-400 bg-purple-950/20 rounded-xl p-1'
          : ''
      }`}
    >
      {/* Header Metric */}
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-1.5 border-b border-white/5">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Coluna Milanote</span>
        </span>
        <span className="text-purple-300 font-semibold">
          {columnData.items.length}{' '}
          {columnData.items.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Visual Drop Target Alert if card dragged over */}
      {isDropTarget && (
        <div className="p-3 rounded-lg border-2 border-dashed border-purple-400 bg-purple-500/10 text-center text-xs font-medium text-purple-200 animate-pulse">
          Solte o card aqui para colocá-lo na coluna
        </div>
      )}

      {/* Stack of Cards Inside the Column */}
      <div className="space-y-2.5 max-h-[480px] overflow-y-auto px-2 -mx-2 py-1">
        {columnData.items.length === 0 && !isDropTarget && (
          <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-neutral-400 space-y-1">
            <p className="font-medium text-neutral-300">Coluna vazia</p>
            <p className="text-[11px] text-neutral-500">
              Adicione itens abaixo ou arraste qualquer card do quadro e solte aqui dentro.
            </p>
          </div>
        )}

        {columnData.items.map((item, idx) => {
          const itemType = item.type || (item.text !== undefined ? 'task' : 'note');
          const isItemSource =
            connectingFrom?.cardId === card.id && connectingFrom?.itemId === item.id;
          const isItemTarget = !!connectingFrom && !isItemSource;

          return (
            <div
              key={item.id}
              id={`col-item-${item.id}`}
              onClick={(e) => {
                if (isItemTarget && onConnectToItemPort) {
                  e.stopPropagation();
                  onConnectToItemPort(item.id, 'left');
                }
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (isItemTarget && onConnectToItemPort) {
                  onConnectToItemPort(item.id, 'left');
                }
              }}
              onPointerUp={(e) => {
                if (isItemTarget && onConnectToItemPort) {
                  e.stopPropagation();
                }
              }}
              className={`group/item relative rounded-xl border bg-neutral-900/90 transition-all p-3 shadow-md space-y-2 ${
                isItemTarget
                  ? 'cursor-crosshair ring-2 ring-cyan-400/80 border-cyan-400 hover:ring-cyan-300 shadow-cyan-500/20'
                  : isItemSource
                  ? 'ring-2 ring-indigo-400/80 border-indigo-400'
                  : 'border-neutral-700/80 hover:border-purple-500/50'
              }`}
            >
              {/* Item Left Anchor Port */}
              <button
                type="button"
                data-port="left"
                data-item-id={item.id}
                title={
                  isItemTarget
                    ? 'Clique para ligar a este item (esquerda)'
                    : 'Conectar item (esquerda)'
                }
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (isItemTarget && onConnectToItemPort) {
                    onConnectToItemPort(item.id, 'left');
                  } else if (onStartConnectItem) {
                    onStartConnectItem(item.id, 'left');
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isItemTarget && onConnectToItemPort) {
                    onConnectToItemPort(item.id, 'left');
                  }
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  if (isItemTarget && onConnectToItemPort) {
                    onConnectToItemPort(item.id, 'left');
                  }
                }}
                className={`absolute -left-2 top-1/2 -translate-y-1/2 z-30 w-4.5 h-4.5 rounded-full border-2 transition-all duration-150 flex items-center justify-center cursor-crosshair ${
                  isItemTarget
                    ? 'opacity-100 scale-125 bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-400/50 hover:scale-150 hover:bg-cyan-400 hover:border-white animate-pulse'
                    : isItemSource && connectingFrom?.port === 'left'
                    ? 'opacity-100 scale-110 bg-indigo-950 border-indigo-300 ring-2 ring-indigo-400/40'
                    : 'opacity-0 group-hover/item:opacity-100 scale-90 hover:scale-125 bg-neutral-900 border-purple-400 hover:border-white'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isItemTarget
                      ? 'bg-cyan-300'
                      : 'bg-purple-400 group-hover/item:bg-white'
                  }`}
                />
              </button>

              {/* Item Right Anchor Port */}
              <button
                type="button"
                data-port="right"
                data-item-id={item.id}
                title={
                  isItemTarget
                    ? 'Clique para ligar a este item (direita)'
                    : 'Conectar item (direita)'
                }
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (isItemTarget && onConnectToItemPort) {
                    onConnectToItemPort(item.id, 'right');
                  } else if (onStartConnectItem) {
                    onStartConnectItem(item.id, 'right');
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isItemTarget && onConnectToItemPort) {
                    onConnectToItemPort(item.id, 'right');
                  }
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  if (isItemTarget && onConnectToItemPort) {
                    onConnectToItemPort(item.id, 'right');
                  }
                }}
                className={`absolute -right-2 top-1/2 -translate-y-1/2 z-30 w-4.5 h-4.5 rounded-full border-2 transition-all duration-150 flex items-center justify-center cursor-crosshair ${
                  isItemTarget
                    ? 'opacity-100 scale-125 bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-400/50 hover:scale-150 hover:bg-cyan-400 hover:border-white animate-pulse'
                    : isItemSource && connectingFrom?.port === 'right'
                    ? 'opacity-100 scale-110 bg-indigo-950 border-indigo-300 ring-2 ring-indigo-400/40'
                    : 'opacity-0 group-hover/item:opacity-100 scale-90 hover:scale-125 bg-neutral-900 border-purple-400 hover:border-white'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isItemTarget
                      ? 'bg-cyan-300'
                      : 'bg-purple-400 group-hover/item:bg-white'
                  }`}
                />
              </button>
              {/* Item Top Bar: Drag Grip + Icon + Title + Actions */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                  <div
                    onPointerDown={(e) => onStartDragItemOut?.(card, item, e)}
                    title="Arraste para fora da coluna para transformar em card normal no quadro"
                    className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-neutral-500 hover:text-white rounded hover:bg-white/10 shrink-0 transition-colors"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  {itemType === 'note' && (
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}
                  {itemType === 'checklist' && (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  {itemType === 'table' && (
                    <TableIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                  {itemType === 'link' && (
                    <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  )}
                  {itemType === 'task' && (
                    <Circle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  )}

                  {itemType !== 'task' ? (
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      placeholder="Título..."
                      className="bg-transparent border-none text-xs font-semibold text-neutral-200 focus:outline-none truncate w-full"
                    />
                  ) : (
                    <span className="text-[11px] font-mono text-neutral-400">Tarefa</span>
                  )}
                </div>

                {/* Controls: Reorder, Extract to Board, Delete */}
                <div className="flex items-center gap-0.5 opacity-60 group-hover/item:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button
                      type="button"
                      title="Mover para cima"
                      onClick={() => moveItem(idx, 'up')}
                      className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  )}
                  {idx < columnData.items.length - 1 && (
                    <button
                      type="button"
                      title="Mover para baixo"
                      onClick={() => moveItem(idx, 'down')}
                      className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}

                  {onExtractToBoard && (
                    <button
                      type="button"
                      title="Extrair para o quadro livre (desacoplar da coluna)"
                      onClick={() => onExtractToBoard(item)}
                      className="p-1 rounded hover:bg-indigo-500/20 text-neutral-400 hover:text-indigo-300"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    title="Excluir item da coluna"
                    onClick={() => deleteItem(item.id)}
                    className="p-1 rounded hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Note Content Body */}
              {itemType === 'note' && (
                <textarea
                  value={item.body || ''}
                  onChange={(e) => updateItem(item.id, { body: e.target.value })}
                  placeholder="Escreva sua anotação aqui..."
                  rows={2}
                  className="w-full bg-neutral-950/60 rounded-lg p-2 text-xs text-neutral-300 placeholder-neutral-500 resize-y focus:outline-none border border-white/5 leading-relaxed"
                />
              )}

              {/* Checklist Content Body */}
              {itemType === 'checklist' && (
                <div className="space-y-1.5 pt-0.5">
                  {(item.checklist || []).map((chk) => (
                    <div
                      key={chk.id}
                      className="flex items-center gap-2 text-xs group/chk px-1 py-0.5 rounded hover:bg-white/5"
                    >
                      <button
                        type="button"
                        onClick={() => toggleChecklistItem(item.id, chk.id)}
                        className="text-neutral-400 hover:text-emerald-400 shrink-0"
                      >
                        {chk.completed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-neutral-500" />
                        )}
                      </button>
                      <span
                        className={`flex-1 break-words ${
                          chk.completed
                            ? 'line-through text-neutral-500'
                            : 'text-neutral-200'
                        }`}
                      >
                        {chk.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteChecklistItem(item.id, chk.id)}
                        className="opacity-0 group-hover/chk:opacity-100 text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <input
                    type="text"
                    placeholder="+ Adicionar tarefa..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addChecklistItem(item.id, e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full bg-neutral-950/60 rounded-md px-2 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none border border-white/5"
                  />
                </div>
              )}

              {/* Table Content Body */}
              {itemType === 'table' && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="overflow-x-auto rounded-lg bg-neutral-950/60 border border-white/5">
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-white/10 text-neutral-400 bg-white/5">
                          {(item.tableData?.columns || [
                            { id: 'c1', header: 'Item', type: 'text' },
                            { id: 'c2', header: 'Valor', type: 'text' },
                          ]).map((col) => (
                            <th
                              key={col.id}
                              className="group/th p-1 text-left font-mono font-medium text-[10px] min-w-[70px]"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <input
                                  type="text"
                                  value={col.header}
                                  onChange={(e) =>
                                    updateTableHeader(item.id, col.id, e.target.value)
                                  }
                                  placeholder="Coluna..."
                                  className="bg-transparent text-neutral-300 font-mono font-medium text-[10px] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 rounded px-1 min-w-[50px] w-full"
                                />
                                {(item.tableData?.columns || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => deleteTableColumn(item.id, col.id)}
                                    title="Excluir coluna"
                                    className="opacity-0 group-hover/th:opacity-100 text-neutral-500 hover:text-rose-400 p-0.5 rounded transition-opacity"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                          <th className="p-1 w-6 text-center">
                            <button
                              type="button"
                              onClick={() => addTableColumn(item.id)}
                              title="Adicionar coluna à tabela"
                              className="p-1 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(item.tableData?.rows || []).map((row) => (
                          <tr
                            key={row.id}
                            className="group/tr border-b border-white/5 last:border-none hover:bg-white/[0.02]"
                          >
                            {(item.tableData?.columns || [
                              { id: 'c1', header: 'Item', type: 'text' },
                              { id: 'c2', header: 'Valor', type: 'text' },
                            ]).map((col) => (
                              <td key={col.id} className="p-1">
                                <input
                                  type="text"
                                  value={String(row.cells[col.id] || '')}
                                  onChange={(e) =>
                                    updateTableCell(
                                      item.id,
                                      row.id,
                                      col.id,
                                      e.target.value
                                    )
                                  }
                                  className="bg-transparent text-neutral-200 focus:outline-none w-full px-1"
                                />
                              </td>
                            ))}
                            <td className="p-1 w-6 text-center opacity-0 group-hover/tr:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => deleteTableRow(item.id, row.id)}
                                title="Excluir linha"
                                className="p-0.5 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => addTableRow(item.id)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cyan-500/10 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Adicionar linha
                    </button>
                    <button
                      type="button"
                      onClick={() => addTableColumn(item.id)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cyan-500/10 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Adicionar coluna
                    </button>
                  </div>
                </div>
              )}

              {/* Link Content Body */}
              {itemType === 'link' && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center gap-1.5 bg-neutral-950/80 px-2 py-1 rounded-md border border-neutral-800 text-[11px] font-mono">
                    <input
                      type="text"
                      value={item.linkData?.url || ''}
                      placeholder="https://..."
                      onChange={(e) =>
                        updateItem(item.id, {
                          linkData: {
                            ...(item.linkData || {
                              status: 'online',
                              title: item.title || 'Link',
                              description: '',
                              latencyMs: 0,
                              lastChecked: '',
                              sslSecure: true,
                            }),
                            url: e.target.value,
                          },
                        })
                      }
                      className="flex-1 bg-transparent text-cyan-400 focus:outline-none"
                    />
                    {item.linkData?.url && (
                      <a
                        href={
                          item.linkData.url.startsWith('http')
                            ? item.linkData.url
                            : `https://${item.linkData.url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-400 hover:text-white"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Task Content Body (Backwards compatible) */}
              {itemType === 'task' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { done: !item.done })}
                    className="text-neutral-400 hover:text-purple-400 shrink-0"
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={item.text || ''}
                    placeholder="Tarefa..."
                    onChange={(e) => updateItem(item.id, { text: e.target.value })}
                    className={`bg-transparent border-none text-xs focus:outline-none w-full ${
                      item.done ? 'line-through text-neutral-500' : 'text-neutral-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
