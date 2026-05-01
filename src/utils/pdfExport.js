import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export const exportToPDF = async (
  list,
  formatAmount,
  getSubtotal,
  getTotal,
) => {
  const subtotal = getSubtotal(list);
  const total = getTotal(list);
  const discountAmount = subtotal - total;

  const rows = list.articles
    .map(
      (a, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafc"}">
      <td style="padding:8px 12px;color:#2563eb;font-weight:600;text-align:center">${i + 1}</td>
      <td style="padding:8px 12px">${a.name}</td>
      <td style="padding:8px 12px;text-align:right">${formatAmount(a.unitPrice)}</td>
      <td style="padding:8px 12px;text-align:center">${a.quantity}</td>
      <td style="padding:8px 12px;text-align:right;font-weight:600">${formatAmount(a.unitPrice * a.quantity)}</td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
  <html><head><meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;margin:32px;color:#0f172a}
    h1{color:#2563eb;margin-bottom:4px}
    .meta{color:#64748b;font-size:13px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse}
    thead tr{background:#2563eb;color:white}
    thead th{padding:10px 12px;text-align:left;font-size:13px}
    .sum-wrap{margin-top:24px;display:flex;justify-content:flex-end}
    .sum-inner{width:280px}
    .sum-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0}
    .total-row{background:#2563eb;color:white;padding:10px 16px;border-radius:8px;display:flex;justify-content:space-between;margin-top:8px;font-weight:700;font-size:16px}
    .footer{margin-top:48px;text-align:center;color:#94a3b8;font-size:11px}
  </style></head>
  <body>
    <h1>${list.name}</h1>
    <p class="meta">${list.articles.length} article(s) &bull; ${new Date(list.createdAt).toLocaleDateString("fr-FR")}</p>
    <table>
      <thead><tr>
        <th style="text-align:center">N°</th>
        <th>Article</th>
        <th style="text-align:right">PU</th>
        <th style="text-align:center">QTÉ</th>
        <th style="text-align:right">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="sum-wrap"><div class="sum-inner">
      <div class="sum-row"><span>Sous-total</span><span>${formatAmount(subtotal)}</span></div>
      <div class="sum-row"><span>Remise (${list.discount || 0}%)</span><span>-${formatAmount(discountAmount)}</span></div>
      <div class="total-row"><span>Total</span><span>${formatAmount(total)}</span></div>
    </div></div>
    <p class="footer">Généré par PLus+ &bull; ${new Date().toLocaleDateString("fr-FR")}</p>
  </body></html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: ".pdf" });
};
