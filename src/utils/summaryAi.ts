import { BoardCard, Connection } from '../types/board';

export interface ExecutiveSummary {
  headline: string;
  cardCount: number;
  typesBreakdown: Record<string, number>;
  keyFindings: string[];
  actionItems: string[];
  systemStatus: string;
  markdownText: string;
}

export function generateExecutiveSummary(
  cards: BoardCard[],
  connections: Connection[]
): ExecutiveSummary {
  const cardIds = new Set(cards.map((c) => c.id));
  const relevantConnections = connections.filter(
    (conn) => cardIds.has(conn.fromCardId) && cardIds.has(conn.toCardId)
  );

  const typesBreakdown: Record<string, number> = {
    note: 0,
    live: 0,
    media: 0,
    link: 0,
    table: 0,
    column: 0,
    board: 0,
  };

  const keyFindings: string[] = [];
  const actionItems: string[] = [];

  let completedTasks = 0;
  let totalTasks = 0;

  for (const card of cards) {
    typesBreakdown[card.type] = (typesBreakdown[card.type] || 0) + 1;

    if (card.type === 'note' && card.noteData) {
      if (card.noteData.checklist) {
        for (const item of card.noteData.checklist) {
          totalTasks++;
          if (item.completed) completedTasks++;
          else actionItems.push(`[${card.title}] Pendente: ${item.text}`);
        }
      }
      if (card.noteData.body) {
        keyFindings.push(`Nota "${card.title}": ${card.noteData.body.slice(0, 100)}...`);
      }
    }

    if (card.type === 'column' && card.columnData) {
      for (const item of card.columnData.items) {
        totalTasks++;
        if (item.done) completedTasks++;
        else actionItems.push(`[Coluna: ${card.title}] Pendente: ${item.text}`);
      }
      keyFindings.push(`Coluna "${card.title}": ${card.columnData.items.length} cartões empilhados`);
    }

    if (card.type === 'table' && card.tableData) {
      keyFindings.push(`Tabela "${card.title}": ${card.tableData.rows.length} registros, ${card.tableData.columns.length} colunas estruturadas`);
    }

    if (card.type === 'board' && card.boardData) {
      keyFindings.push(`Sub-Quadro "${card.title}": ${card.boardData.itemCount} itens aninhados`);
    }

    if (card.type === 'link' && card.linkData) {
      keyFindings.push(
        `Monitor Web "${card.title}": Status ${card.linkData.status.toUpperCase()} (${card.linkData.latencyMs}ms)`
      );
    }

    if (card.type === 'media' && card.mediaData) {
      keyFindings.push(
        `Imagem "${card.title}": ${card.mediaData.imageUrl ? 'Com imagem anexada' : 'Aguardando imagem'}`
      );
    }
  }

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
  const systemStatus =
    completionRate === 100
      ? '🟢 Todos os entregáveis concluídos'
      : completionRate > 50
      ? `🟡 Em execução avançada (${completionRate}% de tarefas concluídas)`
      : `🟠 Fase inicial (${completionRate}% de tarefas concluídas)`;

  const headline = `Resumo Executivo do Agrupamento (${cards.length} blocos, ${relevantConnections.length} conexões)`;

  const markdownText = `# 📋 ${headline}

**Data:** ${new Date().toLocaleDateString('pt-BR')} | **Status Geral:** ${systemStatus}

---

### 📊 Composição dos Elementos
- 📝 **Notas & Ideias:** ${typesBreakdown.note || 0}
- ⚡ **Cards Vivos Reativos:** ${typesBreakdown.live || 0}
- 🎨 **Mídias & 3D:** ${typesBreakdown.media || 0}
- 🌐 **Monitores Web:** ${typesBreakdown.link || 0}
- 🔗 **Conexões Ativas entre Itens:** ${relevantConnections.length}

---

### 🔍 Destaques Principais
${keyFindings.length > 0 ? keyFindings.map((f) => `- ${f}`).join('\n') : '- Nenhum detalhe textual registrado.'}

---

### ✅ Próximas Ações Recomendadas
${actionItems.length > 0 ? actionItems.map((a) => `- ${a}`).join('\n') : '- Todas as tarefas do bloco selecionado estão concluídas! 🎉'}

---
*Gerado instantaneamente pelo Focus Assistant do Pampo Board.*
`;

  return {
    headline,
    cardCount: cards.length,
    typesBreakdown,
    keyFindings,
    actionItems,
    systemStatus,
    markdownText,
  };
}
