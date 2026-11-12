import React, { useState, useEffect } from 'react';
import { Printer, RotateCcw, Save, Calculator, CheckCircle2 } from 'lucide-react';
import { printHtmlDocument } from '../../services/printAndFileService';

export interface AnnualBookCell {
  subject: string;
  qty: string;
}

export interface AnnualBookClassRow {
  id: string;
  classLabel: string;
  bgColor: string;
  textColor: string;
  cells: AnnualBookCell[]; // length 9 (columns 1..9)
  totalBooks: string;
  receivedBooks: string;
}

export interface AnnualBooksSheetData {
  schoolTitle: string;
  emisCode: string;
  academicYear: string;
  urduBannerTitle: string;
  receivedColumnHeader: string;
  rows: AnnualBookClassRow[];
}

const STORAGE_KEY = 'gps_chambai_annual_books_received_sheet_v1';

const DEFAULT_SHEET_DATA: AnnualBooksSheetData = {
  schoolTitle: 'GPS CHAMBAI KOHAT',
  emisCode: '16454',
  academicYear: '2024-25',
  urduBannerTitle: 'سالانہ کتب ریکارڈ',
  receivedColumnHeader: 'Resevid',
  rows: [
    {
      id: 'row-prep',
      classLabel: 'Prep',
      bgColor: '#FFFF00',
      textColor: '#000000',
      cells: [
        { subject: 'Creative Arts', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
      ],
      totalBooks: '1',
      receivedBooks: '',
    },
    {
      id: 'row-kg',
      classLabel: 'KG',
      bgColor: '#92D050',
      textColor: '#000000',
      cells: [
        { subject: 'Creative Arts', qty: '' },
        { subject: 'English Primer', qty: '' },
        { subject: 'Urdu Primer', qty: '' },
        { subject: 'Maths Primer', qty: '' },
        { subject: 'Pashto Qaida', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
        { subject: '', qty: '' },
      ],
      totalBooks: '5',
      receivedBooks: '',
    },
    {
      id: 'row-1st',
      classLabel: '1st',
      bgColor: '#00B0F0',
      textColor: '#000000',
      cells: [
        { subject: 'Creative Arts\nDrawing', qty: '' },
        { subject: 'English', qty: '' },
        { subject: 'General\nKnowledge', qty: '' },
        { subject: 'Islamiyat', qty: '' },
        { subject: 'Mathematics', qty: '' },
        { subject: 'Nazra Quran', qty: '' },
        { subject: 'Pashto', qty: '' },
        { subject: '', qty: '' },
        { subject: 'Urdu', qty: '' },
      ],
      totalBooks: '8',
      receivedBooks: '',
    },
    {
      id: 'row-2nd',
      classLabel: '2nd',
      bgColor: '#FFC000',
      textColor: '#000000',
      cells: [
        { subject: 'Creative Arts\nDrawing', qty: '' },
        { subject: 'English', qty: '' },
        { subject: 'General\nKnowledge', qty: '' },
        { subject: 'Islamiyat', qty: '' },
        { subject: 'Mathematics', qty: '' },
        { subject: 'Nazra Quran', qty: '' },
        { subject: 'Pashto', qty: '' },
        { subject: '', qty: '' },
        { subject: 'Urdu', qty: '' },
      ],
      totalBooks: '8',
      receivedBooks: '',
    },
    {
      id: 'row-3rd',
      classLabel: '3rd',
      bgColor: '#FF3399',
      textColor: '#FFFFFF',
      cells: [
        { subject: 'Creative Arts\nDrawing', qty: '' },
        { subject: 'English', qty: '' },
        { subject: 'General\nKnowledge', qty: '' },
        { subject: 'Islamiyat', qty: '' },
        { subject: 'Mathematics', qty: '' },
        { subject: 'Nazra Quran', qty: '' },
        { subject: 'Pashto', qty: '' },
        { subject: '', qty: '' },
        { subject: 'Urdu', qty: '' },
      ],
      totalBooks: '8',
      receivedBooks: '',
    },
    {
      id: 'row-4th',
      classLabel: '4th',
      bgColor: '#CC00CC',
      textColor: '#FFFFFF',
      cells: [
        { subject: 'Creative Arts\nDrawing', qty: '' },
        { subject: 'English', qty: '' },
        { subject: 'General\nScience', qty: '' },
        { subject: 'Islamiyat', qty: '' },
        { subject: 'Mathematics', qty: '' },
        { subject: 'Nazra Quran', qty: '' },
        { subject: 'Pashto', qty: '' },
        { subject: 'Pak Study', qty: '' },
        { subject: 'Urdu', qty: '' },
      ],
      totalBooks: '9',
      receivedBooks: '',
    },
    {
      id: 'row-5th',
      classLabel: '5th',
      bgColor: '#FF0000',
      textColor: '#FFFFFF',
      cells: [
        { subject: 'Creative Arts\nDrawing', qty: '' },
        { subject: 'English', qty: '' },
        { subject: 'General\nScience', qty: '' },
        { subject: 'Islamiyat', qty: '' },
        { subject: 'Mathematics', qty: '' },
        { subject: 'Nazra Quran', qty: '' },
        { subject: 'Pashto', qty: '' },
        { subject: 'Pak Study', qty: '' },
        { subject: 'Urdu', qty: '' },
      ],
      totalBooks: '9',
      receivedBooks: '',
    },
  ],
};

export const AnnualBooksReceivedTable: React.FC = () => {
  const [sheet, setSheet] = useState<AnnualBooksSheetData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.rows) && parsed.rows.length === 7) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_SHEET_DATA;
  });

  const [savedToast, setSavedToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
    } catch {
      // ignore
    }
  }, [sheet]);

  const showNotice = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 2800);
  };

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    field: 'subject' | 'qty',
    value: string
  ) => {
    setSheet((prev) => {
      const nextRows = prev.rows.map((r, rIdx) => {
        if (rIdx !== rowIndex) return r;
        const nextCells = r.cells.map((c, cIdx) =>
          cIdx === colIndex ? { ...c, [field]: value } : c
        );
        // Also auto-calculate receivedBooks if user enters numbers in qty cells
        let sumQty = 0;
        let hasAnyQty = false;
        nextCells.forEach((cell) => {
          const n = parseInt(cell.qty.trim(), 10);
          if (!isNaN(n)) {
            sumQty += n;
            hasAnyQty = true;
          }
        });
        return {
          ...r,
          cells: nextCells,
          receivedBooks: field === 'qty' && hasAnyQty ? String(sumQty) : r.receivedBooks,
        };
      });
      return { ...prev, rows: nextRows };
    });
  };

  const handleRowFieldChange = (
    rowIndex: number,
    field: 'classLabel' | 'totalBooks' | 'receivedBooks',
    value: string
  ) => {
    setSheet((prev) => {
      const nextRows = prev.rows.map((r, rIdx) =>
        rIdx === rowIndex ? { ...r, [field]: value } : r
      );
      return { ...prev, rows: nextRows };
    });
  };

  const handleAutoCalculateTotals = () => {
    setSheet((prev) => {
      const nextRows = prev.rows.map((r) => {
        const subjectCount = r.cells.filter((c) => c.subject.trim().length > 0).length;
        let sumQty = 0;
        let hasQty = false;
        r.cells.forEach((c) => {
          const n = parseInt(c.qty.trim(), 10);
          if (!isNaN(n)) {
            sumQty += n;
            hasQty = true;
          }
        });
        return {
          ...r,
          totalBooks: String(subjectCount),
          receivedBooks: hasQty ? String(sumQty) : r.receivedBooks,
        };
      });
      return { ...prev, rows: nextRows };
    });
    showNotice('Totals and Received quantities calculated and saved!');
  };

  const handleResetDefault = () => {
    setSheet(DEFAULT_SHEET_DATA);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SHEET_DATA));
    showNotice('Restored default GPS Chambai Kohat Annual Books Record format!');
  };

  const handlePrintTable = () => {
    const formatSubjectHtml = (text: string) =>
      text
        .split('\n')
        .map((line) => line.trim())
        .join('<br/>');

    const rowsHtml = sheet.rows
      .map((row, rIdx) => {
        // Row 0: Prep (col 1 has Creative Arts, cols 2..9 merged with Urdu calligraphy سالانہ کتب ریکارڈ)
        if (rIdx === 0) {
          return `
            <tr>
              <td rowspan="2" style="background:${row.bgColor};color:${row.textColor};font-weight:900;font-size:15px;text-align:center;border:1.5px solid #000;width:62px;">
                ${row.classLabel}
              </td>
              <td style="background:#e6e6e6;font-weight:800;font-size:11px;text-align:center;border:1px solid #000;height:28px;">
                ${formatSubjectHtml(row.cells[0].subject)}
              </td>
              <td colspan="8" rowspan="2" style="background:#ffffff;font-weight:900;font-size:34px;text-align:center;vertical-align:middle;border:1px solid #000;font-family:'Noto Nastaliq Urdu','Jameel Noori Nastaleeq','Amiri',serif;direction:rtl;">
                ${sheet.urduBannerTitle}
              </td>
              <td rowspan="2" style="background:#ffffff;font-weight:900;font-size:16px;text-align:center;border:1.5px solid #000;width:58px;">
                ${row.totalBooks}
              </td>
              <td rowspan="2" style="background:#ffffff;font-weight:900;font-size:15px;text-align:center;border:1.5px solid #000;width:68px;">
                ${row.receivedBooks}
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;font-weight:800;font-size:13px;text-align:center;border:1px solid #000;height:30px;">
                ${row.cells[0].qty}
              </td>
            </tr>
          `;
        }

        // Row 1: KG (cols 1..5 have subjects, cols 6..9 merged empty box)
        if (rIdx === 1) {
          const topCells = row.cells
            .slice(0, 5)
            .map(
              (c) => `
              <td style="background:#e6e6e6;font-weight:800;font-size:11px;text-align:center;border:1px solid #000;height:28px;">
                ${formatSubjectHtml(c.subject)}
              </td>
            `
            )
            .join('');
          const bottomCells = row.cells
            .slice(0, 5)
            .map(
              (c) => `
              <td style="background:#ffffff;font-weight:800;font-size:13px;text-align:center;border:1px solid #000;height:30px;">
                ${c.qty}
              </td>
            `
            )
            .join('');

          return `
            <tr>
              <td rowspan="2" style="background:${row.bgColor};color:${row.textColor};font-weight:900;font-size:15px;text-align:center;border:1.5px solid #000;">
                ${row.classLabel}
              </td>
              ${topCells}
              <td colspan="4" rowspan="2" style="background:#ffffff;border:1px solid #000;"></td>
              <td rowspan="2" style="background:#ffffff;font-weight:900;font-size:16px;text-align:center;border:1.5px solid #000;">
                ${row.totalBooks}
              </td>
              <td rowspan="2" style="background:#ffffff;font-weight:900;font-size:15px;text-align:center;border:1.5px solid #000;">
                ${row.receivedBooks}
              </td>
            </tr>
            <tr>
              ${bottomCells}
            </tr>
          `;
        }

        // Rows 2, 3, 4 (1st, 2nd, 3rd) and Rows 5, 6 (4th, 5th)
        const topCells = row.cells
          .map((c) => {
            const hasSubj = c.subject.trim().length > 0;
            return `
              <td style="background:${hasSubj ? '#e6e6e6' : '#ffffff'};font-weight:800;font-size:11px;text-align:center;border:1px solid #000;height:28px;">
                ${formatSubjectHtml(c.subject)}
              </td>
            `;
          })
          .join('');

        const bottomCells = row.cells
          .map(
            (c) => `
            <td style="background:#ffffff;font-weight:800;font-size:13px;text-align:center;border:1px solid #000;height:30px;">
              ${c.qty}
            </td>
          `
          )
          .join('');

        return `
          <tr>
            <td rowspan="2" style="background:${row.bgColor};color:${row.textColor};font-weight:900;font-size:15px;text-align:center;border:1.5px solid #000;">
              ${row.classLabel}
            </td>
            ${topCells}
            <td rowspan="2" style="background:#ffffff;font-weight:900;font-size:16px;text-align:center;border:1.5px solid #000;">
              ${row.totalBooks}
            </td>
            <td rowspan="2" style="background:#ffffff;font-weight:900;font-size:15px;text-align:center;border:1.5px solid #000;">
              ${row.receivedBooks}
            </td>
          </tr>
          <tr>
            ${bottomCells}
          </tr>
        `;
      })
      .join('');

    printHtmlDocument(
      `${sheet.schoolTitle} — Annual Books Received Record (${sheet.academicYear})`,
      `
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          .annual-books-table { width: 100%; border-collapse: collapse; border: 2px solid #000; font-family: Arial, sans-serif; }
          .annual-books-table th, .annual-books-table td { padding: 3px 4px; }
        </style>
        <table class="annual-books-table">
          <thead>
            <tr style="background:#d9d9d9;border:2px solid #000;">
              <th colspan="12" style="padding:8px 12px;border:2px solid #000;">
                <div style="font-size:28px;font-weight:900;letter-spacing:1px;text-align:center;color:#000;">
                  ${sheet.schoolTitle}
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;font-size:14px;font-weight:900;color:#000;padding:0 30px;">
                  <div><span style="font-size:11px;margin-right:12px;">EMIS CODE</span> <span style="font-size:16px;">${sheet.emisCode}</span></div>
                  <div><span style="font-size:13px;margin-right:14px;">Year</span> <span style="font-size:16px;">${sheet.academicYear}</span></div>
                </div>
              </th>
            </tr>
            <tr style="background:#ffffff;border:1.5px solid #000;">
              <th style="border:1.5px solid #000;width:62px;"></th>
              <th style="border:1.5px solid #000;font-size:15px;font-weight:900;text-align:center;">1</th>
              <th style="border:1.5px solid #000;font-size:15px;font-weight:900;text-align:center;">2</th>
              <th style="border:1.5px solid #000;font-size:15px;font-weight:900;text-align:center;">3</th>
              <th style="border:1.5px solid #000;font-size:15px;font-weight:900;text-align:center;">4</th>
              <th style="border:1.5px solid #000;font-size:15px;font-weight:900;text-align:center;">5</th>
              <th style="border:1.5px solid #000;font-size:15px;font-weight:900;text-align:center;">6</th>
              <th style="border:1.5px solid #000;font-size:15px;font-weight:900;text-align:center;">7</th>
              <th style="border:1.5px solid #000;font-size:15px;font-weight:900;text-align:center;">8</th>
              <th style="border:1.5px solid #000;font-size:15px;font-weight:900;text-align:center;">9</th>
              <th style="border:1.5px solid #000;font-size:13px;font-weight:900;text-align:center;width:58px;">Total</th>
              <th style="border:1.5px solid #000;font-size:13px;font-weight:900;text-align:center;width:68px;">${sheet.receivedColumnHeader}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `
    );
  };

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-4 border-2 border-slate-900 shadow-lg space-y-3">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
            Official Editable Books Sheet (سالانہ کتب ریکارڈ)
          </span>
          <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
            Annual Books Received Table — Click Any Box to Edit
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleAutoCalculateTotals}
            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-black flex items-center gap-1 border border-blue-200"
            title="Auto-calculate Total & Received columns"
          >
            <Calculator size={13} />
            <span>Auto Sum</span>
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
              showNotice('Annual Books Record saved permanently!');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 shadow-xs"
          >
            <Save size={13} />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black flex items-center gap-1"
            title="Reset to default table layout"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handlePrintTable}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black flex items-center gap-1.5 shadow-sm"
          >
            <Printer size={14} />
            <span>Print Out (پرنٹ آؤٹ)</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-black">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Horizontally Scrollable Exact Replica Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-black shadow-xs">
        <table className="w-full min-w-[920px] border-collapse text-center select-none">
          <thead>
            {/* Top Gray Header Block */}
            <tr className="bg-[#D9D9D9] border-b-2 border-black">
              <th colSpan={12} className="p-2.5 border-b-2 border-black">
                <input
                  type="text"
                  value={sheet.schoolTitle}
                  onChange={(e) => setSheet({ ...sheet, schoolTitle: e.target.value })}
                  className="w-full text-center bg-transparent text-2xl sm:text-3xl font-black tracking-wide text-black focus:outline-none focus:bg-white/60 rounded px-2"
                />
                <div className="flex items-center justify-between px-4 sm:px-10 mt-1 text-black">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      EMIS CODE
                    </span>
                    <input
                      type="text"
                      value={sheet.emisCode}
                      onChange={(e) => setSheet({ ...sheet, emisCode: e.target.value })}
                      className="w-24 text-center bg-white/70 border border-black/30 rounded px-1.5 py-0.5 text-sm font-black text-black focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">Year</span>
                    <input
                      type="text"
                      value={sheet.academicYear}
                      onChange={(e) => setSheet({ ...sheet, academicYear: e.target.value })}
                      className="w-28 text-center bg-white/70 border border-black/30 rounded px-1.5 py-0.5 text-sm font-black text-black focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </th>
            </tr>

            {/* Column Numbers 1..9 + Total + Resevid */}
            <tr className="bg-white border-b-2 border-black text-black font-black text-sm">
              <th className="border border-black w-16 py-1.5"></th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <th key={num} className="border border-black w-24 py-1.5 text-sm font-black">
                  {num}
                </th>
              ))}
              <th className="border border-black w-16 py-1.5 text-xs font-black">Total</th>
              <th className="border border-black w-20 py-1.5 text-xs font-black">
                <input
                  type="text"
                  value={sheet.receivedColumnHeader}
                  onChange={(e) =>
                    setSheet({ ...sheet, receivedColumnHeader: e.target.value })
                  }
                  className="w-full text-center bg-transparent font-black text-xs focus:outline-none focus:bg-amber-50"
                />
              </th>
            </tr>
          </thead>

          <tbody>
            {sheet.rows.map((row, rIdx) => {
              // Special layout for Row 0 (Prep): Col 1 has Creative Arts, Cols 2..9 merged with Urdu Title سالانہ کتب ریکارڈ
              if (rIdx === 0) {
                return (
                  <React.Fragment key={row.id}>
                    <tr>
                      <td
                        rowSpan={2}
                        style={{ backgroundColor: row.bgColor, color: row.textColor }}
                        className="border-2 border-black font-black text-base align-middle"
                      >
                        <input
                          type="text"
                          value={row.classLabel}
                          onChange={(e) =>
                            handleRowFieldChange(rIdx, 'classLabel', e.target.value)
                          }
                          style={{ color: row.textColor }}
                          className="w-full text-center bg-transparent font-black text-base focus:outline-none"
                        />
                      </td>
                      {/* Col 1 Subject */}
                      <td className="border border-black bg-[#E6E6E6] p-1 h-8 align-middle">
                        <input
                          type="text"
                          value={row.cells[0].subject}
                          onChange={(e) =>
                            handleCellChange(rIdx, 0, 'subject', e.target.value)
                          }
                          className="w-full text-center bg-transparent text-[11px] font-extrabold text-black focus:outline-none focus:bg-white rounded"
                        />
                      </td>
                      {/* Cols 2..9 Merged Urdu Banner */}
                      <td
                        colSpan={8}
                        rowSpan={2}
                        className="border border-black bg-white align-middle p-2"
                      >
                        <input
                          type="text"
                          dir="rtl"
                          value={sheet.urduBannerTitle}
                          onChange={(e) =>
                            setSheet({ ...sheet, urduBannerTitle: e.target.value })
                          }
                          className="w-full text-center bg-transparent text-2xl sm:text-3xl font-black text-black focus:outline-none focus:bg-amber-50 rounded py-1"
                        />
                      </td>
                      {/* Total */}
                      <td
                        rowSpan={2}
                        className="border-2 border-black bg-white align-middle"
                      >
                        <input
                          type="text"
                          value={row.totalBooks}
                          onChange={(e) =>
                            handleRowFieldChange(rIdx, 'totalBooks', e.target.value)
                          }
                          className="w-full h-full py-3 text-center bg-transparent text-base font-black text-black focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                      {/* Resevid */}
                      <td
                        rowSpan={2}
                        className="border-2 border-black bg-white align-middle"
                      >
                        <input
                          type="text"
                          placeholder="0"
                          value={row.receivedBooks}
                          onChange={(e) =>
                            handleRowFieldChange(rIdx, 'receivedBooks', e.target.value)
                          }
                          className="w-full h-full py-3 text-center bg-transparent text-base font-black text-emerald-800 focus:outline-none focus:bg-emerald-50"
                        />
                      </td>
                    </tr>
                    <tr>
                      {/* Col 1 Qty */}
                      <td className="border border-black bg-white p-1 h-9 align-middle">
                        <input
                          type="text"
                          placeholder="Qty"
                          value={row.cells[0].qty}
                          onChange={(e) =>
                            handleCellChange(rIdx, 0, 'qty', e.target.value)
                          }
                          className="w-full h-full text-center bg-transparent text-xs font-black text-blue-900 focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              }

              // Standard layout for KG, 1st, 2nd, 3rd, 4th, 5th (all 9 columns editable!)
              return (
                <React.Fragment key={row.id}>
                  {/* Top Sub-Row: Subject Names */}
                  <tr>
                    <td
                      rowSpan={2}
                      style={{ backgroundColor: row.bgColor, color: row.textColor }}
                      className="border-2 border-black font-black text-base align-middle"
                    >
                      <input
                        type="text"
                        value={row.classLabel}
                        onChange={(e) =>
                          handleRowFieldChange(rIdx, 'classLabel', e.target.value)
                        }
                        style={{ color: row.textColor }}
                        className="w-full text-center bg-transparent font-black text-base focus:outline-none"
                      />
                    </td>

                    {row.cells.map((cell, cIdx) => {
                      const hasSubject = cell.subject.trim().length > 0;
                      return (
                        <td
                          key={`subj-${row.id}-${cIdx}`}
                          className={`border border-black p-1 h-9 align-middle ${
                            hasSubject ? 'bg-[#E6E6E6]' : 'bg-white'
                          }`}
                        >
                          <textarea
                            rows={2}
                            value={cell.subject}
                            onChange={(e) =>
                              handleCellChange(rIdx, cIdx, 'subject', e.target.value)
                            }
                            className="w-full text-center bg-transparent text-[10px] leading-tight font-extrabold text-black resize-none focus:outline-none focus:bg-white rounded overflow-hidden"
                          />
                        </td>
                      );
                    })}

                    <td
                      rowSpan={2}
                      className="border-2 border-black bg-white align-middle"
                    >
                      <input
                        type="text"
                        value={row.totalBooks}
                        onChange={(e) =>
                          handleRowFieldChange(rIdx, 'totalBooks', e.target.value)
                        }
                        className="w-full h-full py-3 text-center bg-transparent text-base font-black text-black focus:outline-none focus:bg-amber-50"
                      />
                    </td>

                    <td
                      rowSpan={2}
                      className="border-2 border-black bg-white align-middle"
                    >
                      <input
                        type="text"
                        placeholder="0"
                        value={row.receivedBooks}
                        onChange={(e) =>
                          handleRowFieldChange(rIdx, 'receivedBooks', e.target.value)
                        }
                        className="w-full h-full py-3 text-center bg-transparent text-base font-black text-emerald-800 focus:outline-none focus:bg-emerald-50"
                      />
                    </td>
                  </tr>

                  {/* Bottom Sub-Row: Editable Received Quantities */}
                  <tr>
                    {row.cells.map((cell, cIdx) => (
                      <td
                        key={`qty-${row.id}-${cIdx}`}
                        className="border border-black bg-white p-1 h-9 align-middle"
                      >
                        <input
                          type="text"
                          placeholder={cell.subject.trim() ? 'Qty' : ''}
                          value={cell.qty}
                          onChange={(e) =>
                            handleCellChange(rIdx, cIdx, 'qty', e.target.value)
                          }
                          className="w-full h-full text-center bg-transparent text-xs font-black text-blue-900 focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
