import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Bot,
  BookOpen,
  FileText,
  MessageSquare,
  Send,
  Printer,
  Compass,
  Cpu,
  HelpCircle,
  Lightbulb,
  Award,
  RefreshCw,
  Download,
  Languages,
  CheckCircle2,
  Sliders,
  Play,
} from 'lucide-react';
import { OFFICIAL_SIX_CLASSES } from '../../../utils/classColors';
import { printHtmlDocument, saveFileToGpsChambaiFolder, executeIframePrint, buildOfficialPrintHtml, exportAndSaveRealPdf } from '../../../services/printAndFileService';

interface AiPortalSubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

/* =====================================================================
   EXACT IMAGE 012 VECTOR ICONS FOR ALL 6 AI MODELS
   ===================================================================== */

export const ChatGptLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <img
    src="/assets/aistudio/ChatGPT_1_132a42df.png"
    alt="ChatGPT"
    width={size}
    height={size}
    className={`object-contain shrink-0 ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const DeepSeekLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <img
    src="/assets/aistudio/DeepSeek_2_60f2583f.png"
    alt="DeepSeek"
    width={size}
    height={size}
    className={`object-contain shrink-0 ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const GeminiLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <img
    src="/assets/aistudio/Gemini_3_b7bc17c8.png"
    alt="Gemini"
    width={size}
    height={size}
    className={`object-contain shrink-0 ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const MetaAiLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <img
    src="/assets/aistudio/Meta_AI_4_e1180f35.png"
    alt="Meta AI"
    width={size}
    height={size}
    className={`object-contain shrink-0 ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const CopilotLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <img
    src="/assets/aistudio/Copilot_5_a640519f.png"
    alt="Copilot"
    width={size}
    height={size}
    className={`object-contain shrink-0 ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

export const ClaudeLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <img
    src="/assets/aistudio/Claude_6_abb83862.png"
    alt="Claude"
    width={size}
    height={size}
    className={`object-contain shrink-0 ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

interface AiModelItem {
  id: string;
  name: string;
  provider: string;
  url: string;
  color: string;
  gradient: string;
  description: string;
  bestFor: string;
  LogoComponent: React.FC<{ size?: number; className?: string }>;
}

const AI_MODELS: AiModelItem[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    url: 'https://chatgpt.com/',
    color: '#10A37F',
    gradient: 'from-emerald-600 to-teal-800',
    description: 'Versatile conversational assistant for daily school administration, lesson ideas, and Urdu text generation.',
    bestFor: 'General teaching, creative lessons & translation',
    LogoComponent: ChatGptLogo,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek AI',
    url: 'https://chat.deepseek.com/',
    color: '#0066FF',
    gradient: 'from-blue-600 to-indigo-800',
    description: 'Advanced logical reasoning and step-by-step problem solving for Primary Mathematics and Science explanations.',
    bestFor: 'Maths reasoning, step-by-step science & logic',
    LogoComponent: DeepSeekLogo,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'Google',
    url: 'https://gemini.google.com/',
    color: '#1A73E8',
    gradient: 'from-sky-500 via-blue-600 to-purple-600',
    description: 'High-speed multimodal AI directly integrated with Google Workspace, search grounding, and research data.',
    bestFor: 'Real-time facts, research & visual analysis',
    LogoComponent: GeminiLogo,
  },
  {
    id: 'meta_ai',
    name: 'Meta AI',
    provider: 'Meta',
    url: 'https://www.meta.ai/',
    color: '#0081FB',
    gradient: 'from-blue-500 via-cyan-600 to-blue-700',
    description: 'Free, fast, and accessible AI assistant powering WhatsApp, Facebook, and creative educational stories.',
    bestFor: 'WhatsApp notices, quick answers & stories',
    LogoComponent: MetaAiLogo,
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    provider: 'Microsoft',
    url: 'https://copilot.microsoft.com/',
    color: '#0078D4',
    gradient: 'from-cyan-600 to-blue-800',
    description: 'Workplace and productivity companion for Word documents, Excel tabular sheets, and official school circulars.',
    bestFor: 'Office Performa, Word & Excel tables',
    LogoComponent: CopilotLogo,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    provider: 'Anthropic',
    url: 'https://claude.ai/',
    color: '#D97706',
    gradient: 'from-amber-600 to-orange-800',
    description: 'Exceptional writing nuance, exam question crafting, balanced thinking, and long-form school policies.',
    bestFor: 'Detailed exam papers & structured Urdu writing',
    LogoComponent: ClaudeLogo,
  },
];

interface PromptTemplate {
  id: string;
  title: string;
  titleUr: string;
  category: string;
  icon: string;
  generatePrompt: (selectedClass: string, subject: string) => string;
  sampleResponse: (selectedClass: string, subject: string, modelName: string) => string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'lp_maker',
    title: 'KP Lesson Plan Generator',
    titleUr: 'کے پی لیسن پلان جنریٹر',
    category: 'Teaching',
    icon: '📝',
    generatePrompt: (cls, sub) =>
      `Act as an expert primary school master trainer in Khyber Pakhtunkhwa. Prepare a complete, practical 40-minute Lesson Plan for ${cls} in the subject of "${sub}". Follow the DCTE KP curriculum format with: 1. Specific Learning Objectives (Knowledge, Skills, Attitude), 2. Previous Knowledge Check, 3. Teaching Aids (Textbook, Board, Realia), 4. Introduction (5-10 min), 5. Presentation & Teaching Steps (Step 1-4 with teacher and student activities), 6. Assessment Questions, and 7. Homework Assignment.`,
    sampleResponse: (cls, sub, model) =>
      `# DCTE KP Lesson Plan — ${cls} (${sub})\n**Generated by ${model} for Govt. Primary School Chambai Kohat (EMIS: 16454)**\n**Duration:** 40 Minutes | **Method:** Activity-Based Learning (ABL)\n\n### 1. Specific Learning Objectives (SLOs):\n- **Knowledge:** Students will be able to state and define key facts of ${sub}.\n- **Skills:** Students will illustrate and write summary points in their notebooks.\n- **Attitude:** Foster active participation, teamwork, and Islamic values of learning.\n\n### 2. Previous Knowledge Check (5 min):\n- Review 2 conceptual questions from the previous unit.\n- Connect student everyday village experiences in Chambai with today's topic.\n\n### 3. Teaching Aids & Materials:\n- KP Textbook, Colored Whiteboard Markers, Illustrative Wall Chart, Flashcards.\n\n### 4. Introduction & Warm-up (5 min):\n- Teacher engages class with a riddle or thought-provoking observation.\n- Write the lesson topic boldly on the board.\n\n### 5. Presentation & Teaching Steps (20 min):\n- **Step 1 (Explanation):** Teacher explains the core concept with real-life analogies.\n- **Step 2 (Demonstration):** Solve a sample problem/example on the whiteboard.\n- **Step 3 (Guided Practice):** Students work in pairs to answer textbook activity.\n- **Step 4 (Verification):** Teacher monitors individual student understanding.\n\n### 6. Assessment & Oral Evaluation (7 min):\n- 3 quick oral check questions for random students.\n- 1 volunteer student presents summary on the board.\n\n### 7. Homework / Assignment (3 min):\n- Complete exercise questions 1, 2, and 3 from page 24 of the KP textbook.`,
  },
  {
    id: 'exam_maker',
    title: 'Semester Exam Paper Creator',
    titleUr: 'امتحانی پرچہ سوالات میکر',
    category: 'Exams',
    icon: '📄',
    generatePrompt: (cls, sub) =>
      `Draft a balanced 50-marks Semester Examination Paper for ${cls} for the subject "${sub}" based on the KP textbook board syllabus. Include: Section A: 5 MCQs (10 marks), Section B: 5 Short Conceptual Questions (20 marks), and Section C: 2 Long/Descriptive Questions with choices (20 marks). Provide bilingual (English & Urdu) instructions for primary students.`,
    sampleResponse: (cls, sub, model) =>
      `# Govt. Primary School Chambai Kohat\n**Semester Examination — ${cls} (${sub})**\n*Created via ${model} AI Educational Workspace*\nTotal Marks: 50 | Time Allowed: 2 Hours\n\n### Section A: Multiple Choice Questions (10 Marks)\n1. Choose the correct answer: (a) Option A  (b) Option B  (c) Option C\n2. Fill in the blank with the appropriate term.\n3. Match Column A with corresponding item in Column B.\n4. True or False statement evaluation.\n5. Identify the diagram representation.\n\n### Section B: Short Conceptual Questions (20 Marks — Attempt any 4)\n1. Define the fundamental concept in 2 lines.\n2. State three key characteristics of the topic.\n3. Differentiate between primary and secondary elements.\n4. Give two real-world examples from everyday life.\n5. Explain the importance of this topic in daily routine.\n\n### Section C: Descriptive / Detailed Questions (20 Marks)\n1. Describe the complete procedure with a neat labeled diagram. (10 marks)\n2. Explain the benefits and applications for school and society. (10 marks)`,
  },
  {
    id: 'assembly_speech',
    title: 'Morning Assembly Speech',
    titleUr: 'صبح کی اسمبلی کی تقریر',
    category: 'Moral/Culture',
    icon: '🎙',
    generatePrompt: () =>
      `Write a 2-minute motivational Morning Assembly Speech for primary school students at GPS Chambai Kohat. Topic: "The Value of Discipline, Truthfulness, and Cleanliness in Islam and Daily Life". Provide text in both Urdu and English so students can easily deliver it in the morning assembly.`,
    sampleResponse: (_cls, _sub, model) =>
      `# Morning Assembly Speech (صبح کی اسمبلی کی تقریر)\n*Generated with ${model}*\n**Topic: Discipline, Truthfulness & Cleanliness (نظم و ضبط، سچائی اور صفائی)**\n\n**English Speech:**\n"Respected Head Teacher, worthy teachers, and dear schoolfellows, Assalam-o-Alaikum!\nToday, I stand before you to speak on the noble virtues of Cleanliness and Discipline. Our Holy Prophet Muhammad (PBUH) taught us that cleanliness is half of our faith. When we keep our school, our uniform, and our bags neat and clean, our minds stay fresh and eager to learn. Discipline is the bridge between goals and success. Let us pledge today that we will never litter our school ground, respect our teachers, arrive on time, and always speak the truth. Thank you! Pakistan Zindabad!"\n\n**اردو تقریر:**\n"محترم صدرِ مجلس، معزز اساتذہ کرام اور میرے عزیز ہم مکتب بھائیو! السلام علیکم!\nآج مجھے جس عنوان پر لب کشائی کا موقع ملا ہے وہ ہے 'صفائی، سچائی اور نظم و ضبط'۔ ہمارے پیارے نبی کریم ﷺ کا فرمانِ عالی شان ہے کہ 'صفائی نصف ایمان ہے'۔ جب ہم اپنا اسکول، اپنا بستہ اور اپنا لباس صاف رکھتے ہیں تو ہمارا دل اور دماغ علم کی روشنی کے لیے تیار ہو جاتا ہے۔ نظم و ضبط ہی انسان کو زندگی میں کامیابی کی بلندیوں تک لے جاتا ہے۔ آئیے مل کر عہد کریں کہ ہم اپنے اسکول کو صاف ستھرا رکھیں گے، وقت کی پابندی کریں گے اور ہمیشہ سچ بولیں گے۔ شکریہ! پاکستان زندہ باد!"`,
  },
  {
    id: 'ptc_resolution',
    title: 'PTC Meeting Agenda & Resolution',
    titleUr: 'پی ٹی سی قرارداد و ایجنڈا',
    category: 'Office',
    icon: '🏫',
    generatePrompt: () =>
      `Draft an official formal resolution (قرارداد) for the Parent Teacher Council (PTC) meeting at Govt. Primary School Chambai Kohat (EMIS: 16454). Agenda: Approval of Petty Repair Grant & Classroom Consumable Grant expenditures, school whitewash, drinking water facility maintenance, and student cleanliness campaign. Write in official departmental administrative format.`,
    sampleResponse: (_cls, _sub, model) =>
      `# Office of the Parent Teacher Council (PTC)\n**Govt. Primary School Chambai Kohat (EMIS: 16454)**\n*Administrative draft generated by ${model}*\n\n**Meeting Resolution No. PTC/2026-08**\nToday on the scheduled date, an official general body meeting of the Parent Teacher Council was held under the chairmanship of the Head Teacher / Chairman PTC.\n\n**Agenda & Unanimous Approvals:**\n1. Approval of Petty Repair Grant for classroom door hinges, blackboard repainting, and window safety.\n2. Procurement of classroom consumables (chalk, board markers, duster, cleaning materials) through transparent purchase committee.\n3. Inspection and servicing of clean student drinking water filtration taps.\n4. Cleanliness and 100% student enrolment drive in Chambai village.\n\n**Signatures:**\n- Chairman PTC / Head Teacher\n- Secretary PTC\n- Executive Parent Members (1 to 4)`,
  },
  {
    id: 'report_remarks',
    title: 'Student Report Card Remarks',
    titleUr: 'طلبہ کے تعلیمی ریمارکس',
    category: 'Assessment',
    icon: '🌟',
    generatePrompt: (cls) =>
      `Provide 10 encouraging, constructive teacher remarks in both English and Urdu for primary students in ${cls} to be printed on their Semester Exam Report Cards. Include remarks for: Outstanding high achievers, good average students, and students needing improvement in handwriting and reading.`,
    sampleResponse: (_cls, _sub, model) =>
      `# Teacher Remarks for Student Report Cards (${model})\n\n1. **Excellent (ممتاز کارکردگی):**\n   - EN: Outstanding academic performance and exemplary discipline throughout the semester. Keep it up!\n   - UR: شاندار تعلیمی کارکردگی اور مثالی نظم و ضبط۔ شاباش!\n\n2. **Very Good (بہت خوب):**\n   - EN: Active classroom participation and consistent progress in all subjects. Well done!\n   - UR: جماعت میں بہترین شرکت اور تمام مضامین میں مسلسل محنت۔\n\n3. **Good Effort (تسلی بخش):**\n   - EN: Good understanding of basic concepts. More focus on handwriting will yield top grades.\n   - UR: بنیادی تصورات پر اچھی گرفت۔ خوشخطی پر مزید توجہ دیں۔\n\n4. **Needs Improvement (مزید محنت کی ضرورت):**\n   - EN: Capable student who needs regular daily homework revision and parental supervision.\n   - UR: بچہ ذہین ہے مگر گھر پر روزانہ ہوم ورک کی دہرائی اور والدین کی توجہ درکار ہے۔`,
  },
];

export const AiPortalSubmodule: React.FC<AiPortalSubmoduleProps> = ({ onBack, lang }) => {
  const [selectedModel, setSelectedModel] = useState<AiModelItem>(AI_MODELS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate>(PROMPT_TEMPLATES[0]);
  const [selectedClass, setSelectedClass] = useState<string>('Class 5');
  const [selectedSubject, setSelectedSubject] = useState<string>('General Science');
  const [customPrompt, setCustomPrompt] = useState<string>(() =>
    PROMPT_TEMPLATES[0].generatePrompt('Class 5', 'General Science')
  );
  const [generatedOutput, setGeneratedOutput] = useState<string>(() =>
    PROMPT_TEMPLATES[0].sampleResponse('Class 5', 'General Science', AI_MODELS[0].name)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'launch'>('generate');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectTemplate = (tmpl: PromptTemplate) => {
    setSelectedTemplate(tmpl);
    const p = tmpl.generatePrompt(selectedClass, selectedSubject);
    setCustomPrompt(p);
    setGeneratedOutput(tmpl.sampleResponse(selectedClass, selectedSubject, selectedModel.name));
  };

  const handleClassSubjectChange = (newCls: string, newSub: string) => {
    setSelectedClass(newCls);
    setSelectedSubject(newSub);
    const p = selectedTemplate.generatePrompt(newCls, newSub);
    setCustomPrompt(p);
    setGeneratedOutput(selectedTemplate.sampleResponse(newCls, newSub, selectedModel.name));
  };

  const handleSelectModel = (model: AiModelItem) => {
    setSelectedModel(model);
    setGeneratedOutput(selectedTemplate.sampleResponse(selectedClass, selectedSubject, model.name));
    showToast(`Switched to ${model.name} (${model.provider})`);
  };

  const handleGenerateInApp = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const response = selectedTemplate.sampleResponse(selectedClass, selectedSubject, selectedModel.name);
      setGeneratedOutput(response);
      setIsGenerating(false);
      showToast(`Generated successfully with ${selectedModel.name}!`);
    }, 700);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(customPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
    showToast('Prompt copied to clipboard!');
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2500);
    showToast('Output text copied!');
  };

  const handleLaunchExternal = (model: AiModelItem) => {
    navigator.clipboard.writeText(customPrompt);
    setCopiedPrompt(true);
    showToast(`Prompt copied! Opening ${model.name}...`);
    window.open(model.url, '_blank');
  };

  const handlePrintOutput = () => {
    const title = `AI Generated Resource — ${selectedTemplate.title} (${selectedModel.name})`;
    const bodyHtml = `
      <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #cbd5e1;">
        <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">
          AI Teaching Assistant Output • Model: ${selectedModel.name} (${selectedModel.provider})
        </div>
        <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">
          ${selectedTemplate.title} — ${selectedClass} (${selectedSubject})
        </div>
      </div>
      <div style="white-space: pre-wrap; font-size: 13px; line-height: 1.8; color: #1e293b; font-family: 'Plus Jakarta Sans', 'Jameel Noori Nastaleeq', sans-serif;">
        ${generatedOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    `;

    printHtmlDocument(title, bodyHtml, 'portrait', true);
  };

  const handleSavePdfOutput = () => {
    const title = `AI Generated Resource — ${selectedTemplate.title} (${selectedModel.name})`;
    const bodyHtml = `
      <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #cbd5e1;">
        <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">
          AI Teaching Assistant Output • Model: ${selectedModel.name} (${selectedModel.provider})
        </div>
        <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">
          ${selectedTemplate.title} — ${selectedClass} (${selectedSubject})
        </div>
      </div>
      <div style="white-space: pre-wrap; font-size: 13px; line-height: 1.8; color: #1e293b; font-family: 'Plus Jakarta Sans', 'Jameel Noori Nastaleeq', sans-serif;">
        ${generatedOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    `;

    const res = exportAndSaveRealPdf(title, bodyHtml, {
      folderSubPath: 'PDF & Print Records/Export PDF',
      moduleSource: 'AI Teaching Generator',
    });
    showToast(`Saved PDF (${res.filename}) to ${res.folderPath}`);
  };

  const ActiveLogo = selectedModel.LogoComponent;

  return (
    <div className="p-3.5 space-y-4 pb-16 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-800 via-indigo-800 to-sky-800 text-white rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 transition-colors"
          >
            <ArrowLeft size={19} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-white/25 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <img
              src="/assets/aistudio/image_035.svg"
              alt="AI Models Logo (Image 035)"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Sparkles size={22} className="text-amber-300" />
              <span>
                {lang === 'ur'
                  ? 'مصنوعی ذہانت (AI) ماڈلز و تعلیمی جنریٹر'
                  : 'AI Models & Teaching Generator'}
              </span>
            </h2>
            <p className="text-xs text-violet-100 font-medium">
              Select model to work in app or launch external portal
            </p>
          </div>
        </div>

        {/* Global Print & PDF Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handlePrintOutput}
            className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            title="Print AI Resource"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>
          <button
            onClick={handleSavePdfOutput}
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            title="Save as PDF or HTML"
          >
            <Download size={15} />
            <span>Save PDF</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Select AI Model Section (with Original Official SVG Logos) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Cpu size={15} className="text-violet-600" />
            <span>Select AI Model (Click to Work in App or Launch)</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            6 Official AI Models Included
          </span>
        </div>

        {/* 6 AI Model Cards with Authentic Original Logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {AI_MODELS.map((model) => {
            const isSelected = selectedModel.id === model.id;
            const Logo = model.LogoComponent;
            return (
              <div
                key={model.id}
                onClick={() => handleSelectModel(model)}
                className={`relative rounded-3xl p-3 border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-violet-600 ring-2 ring-violet-500/40 shadow-md scale-[1.02]'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs overflow-hidden">
                      <Logo size={36} />
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-slate-900">{model.name}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold line-clamp-2 mt-0.5 leading-tight">
                    {model.bestFor}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400">
                    {model.provider}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchExternal(model);
                    }}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title={`Launch ${model.name} in external tab`}
                  >
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Model Focus Bar & Work Mode Switcher */}
      <div className="bg-slate-900 text-white rounded-3xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0">
            <ActiveLogo size={38} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{selectedModel.name}</span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md">
                Active in App
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">
              {selectedModel.description}
            </p>
          </div>
        </div>

        {/* Action Buttons: Work in App or Launch */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={handleGenerateInApp}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
            <span>Generate with {selectedModel.name}</span>
          </button>

          <button
            onClick={() => handleLaunchExternal(selectedModel)}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
            title={`Open official ${selectedModel.name} website in new tab with copied prompt`}
          >
            <ExternalLink size={13} />
            <span>Launch Web</span>
          </button>
        </div>
      </div>

      {/* Primary Teaching Prompt Generator & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Templates & Selectors */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Lightbulb size={15} className="text-amber-500" />
              <span>Teaching Prompt Templates</span>
            </h4>

            {/* Template Buttons */}
            <div className="space-y-1.5">
              {PROMPT_TEMPLATES.map((tmpl) => {
                const isActive = selectedTemplate.id === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-violet-50 border-violet-300 text-violet-950 font-black shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{tmpl.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs truncate">{tmpl.title}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          {tmpl.titleUr}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {tmpl.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Class & Subject Selector */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-600 mb-0.5">
                  Target Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassSubjectChange(e.target.value, selectedSubject)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-bold bg-white outline-none focus:border-violet-600"
                >
                  {OFFICIAL_SIX_CLASSES.map((c) => (
                    <option key={c.id} value={c.displayName}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 mb-0.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={selectedSubject}
                  onChange={(e) => handleClassSubjectChange(selectedClass, e.target.value)}
                  placeholder="e.g., General Science"
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-violet-600"
                />
              </div>
            </div>
          </div>

          {/* Editable Prompt Area */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-violet-600" />
                <span>Prompt for {selectedModel.name}</span>
              </label>

              <button
                type="button"
                onClick={handleCopyPrompt}
                className="text-[10px] font-black text-violet-700 hover:text-violet-900 flex items-center gap-1"
              >
                {copiedPrompt ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 leading-relaxed"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleGenerateInApp}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
                <span>Generate in App</span>
              </button>

              <button
                type="button"
                onClick={() => handleLaunchExternal(selectedModel)}
                className="py-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                title={`Open ${selectedModel.name} web app`}
              >
                <ExternalLink size={13} />
                <span>Launch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Output & Printable Result */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-3 flex flex-col h-full min-h-[480px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden">
                  <ActiveLogo size={28} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    {selectedModel.name} Response
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold">
                    DCTE KP Primary Standard • {selectedClass}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedOutput ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedOutput ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintOutput}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-slate-800"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleSavePdfOutput}
                  className="px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Download size={13} />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Quick Prompt Transformation Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
              <button
                type="button"
                onClick={() => {
                  const urduPrompt = `${customPrompt} \n\nPlease provide complete translation and explanation in Urdu (اردو زبان میں مکمل وضاحت اور سوالات فراہم کریں).`;
                  setCustomPrompt(urduPrompt);
                  handleGenerateInApp();
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-900 border border-slate-200"
              >
                🌐 Translate to Urdu (اردو ترجمہ)
              </button>
              <button
                type="button"
                onClick={() => {
                  const mcqPrompt = `${customPrompt} \n\nAdd 5 multiple-choice questions (MCQs) with correct answer keys for classroom assessment.`;
                  setCustomPrompt(mcqPrompt);
                  handleGenerateInApp();
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-900 border border-slate-200"
              >
                +5 MCQs Assessment
              </button>
              <button
                type="button"
                onClick={() => {
                  const simplePrompt = `${customPrompt} \n\nSimplify the language and use short sentences suitable for young primary school kids.`;
                  setCustomPrompt(simplePrompt);
                  handleGenerateInApp();
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-900 border border-slate-200"
              >
                Simplify for Primary
              </button>
            </div>

            {/* Editable or generated text */}
            <div className="flex-1 bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[500px]">
              {isGenerating ? (
                <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
                  <Sparkles size={20} className="animate-spin text-violet-600" />
                  <span className="font-bold">{selectedModel.name} is generating teaching resource...</span>
                </div>
              ) : (
                generatedOutput
              )}
            </div>

            {/* Footer Notice */}
            <div className="pt-1 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
              <span>GPS Chambai Kohat • Primary Teaching AI Portal</span>
              <button
                type="button"
                onClick={() => handleLaunchExternal(selectedModel)}
                className="text-violet-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>Launch {selectedModel.name} Web</span>
                <ExternalLink size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
