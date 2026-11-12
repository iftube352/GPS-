import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Printer,
  Trash2,
  Users,
  Wallet,
  TrendingDown,
  TrendingUp,
  X,
  Phone,
  Receipt,
  Split,
  Package,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { FinancialTransaction, PtcFundType, PtcMember } from '../../types';
import { StorageService } from '../../services/storage';
import {
  printHtmlDocument,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
  readFileAsDataUrl,
} from '../../services/printAndFileService';
import { useViewMode, ViewModeToggle } from '../common/ViewModeToggle';

interface PtcFundModuleProps {
  lang: 'en' | 'ur';
}

interface AllFundsReservedRecord {
  id: string;
  fundName: string;
  financialYear: string;
  dateReceived: string;
  totalAmountReceived: number;
  referenceNumber: string;
  remarks: string;
  receiptDataUrl?: string;
  receiptFileName?: string;
  allocatedCapitation: number;
  allocatedConsumable: number;
  allocatedPrettyRepair: number;
}

const RESERVED_STORAGE_KEY = 'gps_chambai_ptc_reserved_v1';

const CAPITATION_PRODUCTS = [
  'Educational Tour',
  'Uniform Purchased',
  'Notebook Purchased',
  'Sport Activity',
  'Extracurricular Activity',
  'Prize distribution',
  'Science Fair',
  'Play Area / Play Ground',
  'Others',
];

const CONSUMABLE_PRODUCTS = [
  'Markers',
  'Chalks',
  'Black Boards',
  'White Boards',
  'Dusters',
  'Stationery',
  'Others',
];

const PRETTY_REPAIR_PRODUCTS = [
  'Whitewash',
  'Doors',
  'Windows',
  'Furniture',
  'Electricity',
  'Water',
  'Boundary',
  'Wall',
  'Toilets',
  'Floors',
  'Others',
];

const THREE_PTC_FUNDS: {
  num: string;
  fundType: PtcFundType;
  displayLabel: string;
  urduLabel: string;
  headerGradient: string;
  folderSubPath: string;
  products: string[];
}[] = [
  {
    num: '1.',
    fundType: 'Capitation Grant',
    displayLabel: '1. Capitation Grant',
    urduLabel: 'کیپی ٹیشن گرانٹ',
    headerGradient: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
    folderSubPath: 'PTC Fund/Capitation Grant',
    products: CAPITATION_PRODUCTS,
  },
  {
    num: '2.',
    fundType: 'Classroom Consumable Grant',
    displayLabel: '2. Consumable Grant',
    urduLabel: 'کلاس روم کنزیومیبل گرانٹ',
    headerGradient: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
    folderSubPath: 'PTC Fund/Consumable Grant',
    products: CONSUMABLE_PRODUCTS,
  },
  {
    num: '3.',
    fundType: 'Petty Repair Grant',
    displayLabel: '3. Pretty Repair Grant',
    urduLabel: 'پیٹی ریپیئر گرانٹ (مرمت)',
    headerGradient: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
    folderSubPath: 'PTC Fund/Pretty Repair',
    products: PRETTY_REPAIR_PRODUCTS,
  },
];

export const PtcFundModule: React.FC<PtcFundModuleProps> = ({ lang }) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [members, setMembers] = useState<PtcMember[]>([]);
  const [reservedFunds, setReservedFunds] = useState<AllFundsReservedRecord[]>(() => {
    try {
      const raw = localStorage.getItem(RESERVED_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [
      {
        id: 'res-default-2026',
        fundName: 'Annual E&SED KP PTC School Grant',
        financialYear: '2025-2026',
        dateReceived: '2026-08-15',
        totalAmountReceived: 120000,
        referenceNumber: 'KPESED-PTC-16454-2026',
        remarks: 'Official Annual PTC Grant credited to NBP Account #4098231502',
        allocatedCapitation: 50000,
        allocatedConsumable: 35000,
        allocatedPrettyRepair: 35000,
      },
    ];
  });

  const [activeTab, setActiveTab] = useState<'ledger' | 'council'>('ledger');
  const [selectedFundFilter, setSelectedFundFilter] = useState<'ALL' | PtcFundType>('ALL');
  const [viewMode, setViewMode] = useViewMode('ptc_fund_module', 'grid');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Step 1: "All Funds Reseved" Modal
  const [showAllFundsModal, setShowAllFundsModal] = useState(false);
  const [resFundName, setResFundName] = useState('Annual E&SED KP PTC School Grant');
  const [resFinYear, setResFinYear] = useState('2026-2027');
  const [resDate, setResDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [resTotalAmount, setResTotalAmount] = useState('150000');
  const [resRefNo, setResRefNo] = useState('PTC-REF-2026-01');
  const [resRemarks, setResRemarks] = useState('Official PTC Grant Received in School Account');
  const [resReceiptUrl, setResReceiptUrl] = useState<string | undefined>(undefined);
  const [resReceiptName, setResReceiptName] = useState<string | undefined>(undefined);
  const resReceiptInputRef = useRef<HTMLInputElement>(null);

  // Step 2: "DIVIDE FUNDS" Modal
  const [showDivideModal, setShowDivideModal] = useState(false);
  const [divCapitation, setDivCapitation] = useState('50000');
  const [divConsumable, setDivConsumable] = useState('35000');
  const [divPrettyRepair, setDivPrettyRepair] = useState('35000');
  const [divideError, setDivideError] = useState<string | null>(null);

  // Step 3: "Add Expense / Receipt" & "Add Products" Modal
  const [showTxModal, setShowTxModal] = useState(false);
  const [txModalMode, setTxModalMode] = useState<'expense_receipt' | 'products'>('expense_receipt');
  const [txFundType, setTxFundType] = useState<PtcFundType>('Capitation Grant');
  const [txType, setTxType] = useState<'Grant_Received' | 'Expense'>('Expense');
  const [txProductSelected, setTxProductSelected] = useState<string>('Uniform Purchased');
  const [txQuantity, setTxQuantity] = useState<string>('1');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txVoucherNo, setTxVoucherNo] = useState('');
  const [txReceiptImageUrl, setTxReceiptImageUrl] = useState<string | undefined>(undefined);
  const [txReceiptFileName, setTxReceiptFileName] = useState<string | undefined>(undefined);
  const txReceiptInputRef = useRef<HTMLInputElement>(null);

  // Add Council Member Modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<PtcMember['role']>('General Member');
  const [memberCnic, setMemberCnic] = useState('14301-0000000-1');
  const [memberContact, setMemberContact] = useState('0333-0000000');

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const refresh = () => {
    setTransactions(StorageService.getFinances());
    setMembers(StorageService.getPtcMembers());
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveReservedFundsList = (next: AllFundsReservedRecord[]) => {
    setReservedFunds(next);
    localStorage.setItem(RESERVED_STORAGE_KEY, JSON.stringify(next));
  };

  const isReceivedTx = (t: FinancialTransaction) =>
    t.type === 'Grant_Received' || t.type === 'Received';

  // Total Master Reserved Funds
  const masterTotalReserved = reservedFunds.reduce(
    (sum, r) => sum + Number(r.totalAmountReceived || 0),
    0
  );
  const masterAllocatedCapitation = reservedFunds.reduce(
    (sum, r) => sum + Number(r.allocatedCapitation || 0),
    0
  );
  const masterAllocatedConsumable = reservedFunds.reduce(
    (sum, r) => sum + Number(r.allocatedConsumable || 0),
    0
  );
  const masterAllocatedPrettyRepair = reservedFunds.reduce(
    (sum, r) => sum + Number(r.allocatedPrettyRepair || 0),
    0
  );
  const totalAllocatedSum =
    masterAllocatedCapitation + masterAllocatedConsumable + masterAllocatedPrettyRepair;
  const unallocatedBalance = Math.max(0, masterTotalReserved - totalAllocatedSum);

  // Overall totals across all 3 funds
  const totalReceived = transactions
    .filter((t) => isReceivedTx(t))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalWithdrawnExpense = transactions
    .filter((t) => !isReceivedTx(t))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const availableBalance = totalReceived - totalWithdrawnExpense;

  const getFundStats = (fundType: PtcFundType) => {
    const fundTxs = transactions.filter((t) => (t.fundType || 'Capitation Grant') === fundType);
    const received = fundTxs
      .filter((t) => isReceivedTx(t))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const withdraw = fundTxs
      .filter((t) => !isReceivedTx(t))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const balance = received - withdraw;
    return { received, withdraw, balance, count: fundTxs.length };
  };

  const getProductsForFund = (fundType: PtcFundType): string[] => {
    const match = THREE_PTC_FUNDS.find((f) => f.fundType === fundType);
    return match ? match.products : CAPITATION_PRODUCTS;
  };

  // Step 1 Handler: Save "All Funds Reseved"
  const handleSaveAllFundsReserved = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmt = Math.max(0, Number(resTotalAmount) || 0);
    if (!resFundName.trim() || totalAmt <= 0) return;

    const newRec: AllFundsReservedRecord = {
      id: `res-${Date.now()}`,
      fundName: resFundName.trim(),
      financialYear: resFinYear.trim(),
      dateReceived: resDate,
      totalAmountReceived: totalAmt,
      referenceNumber: resRefNo.trim(),
      remarks: resRemarks.trim(),
      receiptDataUrl: resReceiptUrl,
      receiptFileName: resReceiptName,
      allocatedCapitation: Math.round(totalAmt * 0.4),
      allocatedConsumable: Math.round(totalAmt * 0.3),
      allocatedPrettyRepair: totalAmt - Math.round(totalAmt * 0.4) - Math.round(totalAmt * 0.3),
    };

    saveReservedFundsList([newRec, ...reservedFunds]);
    setShowAllFundsModal(false);
    showToast(`Recorded Rs. ${totalAmt.toLocaleString()} in All Funds Reseved (${resFinYear})!`);
  };

  // Step 2 Handler: Save "DIVIDE FUNDS"
  const openDivideFundsModal = () => {
    setDivCapitation(String(masterAllocatedCapitation));
    setDivConsumable(String(masterAllocatedConsumable));
    setDivPrettyRepair(String(masterAllocatedPrettyRepair));
    setDivideError(null);
    setShowDivideModal(true);
  };

  const handleSaveDivideFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = Math.max(0, Number(divCapitation) || 0);
    const con = Math.max(0, Number(divConsumable) || 0);
    const rep = Math.max(0, Number(divPrettyRepair) || 0);
    const sum = cap + con + rep;

    if (sum > masterTotalReserved) {
      setDivideError(
        `Total allocation (Rs. ${sum.toLocaleString()}) cannot exceed Total Received Funds (Rs. ${masterTotalReserved.toLocaleString()}).`
      );
      return;
    }

    if (reservedFunds.length > 0) {
      const updated = reservedFunds.map((item, idx) =>
        idx === 0
          ? {
              ...item,
              allocatedCapitation: cap,
              allocatedConsumable: con,
              allocatedPrettyRepair: rep,
            }
          : {
              ...item,
              allocatedCapitation: 0,
              allocatedConsumable: 0,
              allocatedPrettyRepair: 0,
            }
      );
      saveReservedFundsList(updated);
    }

    // Also record or update the Grant_Received entries so the 3 grant cards reflect the divided allocation
    const today = new Date().toISOString().split('T')[0];
    const grantAllocations: { fundType: PtcFundType; amount: number; code: string }[] = [
      { fundType: 'Capitation Grant', amount: cap, code: 'DIV-CAP' },
      { fundType: 'Classroom Consumable Grant', amount: con, code: 'DIV-CON' },
      { fundType: 'Petty Repair Grant', amount: rep, code: 'DIV-REP' },
    ];

    grantAllocations.forEach((alloc) => {
      const currentStats = getFundStats(alloc.fundType);
      const diff = alloc.amount - currentStats.received;
      if (diff > 0) {
        StorageService.addFinance({
          id: `ft-div-${alloc.code}-${Date.now()}`,
          fundType: alloc.fundType,
          date: today,
          title: `Allocated via DIVIDE FUNDS (${alloc.fundType})`,
          productName: 'Divided Fund Allocation',
          type: 'Grant_Received',
          amount: diff,
          voucherNo: `${alloc.code}-${Date.now().toString().slice(-4)}`,
          receiptNo: `${alloc.code}-${Date.now().toString().slice(-4)}`,
          category: 'Grant',
          approvedBy: 'PTC Council Fund Division',
          remarks: `Allocated Rs. ${alloc.amount.toLocaleString()} out of Rs. ${masterTotalReserved.toLocaleString()}`,
        });
      }
    });

    refresh();
    setShowDivideModal(false);
    showToast(
      `Funds divided! Capitation: Rs.${cap.toLocaleString()}, Consumable: Rs.${con.toLocaleString()}, Pretty Repair: Rs.${rep.toLocaleString()}`
    );
  };

  // Step 3 Handler: Open Add Expense / Receipt or Add Products Modal
  const openAddTxForFund = (
    fundType: PtcFundType,
    defaultType: 'Grant_Received' | 'Expense' = 'Expense',
    mode: 'expense_receipt' | 'products' = 'expense_receipt'
  ) => {
    const prods = getProductsForFund(fundType);
    setTxFundType(fundType);
    setTxType(defaultType);
    setTxModalMode(mode);
    setTxProductSelected(prods[0]);
    setTxQuantity('1');
    setTxTitle(mode === 'products' ? `${prods[0]} (Qty: 1)` : '');
    setTxAmount('');
    setTxVoucherNo(`REC-${Date.now().toString().slice(-4)}`);
    setTxReceiptImageUrl(undefined);
    setTxReceiptFileName(undefined);
    setShowTxModal(true);
  };

  const handleUploadReceiptFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'reserved' | 'tx'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const folderSub =
        target === 'reserved'
          ? 'PTC Fund/Receipts'
          : txType === 'Grant_Received'
          ? 'PTC Fund/Receipts'
          : 'PTC Fund/Expenses';
      const res = await readFileAsDataUrl(file, folderSub, 'PTC Fund Module');
      if (target === 'reserved') {
        setResReceiptUrl(res.dataUrl);
        setResReceiptName(res.filename);
      } else {
        setTxReceiptImageUrl(res.dataUrl);
        setTxReceiptFileName(res.filename);
      }
      showToast(`Uploaded ${res.filename} to GPS Chambai/${folderSub}`);
    } catch {
      // ignore
    }
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle =
      txTitle.trim() ||
      `${txProductSelected}${Number(txQuantity) > 1 ? ` (Qty: ${txQuantity})` : ''}`;
    if (!finalTitle || !txAmount) return;

    const record: FinancialTransaction = {
      id: `ft-${Date.now()}`,
      fundType: txFundType,
      date: txDate,
      title: finalTitle,
      productName: `${txProductSelected} (Qty: ${txQuantity || '1'})`,
      type: txType,
      amount: Math.max(0, Number(txAmount) || 0),
      voucherNo: txVoucherNo.trim() || `REC-${Date.now().toString().slice(-4)}`,
      receiptNo: txVoucherNo.trim() || `REC-${Date.now().toString().slice(-4)}`,
      category: txType === 'Grant_Received' ? 'Grant' : 'Stationery',
      approvedBy: 'Malik Noor Muhammad Khan (PTC Chairman) & Muhammad Ismail (PSHT)',
      remarks: txReceiptFileName
        ? `Product: ${txProductSelected} | Qty: ${txQuantity} | Receipt: ${txReceiptFileName}`
        : `Product: ${txProductSelected} | Qty: ${txQuantity}`,
    };
    StorageService.addFinance(record);
    refresh();
    setShowTxModal(false);
    setTxTitle('');
    setTxAmount('');
    showToast(`Saved ${txType === 'Expense' ? 'Expense' : 'Receipt'} for ${txFundType}!`);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;
    StorageService.addPtcMember({
      id: `ptc-${Date.now()}`,
      name: memberName.trim(),
      role: memberRole,
      designation: memberRole,
      cnic: memberCnic.trim(),
      contactNo: memberContact.trim(),
      mobileNo: memberContact.trim(),
    });
    refresh();
    setShowMemberModal(false);
    setMemberName('');
  };

  const filteredTransactions =
    selectedFundFilter === 'ALL'
      ? transactions
      : transactions.filter((t) => (t.fundType || 'Capitation Grant') === selectedFundFilter);

  const buildFinancialReportHtml = () => {
    const fundCardsHtml = THREE_PTC_FUNDS.map((f) => {
      const st = getFundStats(f.fundType);
      return `
        <div style="border:2px solid #cbd5e1;border-radius:10px;padding:10px;">
          <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:6px;">${f.displayLabel}</div>
          <div style="font-size:11px;"><strong>Received:</strong> <span style="color:#15803d;">PKR ${st.received.toLocaleString()}</span></div>
          <div style="font-size:11px;"><strong>Withdraw / Expense:</strong> <span style="color:#b91c1c;">PKR ${st.withdraw.toLocaleString()}</span></div>
          <div style="font-size:12px;margin-top:3px;"><strong>Remaining Balance:</strong> <span style="color:#1d4ed8;font-weight:900;">PKR ${st.balance.toLocaleString()}</span></div>
        </div>
      `;
    }).join('');

    const txRows = filteredTransactions
      .map((t, idx) => {
        const isRec = isReceivedTx(t);
        return `
        <tr>
          <td>${idx + 1}</td>
          <td>${t.date}</td>
          <td><strong>${t.fundType || 'Capitation Grant'}</strong></td>
          <td>${t.voucherNo || t.receiptNo || '-'}</td>
          <td><strong>${t.title}</strong><br/><span style="font-size:10px;color:#555;">${t.remarks || ''}</span></td>
          <td style="color:${isRec ? '#15803d' : '#b91c1c'};font-weight:800;">
            ${isRec ? 'Received (+)' : 'Expense (-)'} PKR ${Number(t.amount || 0).toLocaleString()}
          </td>
        </tr>
      `;
      })
      .join('');

    return `
      <div style="margin-bottom:12px;padding:10px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;">
        <strong>All Funds Reseved Total:</strong> PKR ${masterTotalReserved.toLocaleString()} &nbsp;|&nbsp;
        <strong>Allocated Total:</strong> PKR ${totalAllocatedSum.toLocaleString()} &nbsp;|&nbsp;
        <strong>Unallocated Balance:</strong> PKR ${unallocatedBalance.toLocaleString()}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;">
        ${fundCardsHtml}
      </div>
      <h3 style="font-size:14px;font-weight:800;margin-bottom:6px;">PTC Fund Cashbook, Products & Expense/Receipt Ledger</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Fund Category</th>
            <th>Receipt No</th>
            <th>Product / Description</th>
            <th>Amount (PKR)</th>
          </tr>
        </thead>
        <tbody>${txRows}</tbody>
      </table>
    `;
  };

  const handlePrintFinancialReport = () => {
    printHtmlDocument(
      'Official PTC Fund Financial Report (3 Grants) & Council Register',
      buildFinancialReportHtml()
    );
  };

  const handleExportPdf = () => {
    const res = exportAndSaveRealPdf('PTC_Fund_Financial_Report', buildFinancialReportHtml(), {
      folderSubPath: 'PTC Fund/Receipts',
      moduleSource: 'PTC Fund & Council',
    });
    showToast(`Saved ${res.filename} to ${res.folderPath}`);
  };

  const handleExportWord = () => {
    const res = exportAndSaveWordDoc('PTC_Fund_Financial_Report', buildFinancialReportHtml(), {
      folderSubPath: 'PTC Fund/Receipts',
      moduleSource: 'PTC Fund & Council',
    });
    showToast(`Exported ${res.filename} to ${res.folderPath}`);
  };

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Parent-Teacher Council • GPS Chambai Kohat (EMIS: 16454)
          </span>
          <h2 className="text-lg font-black tracking-tight mt-0.5">
            {lang === 'ur' ? 'پی ٹی سی فنڈ اور کونسل (3 فنڈز)' : 'PTC Fund & Council'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} lang={lang} />
          <button
            onClick={handlePrintFinancialReport}
            className="px-2.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1"
            title="Print Preview & Print"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="px-2.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1"
            title="Save PDF to GPS Chambai/PTC Fund"
          >
            <Download size={14} />
            <span>PDF</span>
          </button>
          <button
            onClick={handleExportWord}
            className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1"
            title="Export Word (.doc)"
          >
            <FileSpreadsheet size={14} />
            <span>Doc</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-2 text-xs font-black">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{savedNotice}</span>
          </div>
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('gps-open-folder-modal', {
                  detail: { folderPath: 'GPS Chambai/PTC Fund/Capitation Grant' },
                })
              )
            }
            className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[10px] font-black flex items-center gap-1"
          >
            <FolderOpen size={11} />
            <span>Open Folder</span>
          </button>
        </div>
      )}

      {/* REQUIREMENT 10.B STEP 1 & STEP 2 BUTTONS: "All Funds Reseved" & "DIVIDE FUNDS" */}
      <div className="bg-white rounded-3xl p-4 border-2 border-blue-600 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              Step 1 &amp; Step 2 • Master PTC Fund Allocation
            </span>
            <h3 className="text-sm font-black text-slate-900 mt-1">
              Total School Funds Received &amp; 3-Grant Allocation
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Step 1 Button: "All Funds Reseved" */}
            <button
              type="button"
              onClick={() => setShowAllFundsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Wallet size={15} />
              <span>All Funds Reseved</span>
            </button>

            {/* Step 2 Button: "DIVIDE FUNDS" */}
            <button
              type="button"
              onClick={openDivideFundsModal}
              className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Split size={15} />
              <span>DIVIDE FUNDS</span>
            </button>
          </div>
        </div>

        {/* Master Reserved & Divided Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-[9px] font-black uppercase text-emerald-800">All Funds Reseved</div>
            <div className="text-sm font-black text-emerald-700 mt-0.5">
              Rs. {masterTotalReserved.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="text-[9px] font-black uppercase text-blue-800">1. Capitation</div>
            <div className="text-sm font-black text-blue-700 mt-0.5">
              Rs. {masterAllocatedCapitation.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-teal-50 border border-teal-200">
            <div className="text-[9px] font-black uppercase text-teal-800">2. Consumable</div>
            <div className="text-sm font-black text-teal-700 mt-0.5">
              Rs. {masterAllocatedConsumable.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="text-[9px] font-black uppercase text-amber-800">3. Pretty Repair</div>
            <div className="text-sm font-black text-amber-700 mt-0.5">
              Rs. {masterAllocatedPrettyRepair.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-300 col-span-2 sm:col-span-1">
            <div className="text-[9px] font-black uppercase text-slate-600">Unallocated Balance</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              Rs. {unallocatedBalance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Summary Strip (Available Balance, Withdraw, Received) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div
          className="rounded-2xl p-3 text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
        >
          <div className="text-[9px] font-black uppercase opacity-90">Remaining Balance</div>
          <div className="text-sm sm:text-lg font-black mt-0.5">
            Rs. {availableBalance.toLocaleString()}
          </div>
        </div>
        <div
          className="rounded-2xl p-3 text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' }}
        >
          <div className="text-[9px] font-black uppercase opacity-90">Total Expenses</div>
          <div className="text-sm sm:text-lg font-black mt-0.5">
            Rs. {totalWithdrawnExpense.toLocaleString()}
          </div>
        </div>
        <div
          className="rounded-2xl p-3 text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)' }}
        >
          <div className="text-[9px] font-black uppercase opacity-90">Total Received</div>
          <div className="text-sm sm:text-lg font-black mt-0.5">
            Rs. {totalReceived.toLocaleString()}
          </div>
        </div>
      </div>

      {/* STEP 3: 3 DISTINCT PTC FUNDS WITH "Add Expense / Receipt" & "Add Products" BUTTONS */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
        {THREE_PTC_FUNDS.map((fund) => {
          const stats = getFundStats(fund.fundType);
          return (
            <div
              key={fund.fundType}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Fund Card Header */}
              <div
                style={{ background: fund.headerGradient }}
                className="px-4 py-3 text-white flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-full">
                      {fund.num}
                    </span>
                    <h3 className="text-sm sm:text-base font-black tracking-tight">
                      {fund.displayLabel}
                    </h3>
                  </div>
                  <p className="text-[11px] font-urdu text-white/90 mt-0.5">{fund.urduLabel}</p>
                </div>

                {/* Step 3 Required Buttons: "Add Expense / Receipt" and "Add Products" */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => openAddTxForFund(fund.fundType, 'Expense', 'expense_receipt')}
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-[11px] font-black flex items-center gap-1 shadow-md active:scale-95 transition-all"
                  >
                    <Plus size={13} className="text-emerald-700" />
                    <span>Add Expense / Receipt</span>
                  </button>
                  <button
                    onClick={() => openAddTxForFund(fund.fundType, 'Expense', 'products')}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black flex items-center gap-1 shadow-md active:scale-95 transition-all"
                  >
                    <Package size={13} />
                    <span>Add Products</span>
                  </button>
                </div>
              </div>

              {/* 3 Metrics Inside Each Fund */}
              <div className="p-3.5 grid grid-cols-3 gap-2.5 bg-slate-50/70">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-black text-emerald-800 uppercase">
                    <TrendingUp size={12} />
                    <span>Received</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-emerald-700 mt-1">
                    Rs. {stats.received.toLocaleString()}
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-black text-rose-800 uppercase">
                    <TrendingDown size={12} />
                    <span>Expenses</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-rose-600 mt-1">
                    Rs. {stats.withdraw.toLocaleString()}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-black text-blue-800 uppercase">
                    <Wallet size={12} />
                    <span>Remaining Balance</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-blue-700 mt-1">
                    Rs. {stats.balance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Selectable Products Preview Chips for this Grant */}
              <div className="px-3.5 py-2 bg-white border-t border-slate-100 flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-black text-slate-500 mr-1">Products:</span>
                {fund.products.map((prod) => (
                  <button
                    key={prod}
                    type="button"
                    onClick={() => {
                      openAddTxForFund(fund.fundType, 'Expense', 'products');
                      setTxProductSelected(prod);
                      setTxTitle(`${prod} (Qty: 1)`);
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors"
                  >
                    + {prod}
                  </button>
                ))}
              </div>

              {/* Quick Actions Footer for this Grant */}
              <div className="px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openAddTxForFund(fund.fundType, 'Grant_Received', 'expense_receipt')}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>+ Receipt</span>
                  </button>
                  <button
                    onClick={() => openAddTxForFund(fund.fundType, 'Expense', 'expense_receipt')}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black flex items-center gap-1"
                  >
                    <Receipt size={12} />
                    <span>- Expense</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedFundFilter(
                      selectedFundFilter === fund.fundType ? 'ALL' : fund.fundType
                    );
                    setActiveTab('ledger');
                  }}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                    selectedFundFilter === fund.fundType
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {selectedFundFilter === fund.fundType
                    ? 'Showing Filter ✓'
                    : `View Records (${stats.count})`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-tabs: Financial Ledger vs PTC Council Members */}
      <div className="grid grid-cols-2 gap-1.5 bg-slate-200 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-2 rounded-xl text-xs font-black ${
            activeTab === 'ledger' ? 'bg-slate-900 text-white' : 'text-slate-700'
          }`}
        >
          Expense / Receipt Ledger ({filteredTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('council')}
          className={`py-2 rounded-xl text-xs font-black ${
            activeTab === 'council' ? 'bg-slate-900 text-white' : 'text-slate-700'
          }`}
        >
          PTC Council Members ({members.length})
        </button>
      </div>

      {/* TAB 1: FINANCIAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-2.5">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedFundFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
                selectedFundFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              All 3 Grants ({transactions.length})
            </button>
            {THREE_PTC_FUNDS.map((f) => (
              <button
                key={f.fundType}
                onClick={() => setSelectedFundFilter(f.fundType)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
                  selectedFundFilter === f.fundType
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {f.displayLabel}
              </button>
            ))}
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-2.5'}>
            {filteredTransactions.map((tx) => {
              const isGrant = isReceivedTx(tx);
              const fundLabel = tx.fundType || 'Capitation Grant';
              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0 ${
                        isGrant ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {isGrant ? 'IN' : 'OUT'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                          {fundLabel}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {tx.voucherNo || tx.receiptNo}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{tx.date}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 truncate mt-1">
                        {tx.title || tx.productName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold truncate">
                        {tx.remarks || tx.approvedBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm font-black ${
                          isGrant ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isGrant ? '+' : '-'} Rs. {Number(tx.amount || 0).toLocaleString()}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {isGrant ? 'Received' : 'Expense'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        StorageService.deleteFinance(tx.id);
                        refresh();
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                      title="Delete Transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PTC COUNCIL MEMBERS */}
      {activeTab === 'council' && (
        <div className="space-y-2.5">
          <div className="flex justify-end">
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add Council Member</span>
            </button>
          </div>
          {members.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {m.role || m.designation}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">{m.name}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-2">
                    <span>CNIC: {m.cnic}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Phone size={10} /> {m.contactNo || m.mobileNo}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  StorageService.deletePtcMember(m.id);
                  refresh();
                }}
                className="p-2 rounded-xl bg-rose-50 text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 MODAL: "All Funds Reseved" */}
      {showAllFundsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAllFundsReserved}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700">
                  Step 1 • Record School Funds Received
                </span>
                <h3 className="text-base font-black text-slate-900">All Funds Reseved</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllFundsModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                1. Fund Name
              </label>
              <input
                type="text"
                required
                value={resFundName}
                onChange={(e) => setResFundName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  2. Financial Year
                </label>
                <input
                  type="text"
                  required
                  value={resFinYear}
                  onChange={(e) => setResFinYear(e.target.value)}
                  placeholder="2026-2027"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  3. Date Received
                </label>
                <input
                  type="date"
                  required
                  value={resDate}
                  onChange={(e) => setResDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  4. Total Amount Received (PKR)
                </label>
                <input
                  type="number"
                  required
                  value={resTotalAmount}
                  onChange={(e) => setResTotalAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  5. Reference Number
                </label>
                <input
                  type="text"
                  value={resRefNo}
                  onChange={(e) => setResRefNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                6. Remarks
              </label>
              <textarea
                rows={2}
                value={resRemarks}
                onChange={(e) => setResRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                7. Supporting Receipt / Document Upload
              </label>
              <input
                ref={resReceiptInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => handleUploadReceiptFile(e, 'reserved')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => resReceiptInputRef.current?.click()}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-black text-slate-800 flex items-center justify-center gap-1.5"
              >
                <Upload size={14} />
                <span>{resReceiptName ? `Uploaded: ${resReceiptName}` : 'Upload Receipt / Document'}</span>
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAllFundsModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black"
              >
                Save All Funds Reseved
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2 MODAL: "DIVIDE FUNDS" */}
      {showDivideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDivideFunds}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-700">
                  Step 2 • Allocate into 3 PTC Grants
                </span>
                <h3 className="text-base font-black text-slate-900">DIVIDE FUNDS</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDivideModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">Total Received Funds:</span>
                <span className="font-black text-emerald-700">
                  Rs. {masterTotalReserved.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">Currently Allocated:</span>
                <span className="font-black text-blue-700">
                  Rs.{' '}
                  {(
                    (Number(divCapitation) || 0) +
                    (Number(divConsumable) || 0) +
                    (Number(divPrettyRepair) || 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span className="font-bold text-slate-800">Remaining Unallocated Balance:</span>
                <span className="font-black text-slate-900">
                  Rs.{' '}
                  {(
                    masterTotalReserved -
                    ((Number(divCapitation) || 0) +
                      (Number(divConsumable) || 0) +
                      (Number(divPrettyRepair) || 0))
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {divideError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {divideError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black text-blue-800 mb-1">
                1. Capitation Grant Allocation (PKR)
              </label>
              <input
                type="number"
                required
                value={divCapitation}
                onChange={(e) => {
                  setDivCapitation(e.target.value);
                  setDivideError(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-emerald-800 mb-1">
                2. Consumable Grant Allocation (PKR)
              </label>
              <input
                type="number"
                required
                value={divConsumable}
                onChange={(e) => {
                  setDivConsumable(e.target.value);
                  setDivideError(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-amber-800 mb-1">
                3. Pretty Repair Grant Allocation (PKR)
              </label>
              <input
                type="number"
                required
                value={divPrettyRepair}
                onChange={(e) => {
                  setDivPrettyRepair(e.target.value);
                  setDivideError(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDivideModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-black"
              >
                Confirm DIVIDE FUNDS
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3 MODAL: Add Expense / Receipt & Add Products */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTransaction}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {txModalMode === 'products' ? 'Add Products' : 'Add Expense / Receipt'} ({txFundType})
              </h3>
              <button
                type="button"
                onClick={() => setShowTxModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Select PTC Fund Grant (1, 2, or 3) */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                1. Fund Category
              </label>
              <select
                value={txFundType}
                onChange={(e) => {
                  const nextFund = e.target.value as PtcFundType;
                  setTxFundType(nextFund);
                  const prods = getProductsForFund(nextFund);
                  setTxProductSelected(prods[0]);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
              >
                <option value="Capitation Grant">1. Capitation Grant</option>
                <option value="Classroom Consumable Grant">2. Consumable Grant</option>
                <option value="Petty Repair Grant">3. Pretty Repair Grant</option>
              </select>
            </div>

            {/* Transaction Type */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTxType('Grant_Received')}
                className={`py-2 rounded-xl text-xs font-black border ${
                  txType === 'Grant_Received'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                + Receipt (آمدن)
              </button>
              <button
                type="button"
                onClick={() => setTxType('Expense')}
                className={`py-2 rounded-xl text-xs font-black border ${
                  txType === 'Expense'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                - Expense (خرچ)
              </button>
            </div>

            {/* Selectable Product List for Selected Grant */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  2. Select Product ({txFundType})
                </label>
                <select
                  value={txProductSelected}
                  onChange={(e) => {
                    setTxProductSelected(e.target.value);
                    setTxTitle(`${e.target.value} (Qty: ${txQuantity || '1'})`);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  {getProductsForFund(txFundType).map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  3. Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={txQuantity}
                  onChange={(e) => {
                    setTxQuantity(e.target.value);
                    setTxTitle(`${txProductSelected} (Qty: ${e.target.value || '1'})`);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                4. Description / Title
              </label>
              <input
                type="text"
                required
                value={txTitle}
                onChange={(e) => setTxTitle(e.target.value)}
                placeholder="e.g., Purchased White Boards / Classroom Whitewash"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  5. Amount (PKR)
                </label>
                <input
                  type="number"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  6. Receipt Number
                </label>
                <input
                  type="text"
                  value={txVoucherNo}
                  onChange={(e) => setTxVoucherNo(e.target.value)}
                  placeholder="REC-2026-09"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">7. Date</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  8. Upload Receipt Image/PDF
                </label>
                <input
                  ref={txReceiptInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => handleUploadReceiptFile(e, 'tx')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => txReceiptInputRef.current?.click()}
                  className="w-full py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] font-black text-slate-800 truncate"
                >
                  {txReceiptFileName ? `✓ ${txReceiptFileName}` : 'Upload Receipt'}
                </button>
              </div>
            </div>

            {txReceiptImageUrl && txReceiptImageUrl.startsWith('data:image/') && (
              <div className="h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <img
                  src={txReceiptImageUrl}
                  alt="Receipt Preview"
                  className="max-h-full object-contain"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTxModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black"
              >
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add PTC Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMember}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3"
          >
            <h3 className="text-base font-black text-slate-900">Add PTC Council Member</h3>
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Council Role
              </label>
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value as PtcMember['role'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                <option value="Chairman">Chairman</option>
                <option value="Secretary (Head Teacher)">Secretary (Head Teacher)</option>
                <option value="Teacher Member">Teacher Member</option>
                <option value="Parent Member">Parent Member</option>
                <option value="General Member">General Member</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">CNIC</label>
                <input
                  type="text"
                  value={memberCnic}
                  onChange={(e) => setMemberCnic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={memberContact}
                  onChange={(e) => setMemberContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black"
              >
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
