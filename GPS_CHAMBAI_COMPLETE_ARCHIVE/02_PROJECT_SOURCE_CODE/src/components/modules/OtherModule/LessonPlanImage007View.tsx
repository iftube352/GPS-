import React from 'react';
import {
  Printer,
  Download,
  ArrowLeft,
  Edit3,
  Sparkles,
  Clock,
  Target,
  Brain,
  BookOpen,
  Lightbulb,
  CheckSquare,
  Users,
  ClipboardCheck,
  Trophy,
  BookMarked,
  StickyNote,
  FileText,
  Eye,
} from 'lucide-react';
import { LessonPlanItem } from '../../../types';
import { getClassMetaByIdOrName } from '../../../utils/classColors';
import {
  printHtmlDocument,
  executeIframePrint,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
} from '../../../services/printAndFileService';

interface LessonPlanImage007ViewProps {
  plan: LessonPlanItem;
  onBack?: () => void;
  onEdit?: (plan: LessonPlanItem) => void;
  lang?: 'en' | 'ur';
}

/**
 * Generates standalone HTML matching Image 007 for standard browser print & PDF export
 */
export function generateImage007PrintHtml(plan: LessonPlanItem): string {
  const clsMeta = getClassMetaByIdOrName(plan.classId || plan.className);
  const teacher = plan.teacherName || 'Muhammad Ismail (PSHT)';
  const subject = plan.subject || 'General Science';
  const topic = plan.topic || 'Solar System & Planets';
  const date = plan.date || new Date().toISOString().split('T')[0];
  const duration = plan.duration || '40 Minutes';

  const knowledge =
    plan.knowledge ||
    (plan.learningObjectives ? plan.learningObjectives.split('.')[0] : 'Identify key concepts and definitions.');
  const skills =
    plan.skills ||
    (plan.learningObjectives && plan.learningObjectives.split('.').length > 1
      ? plan.learningObjectives.split('.')[1]
      : 'Draw diagrams, explain processes, and observe models.');
  const attitude =
    plan.attitude ||
    'Develop curiosity, scientific inquiry, teamwork, and classroom discipline.';

  const prevKnowledge =
    plan.previousKnowledge ||
    'Students already know about natural light, daytime, nighttime, and basic celestial objects in the sky.';

  const aids = plan.teachingAidsList || {
    books: true,
    charts: true,
    whiteboard: true,
    multimedia: false,
    others: plan.teachingMaterials || '',
  };

  const intro =
    plan.introduction ||
    'Ask warm-up questions about the morning sky, show physical model chart, connect topic with daily experiences.';

  const steps =
    plan.steps && plan.steps.length > 0
      ? plan.steps
      : [
          {
            stepNumber: 1,
            teacherActivity: 'Introduce topic on whiteboard, write SLOs and key vocabulary.',
            studentActivity: 'Listen attentively, repeat key terms, and take notes.',
            time: '5 min',
          },
          {
            stepNumber: 2,
            teacherActivity: 'Explain main concepts with illustrative charts and textbook examples.',
            studentActivity: 'Observe charts, ask questions, and follow textbook page.',
            time: '15 min',
          },
          {
            stepNumber: 3,
            teacherActivity: 'Facilitate guided practice questions and student board demonstrations.',
            studentActivity: 'Solve questions on rough notebook and demonstrate on board.',
            time: '12 min',
          },
          {
            stepNumber: 4,
            teacherActivity: 'Wrap up lesson, verify student understanding, and assign homework.',
            studentActivity: 'Summarize lesson in own words and write down homework.',
            time: '8 min',
          },
        ];

  const practice =
    plan.practiceActivity ||
    plan.activities ||
    'Students work in pairs to discuss questions and complete exercise table in notebooks.';

  const assessment =
    plan.assessment ||
    'Oral questions during lesson, board demonstration, and notebook exercise evaluation.';

  const conclusion =
    plan.conclusion ||
    'Recap main points: Review key vocabulary, ask 2 quick check questions, link to tomorrow topic.';

  const homework =
    plan.homework ||
    'Read page textbook exercise, answer questions 1 & 2 in notebook, draw diagram.';

  const reflection =
    plan.reflection ||
    plan.remarks ||
    'Students participated enthusiastically; 90% achieved the SLOs. Provide extra worksheet for slow learners.';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Lesson Plan - ${topic}</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <link href="https://cdn.jsdelivr.net/gh/rastikerdar/jameel-noori-nastaleeq@v1.0.2/font-face.css" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: 'Plus Jakarta Sans', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', Arial, sans-serif;
          color: #1e293b;
          background: #ffffff;
        }
        .container {
          border: 3.5px solid #38bdf8;
          border-radius: 28px;
          padding: 16px 20px 10px 20px;
          background: #ffffff;
          position: relative;
          min-height: 275mm;
        }
        /* Top Ribbon */
        .header-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          position: relative;
        }
        .ribbon {
          flex: 1;
          margin: 0 16px;
          background: linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%);
          color: #ffffff;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 2px;
          text-align: center;
          padding: 10px 24px;
          border-radius: 8px;
          position: relative;
          box-shadow: 0 4px 10px rgba(29, 78, 216, 0.25);
          text-transform: uppercase;
        }
        .ribbon:before, .ribbon:after {
          content: "";
          position: absolute;
          top: 6px;
          bottom: 6px;
          width: 20px;
          background: #1e3a8a;
          z-index: -1;
        }
        .ribbon:before { left: -14px; clip-path: polygon(100% 0, 0 50%, 100% 100%); }
        .ribbon:after { right: -14px; clip-path: polygon(0 0, 100% 50%, 0 100%); }

        .section-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #ffffff;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.5px;
          padding: 3.5px 14px;
          border-radius: 9999px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .dotted-line {
          border-bottom: 1.5px dotted #94a3b8;
          min-height: 20px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 2px;
          font-size: 11px;
          font-weight: 600;
          color: #0f172a;
        }
        .box-border {
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          padding: 8px 12px;
          background: #ffffff;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 8px;
        }
        /* Steps Table */
        table.steps-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
        }
        table.steps-table th {
          background: #fff;
          color: #0f172a;
          font-weight: 800;
          font-size: 10px;
          letter-spacing: 0.5px;
          padding: 4px 6px;
          text-transform: uppercase;
          border-bottom: 2px solid #f43f5e;
        }
        table.steps-table td {
          padding: 4px 6px;
          border-bottom: 1.2px dotted #cbd5e1;
          vertical-align: middle;
        }
        .step-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f43f5e;
          color: white;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          margin: 0 auto;
        }
        /* Floral Footer */
        .floral-footer {
          margin-top: 10px;
          text-align: center;
          padding-top: 6px;
          border-top: 1px dashed #cbd5e1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Top Ribbon Banner with Apple & Pencil Cup Graphics -->
        <div class="header-wrap">
          <!-- Stacked books with Apple -->
          <div style="width: 74px; text-align: center;">
            <svg width="68" height="60" viewBox="0 0 100 85" fill="none">
              <!-- Books -->
              <rect x="10" y="55" width="75" height="12" rx="3" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
              <rect x="18" y="42" width="70" height="12" rx="3" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
              <rect x="12" y="29" width="72" height="12" rx="3" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>
              <!-- Apple -->
              <circle cx="50" cy="18" r="14" fill="#ef4444"/>
              <path d="M50 18 Q55 12 50 8" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
              <ellipse cx="54" cy="9" rx="4" ry="2" fill="#22c55e" transform="rotate(-20 54 9)"/>
            </svg>
          </div>

          <!-- Blue Ribbon -->
          <div class="ribbon">
            ★ &nbsp; LESSON PLAN &nbsp; ★
          </div>

          <!-- Pencil Cup -->
          <div style="width: 74px; text-align: center;">
            <svg width="68" height="60" viewBox="0 0 100 85" fill="none">
              <path d="M35 10 L40 45" stroke="#ec4899" stroke-width="6" stroke-linecap="round"/>
              <path d="M50 8 L50 45" stroke="#3b82f6" stroke-width="6" stroke-linecap="round"/>
              <path d="M65 12 L60 45" stroke="#22c55e" stroke-width="6" stroke-linecap="round"/>
              <rect x="30" y="42" width="40" height="38" rx="6" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
              <circle cx="50" cy="60" r="5" fill="#ffffff"/>
              <!-- Sparkles -->
              <polygon points="15,20 18,25 23,26 19,30 20,35 15,32 10,35 11,30 7,26 12,25" fill="#facc15"/>
              <polygon points="85,30 87,33 90,34 87,37 88,40 85,38 82,40 83,37 80,34 83,33" fill="#facc15"/>
            </svg>
          </div>
        </div>

        <!-- Section 1: General Information -->
        <div style="text-align: center; margin-bottom: 2px;">
          <span class="section-pill" style="background: #1976d2;">1. GENERAL INFORMATION</span>
        </div>
        <div class="box-border" style="border-color: #93c5fd; margin-bottom: 8px;">
          <div class="grid-2" style="margin-bottom: 0;">
            <div>
              <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                <span style="font-weight: 800; font-size: 11px; width: 90px;">Teacher Name :</span>
                <span class="dotted-line" style="flex: 1;">${teacher}</span>
              </div>
              <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                <span style="font-weight: 800; font-size: 11px; width: 90px;">Subject :</span>
                <span class="dotted-line" style="flex: 1;">${subject}</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <span style="font-weight: 800; font-size: 11px; width: 90px;">Topic :</span>
                <span class="dotted-line" style="flex: 1; font-weight: 800; color: #1e40af;">${topic}</span>
              </div>
            </div>
            <div>
              <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                <span style="font-weight: 800; font-size: 11px; width: 90px;">Class / Grade :</span>
                <span class="dotted-line" style="flex: 1; font-weight: 800;">${clsMeta.displayName} (${clsMeta.urduName})</span>
              </div>
              <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                <span style="font-weight: 800; font-size: 11px; width: 90px;">Date :</span>
                <span class="dotted-line" style="flex: 1;">${date}</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <span style="font-weight: 800; font-size: 11px; width: 90px;">Duration :</span>
                <span class="dotted-line" style="flex: 1;">${duration}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Row: Section 2 (Learning Objectives) & Section 3 (Previous Knowledge) -->
        <div class="grid-2">
          <!-- 2. Learning Objectives -->
          <div class="box-border" style="border-color: #86efac;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span class="section-pill" style="background: #2e7d32; margin-bottom: 0;">🎯 2. LEARNING OBJECTIVES</span>
            </div>
            <div style="font-size: 10px; color: #475569; font-weight: 700; margin-bottom: 6px;">
              By the end of the lesson, students will be able to:
            </div>
            <div style="display: flex; gap: 6px; margin-bottom: 4px; align-items: flex-end;">
              <span style="background: #4ade80; color: #14532d; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">KNOWLEDGE</span>
              <span class="dotted-line" style="flex: 1;">${knowledge}</span>
            </div>
            <div style="display: flex; gap: 6px; margin-bottom: 4px; align-items: flex-end;">
              <span style="background: #60a5fa; color: #1e3a8a; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">SKILLS</span>
              <span class="dotted-line" style="flex: 1;">${skills}</span>
            </div>
            <div style="display: flex; gap: 6px; align-items: flex-end;">
              <span style="background: #f472b6; color: #831843; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">ATTITUDE</span>
              <span class="dotted-line" style="flex: 1;">${attitude}</span>
            </div>
          </div>

          <!-- 3. Previous Knowledge -->
          <div class="box-border" style="border-color: #d8b4fe;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span class="section-pill" style="background: #6a1b9a; margin-bottom: 0;">🧠 3. PREVIOUS KNOWLEDGE</span>
            </div>
            <div style="font-size: 10px; color: #475569; font-weight: 700; margin-bottom: 6px;">
              What students already know related to the topic:
            </div>
            <div class="dotted-line" style="min-height: 22px;">${prevKnowledge}</div>
            <div class="dotted-line" style="min-height: 22px;">Basic concepts and daily life observations recalled through interactive questioning.</div>
            <div class="dotted-line" style="min-height: 22px;">Students can relate familiar examples from surroundings.</div>
          </div>
        </div>

        <!-- Row: Section 4 (Teaching Aids) & Section 5 (Introduction) -->
        <div class="grid-2">
          <!-- 4. Teaching Aids -->
          <div class="box-border" style="border-color: #fdba74;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span class="section-pill" style="background: #e65100; margin-bottom: 0;">📚 4. TEACHING AIDS / MATERIALS</span>
            </div>
            <div style="font-size: 10.5px; font-weight: 700; line-height: 1.6; color: #334155;">
              <div>• ${aids.books ? '☑' : '☐'} Books / Textbooks (KP Textbook Board)</div>
              <div>• ${aids.charts ? '☑' : '☐'} Charts / Visual Flashcards / Images</div>
              <div>• ${aids.whiteboard ? '☑' : '☐'} Whiteboard / Colored Markers</div>
              <div>• ${aids.multimedia ? '☑' : '☐'} Multimedia (if any) / Model Objects</div>
              <div style="display: flex; gap: 4px; align-items: flex-end;">
                <span>• Others:</span>
                <span class="dotted-line" style="flex: 1;">${aids.others || 'Activity worksheets, pointer, realia'}</span>
              </div>
            </div>
          </div>

          <!-- 5. Introduction -->
          <div class="box-border" style="border-color: #67e8f9;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span class="section-pill" style="background: #00838f; margin-bottom: 0;">💡 5. INTRODUCTION / SET INDUCTION</span>
              <span style="background: #06b6d4; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">🕒 5-10 min</span>
            </div>
            <div style="font-size: 10px; font-weight: 700; line-height: 1.5; color: #334155;">
              <div>• Ask questions to engage students.</div>
              <div>• Show picture / chart / short story.</div>
              <div>• Connect the topic with real life.</div>
            </div>
            <div class="dotted-line" style="min-height: 20px; margin-top: 4px;">${intro}</div>
          </div>
        </div>

        <!-- Section 6: Presentation / Teaching Steps Table -->
        <div style="margin-bottom: 8px;">
          <div style="text-align: center; margin-bottom: 4px;">
            <span class="section-pill" style="background: #d81b60;">6. PRESENTATION / TEACHING STEPS</span>
          </div>
          <div class="box-border" style="border-color: #fda4af; padding: 6px 10px;">
            <table class="steps-table">
              <thead>
                <tr>
                  <th style="width: 8%; text-align: center;">STEP</th>
                  <th style="width: 48%; text-align: left;">TEACHER ACTIVITY</th>
                  <th style="width: 34%; text-align: left;">STUDENT ACTIVITY</th>
                  <th style="width: 10%; text-align: center;">TIME</th>
                </tr>
              </thead>
              <tbody>
                ${steps
                  .map(
                    (s, sIdx) => `
                  <tr>
                    <td style="text-align: center;">
                      <div class="step-circle">${s.stepNumber ?? s.step ?? sIdx + 1}</div>
                    </td>
                    <td>${s.teacherActivity}</td>
                    <td>${s.studentActivity}</td>
                    <td style="text-align: center; font-weight: 800; color: #0284c7;">${s.time}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 7: Practice / Activity -->
        <div style="margin-bottom: 6px;">
          <div class="box-border" style="border-color: #93c5fd; padding: 6px 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="section-pill" style="background: #1565c0; margin-bottom: 0; shrink-0;">👥 7. PRACTICE / ACTIVITY</span>
              <div style="font-size: 9.5px; font-weight: 700; color: #475569; display: flex; gap: 10px;">
                <span>• Group work / Pair work</span>
                <span>• Worksheet / Exercise</span>
                <span>• Hands-on activity</span>
              </div>
            </div>
            <div class="dotted-line" style="min-height: 20px; margin-top: 2px;">${practice}</div>
          </div>
        </div>

        <!-- Section 8: Assessment / Evaluation -->
        <div style="margin-bottom: 6px;">
          <div class="box-border" style="border-color: #86efac; padding: 6px 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="section-pill" style="background: #2e7d32; margin-bottom: 0; shrink-0;">📋 8. ASSESSMENT / EVALUATION</span>
              <div style="font-size: 9.5px; font-weight: 700; color: #475569; display: flex; gap: 10px;">
                <span>• Oral Questions</span>
                <span>• Worksheet / Quiz</span>
                <span>• Observation</span>
              </div>
            </div>
            <div class="dotted-line" style="min-height: 20px; margin-top: 2px;">${assessment}</div>
          </div>
        </div>

        <!-- Section 9: Conclusion / Recap -->
        <div style="margin-bottom: 6px;">
          <div class="box-border" style="border-color: #fdba74; padding: 6px 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="section-pill" style="background: #e65100; margin-bottom: 0; shrink-0;">🏆 9. CONCLUSION / RECAP</span>
              <div style="font-size: 9.5px; font-weight: 700; color: #475569; display: flex; gap: 10px;">
                <span>• Summarize key points</span>
                <span>• Ask review questions</span>
                <span>• Connect to next lesson</span>
              </div>
            </div>
            <div class="dotted-line" style="min-height: 20px; margin-top: 2px;">${conclusion}</div>
          </div>
        </div>

        <!-- Section 10: Homework / Assignment -->
        <div style="margin-bottom: 6px;">
          <div class="box-border" style="border-color: #d8b4fe; padding: 6px 12px;">
            <span class="section-pill" style="background: #512da8; margin-bottom: 2px;">📝 10. HOMEWORK / ASSIGNMENT</span>
            <div class="dotted-line" style="min-height: 20px;">${homework}</div>
          </div>
        </div>

        <!-- Section 11: Reflection (Teacher Notes) -->
        <div style="margin-bottom: 6px;">
          <div class="box-border" style="border-color: #fde047; padding: 6px 12px;">
            <span class="section-pill" style="background: #fbc02d; color: #713f12; margin-bottom: 2px;">📋 11. REFLECTION (TEACHER NOTES)</span>
            <div class="dotted-line" style="min-height: 20px;">${reflection}</div>
          </div>
        </div>

        <!-- Bottom Floral Meadow Illustration -->
        <div class="floral-footer">
          <svg width="100%" height="34" viewBox="0 0 600 35" fill="none" preserveAspectRatio="none">
            <!-- Grass and Leaves -->
            <path d="M0,35 Q30,22 60,35 Q90,20 120,35 Q150,22 180,35 Q210,20 240,35 Q270,22 300,35 Q330,20 360,35 Q390,22 420,35 Q450,20 480,35 Q510,22 540,35 Q570,20 600,35 L600,35 L0,35 Z" fill="#86efac"/>
            <path d="M10,35 L12,20 M25,35 L28,18 M80,35 L78,20 M140,35 L142,16 M200,35 L202,18 M260,35 L258,16 M320,35 L322,18 M380,35 L378,16 M440,35 L442,18 M500,35 L498,16 M560,35 L562,18" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
            
            <!-- Flowers -->
            <circle cx="40" cy="18" r="6" fill="#f43f5e"/><circle cx="40" cy="18" r="2.5" fill="#fef08a"/>
            <circle cx="100" cy="16" r="5" fill="#3b82f6"/><circle cx="100" cy="16" r="2" fill="#ffffff"/>
            <circle cx="160" cy="17" r="6" fill="#ec4899"/><circle cx="160" cy="17" r="2.5" fill="#fef08a"/>
            <circle cx="220" cy="15" r="5" fill="#eab308"/><circle cx="220" cy="15" r="2" fill="#78350f"/>
            <circle cx="280" cy="18" r="6" fill="#a855f7"/><circle cx="280" cy="18" r="2.5" fill="#ffffff"/>
            <circle cx="340" cy="16" r="5" fill="#ef4444"/><circle cx="340" cy="16" r="2" fill="#fef08a"/>
            <circle cx="400" cy="17" r="6" fill="#06b6d4"/><circle cx="400" cy="17" r="2.5" fill="#ffffff"/>
            <circle cx="460" cy="15" r="5" fill="#ec4899"/><circle cx="460" cy="15" r="2" fill="#fef08a"/>
            <circle cx="520" cy="17" r="6" fill="#f59e0b"/><circle cx="520" cy="17" r="2.5" fill="#78350f"/>
            <circle cx="575" cy="18" r="5" fill="#3b82f6"/><circle cx="575" cy="18" r="2" fill="#ffffff"/>

            <!-- Butterflies -->
            <path d="M70,8 Q73,4 77,8 Q73,12 70,8 Z M70,8 Q67,4 63,8 Q67,12 70,8 Z" fill="#ec4899"/>
            <path d="M370,7 Q373,3 377,7 Q373,11 370,7 Z M370,7 Q367,3 363,7 Q367,11 370,7 Z" fill="#eab308"/>
            <path d="M490,9 Q493,5 497,9 Q493,13 490,9 Z M490,9 Q487,5 483,9 Q487,13 490,9 Z" fill="#3b82f6"/>
          </svg>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Interactive React component replicating the exact layout of image 007
 */
export const LessonPlanImage007View: React.FC<LessonPlanImage007ViewProps> = ({
  plan,
  onBack,
  onEdit,
  lang,
}) => {
  const clsMeta = getClassMetaByIdOrName(plan.classId || plan.className);
  const teacher = plan.teacherName || 'Muhammad Ismail (PSHT)';
  const subject = plan.subject || 'General Science';
  const topic = plan.topic || 'Solar System & Planets';
  const date = plan.date || new Date().toISOString().split('T')[0];
  const duration = plan.duration || '40 Minutes';

  const knowledge =
    plan.knowledge ||
    (plan.learningObjectives ? plan.learningObjectives.split('.')[0] : 'Identify key concepts and definitions.');
  const skills =
    plan.skills ||
    (plan.learningObjectives && plan.learningObjectives.split('.').length > 1
      ? plan.learningObjectives.split('.')[1]
      : 'Draw diagrams, explain processes, and observe models.');
  const attitude =
    plan.attitude ||
    'Develop curiosity, scientific inquiry, teamwork, and classroom discipline.';

  const prevKnowledge =
    plan.previousKnowledge ||
    'Students already know about natural light, daytime, nighttime, and basic celestial objects in the sky.';

  const aids = plan.teachingAidsList || {
    books: true,
    charts: true,
    whiteboard: true,
    multimedia: false,
    others: plan.teachingMaterials || '',
  };

  const intro =
    plan.introduction ||
    'Ask warm-up questions about the morning sky, show physical model chart, connect topic with daily experiences.';

  const steps =
    plan.steps && plan.steps.length > 0
      ? plan.steps
      : [
          {
            stepNumber: 1,
            teacherActivity: 'Introduce topic on whiteboard, write SLOs and key vocabulary.',
            studentActivity: 'Listen attentively, repeat key terms, and take notes.',
            time: '5 min',
          },
          {
            stepNumber: 2,
            teacherActivity: 'Explain main concepts with illustrative charts and textbook examples.',
            studentActivity: 'Observe charts, ask questions, and follow textbook page.',
            time: '15 min',
          },
          {
            stepNumber: 3,
            teacherActivity: 'Facilitate guided practice questions and student board demonstrations.',
            studentActivity: 'Solve questions on rough notebook and demonstrate on board.',
            time: '12 min',
          },
          {
            stepNumber: 4,
            teacherActivity: 'Wrap up lesson, verify student understanding, and assign homework.',
            studentActivity: 'Summarize lesson in own words and write down homework.',
            time: '8 min',
          },
        ];

  const practice =
    plan.practiceActivity ||
    plan.activities ||
    'Students work in pairs to discuss questions and complete exercise table in notebooks.';

  const assessment =
    plan.assessment ||
    'Oral questions during lesson, board demonstration, and notebook exercise evaluation.';

  const conclusion =
    plan.conclusion ||
    'Recap main points: Review key vocabulary, ask 2 quick check questions, link to tomorrow topic.';

  const homework =
    plan.homework ||
    'Read page textbook exercise, answer questions 1 & 2 in notebook, draw diagram.';

  const reflection =
    plan.reflection ||
    plan.remarks ||
    'Students participated enthusiastically; 90% achieved the SLOs. Provide extra worksheet for slow learners.';

  const handlePrint = () => {
    const html = generateImage007PrintHtml(plan);
    printHtmlDocument(
      `Lesson Plan Image 007 — ${topic} (${clsMeta.displayName})`,
      html,
      'portrait',
      false
    );
  };

  const handleDirectPrint = () => {
    const html = generateImage007PrintHtml(plan);
    executeIframePrint(html);
  };

  const handleSavePdf = async () => {
    const html = generateImage007PrintHtml(plan);
    await exportAndSaveRealPdf(
      `Lesson Plan Image 007 — ${topic} (${clsMeta.displayName})`,
      html,
      [],
      `Lesson_Plan_${topic.replace(/\s+/g, '_')}.pdf`,
      'Lesson Plans/PDF Lesson Plans'
    );
  };

  const handleSaveDoc = async () => {
    const html = generateImage007PrintHtml(plan);
    await exportAndSaveWordDoc(
      `Lesson Plan Image 007 — ${topic} (${clsMeta.displayName})`,
      html,
      `Lesson_Plan_${topic.replace(/\s+/g, '_')}.doc`,
      'Lesson Plans/Doc Lesson Plans'
    );
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-xs font-bold transition-all"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}
          <span className="text-xs font-black text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800">
            Image 007 Page Layout
          </span>
          <span className="text-xs text-slate-300 font-semibold hidden sm:inline">
            {clsMeta.displayName} • {subject}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onEdit && (
            <button
              onClick={() => onEdit(plan)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Edit3 size={14} className="text-amber-400" />
              <span>Edit Details</span>
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Eye size={14} />
            <span>Print Preview</span>
          </button>
          <button
            onClick={handleDirectPrint}
            className="px-3 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Printer size={14} />
            <span>Direct Print</span>
          </button>
          <button
            onClick={handleSavePdf}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Download size={14} />
            <span>Save PDF</span>
          </button>
          <button
            onClick={handleSaveDoc}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <FileText size={14} />
            <span>Save DOC</span>
          </button>
        </div>
      </div>

      {/* Main Image 007 Bounded Layout */}
      <div className="bg-white rounded-[26px] p-4 sm:p-6 border-[3.5px] border-sky-300 shadow-xl space-y-4 text-slate-800 relative">
        {/* Top Header Ribbon & Cute Graphics */}
        <div className="flex items-center justify-between gap-2 relative pt-1">
          {/* Left Graphic: Books Stack with Apple */}
          <div className="w-14 sm:w-20 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 85" className="w-14 h-12 sm:w-20 sm:h-16 drop-shadow-sm">
              <rect x="10" y="55" width="75" height="12" rx="3" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
              <rect x="18" y="42" width="70" height="12" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
              <rect x="12" y="29" width="72" height="12" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
              <circle cx="50" cy="18" r="14" fill="#ef4444" />
              <path d="M50 18 Q55 12 50 8" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="54" cy="9" rx="4" ry="2" fill="#22c55e" transform="rotate(-20 54 9)" />
            </svg>
          </div>

          {/* Central Blue Ribbon */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              {/* Swallowtail ends */}
              <div
                className="absolute -left-3 top-1 bottom-1 w-5 bg-blue-900 -z-10"
                style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}
              />
              <div
                className="absolute -right-3 top-1 bottom-1 w-5 bg-blue-900 -z-10"
                style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
              />
              <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white font-black tracking-widest text-center py-2 sm:py-2.5 px-4 rounded-md shadow-md text-base sm:text-2xl uppercase border-y border-blue-400">
                ★ &nbsp; LESSON PLAN &nbsp; ★
              </div>
            </div>
          </div>

          {/* Right Graphic: Pencil Cup with Stars */}
          <div className="w-14 sm:w-20 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 85" className="w-14 h-12 sm:w-20 sm:h-16 drop-shadow-sm">
              <path d="M35 10 L40 45" stroke="#ec4899" strokeWidth="6" strokeLinecap="round" />
              <path d="M50 8 L50 45" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <path d="M65 12 L60 45" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
              <rect x="30" y="42" width="40" height="38" rx="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
              <circle cx="50" cy="60" r="5" fill="#ffffff" />
              <polygon points="15,20 18,25 23,26 19,30 20,35 15,32 10,35 11,30 7,26 12,25" fill="#facc15" />
              <polygon points="85,30 87,33 90,34 87,37 88,40 85,38 82,40 83,37 80,34 83,33" fill="#facc15" />
            </svg>
          </div>
        </div>

        {/* 1. GENERAL INFORMATION */}
        <div className="space-y-1">
          <div className="text-center">
            <span className="inline-block bg-[#1976D2] text-white text-[11px] font-black uppercase tracking-wider px-4 py-0.5 rounded-full shadow-xs">
              1. GENERAL INFORMATION
            </span>
          </div>
          <div className="border border-sky-300 rounded-2xl p-3 bg-white shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-slate-700 min-w-[95px]">Teacher Name :</span>
                <span className="flex-1 font-bold text-slate-900 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {teacher}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-slate-700 min-w-[95px]">Class / Grade :</span>
                <span className="flex-1 font-bold text-slate-900 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {clsMeta.displayName} ({clsMeta.urduName})
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-slate-700 min-w-[95px]">Subject :</span>
                <span className="flex-1 font-bold text-slate-900 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {subject}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-slate-700 min-w-[95px]">Date :</span>
                <span className="flex-1 font-bold text-slate-900 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {date}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-slate-700 min-w-[95px]">Topic :</span>
                <span className="flex-1 font-extrabold text-blue-700 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {topic}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-slate-700 min-w-[95px]">Duration :</span>
                <span className="flex-1 font-bold text-slate-900 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {duration}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Row: 2. LEARNING OBJECTIVES & 3. PREVIOUS KNOWLEDGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 2. LEARNING OBJECTIVES */}
          <div className="border border-green-300 rounded-2xl p-3 bg-white shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#2E7D32] text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1">
                <Target size={12} className="text-red-300" />
                <span>2. LEARNING OBJECTIVES</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500">
              By the end of the lesson, students will be able to:
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-baseline gap-2">
                <span className="bg-green-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
                  KNOWLEDGE
                </span>
                <span className="flex-1 text-[11px] font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {knowledge}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
                  SKILLS
                </span>
                <span className="flex-1 text-[11px] font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {skills}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="bg-pink-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
                  ATTITUDE
                </span>
                <span className="flex-1 text-[11px] font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {attitude}
                </span>
              </div>
            </div>
          </div>

          {/* 3. PREVIOUS KNOWLEDGE */}
          <div className="border border-purple-300 rounded-2xl p-3 bg-white shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#6A1B9A] text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1">
                <Brain size={12} className="text-purple-200" />
                <span>3. PREVIOUS KNOWLEDGE</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500">
              What students already know related to the topic:
            </p>

            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-0.5">
                {prevKnowledge}
              </div>
              <div className="text-[11px] font-medium text-slate-700 border-b-2 border-dotted border-slate-300 pb-0.5">
                Basic recall verified through verbal introductory probing.
              </div>
              <div className="text-[11px] font-medium text-slate-700 border-b-2 border-dotted border-slate-300 pb-0.5">
                Students connect past lessons to the current learning objectives.
              </div>
            </div>
          </div>
        </div>

        {/* Row: 4. TEACHING AIDS & 5. INTRODUCTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 4. TEACHING AIDS / MATERIALS */}
          <div className="border border-amber-300 rounded-2xl p-3 bg-white shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#E65100] text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1">
                <BookOpen size={12} />
                <span>4. TEACHING AIDS / MATERIALS</span>
              </span>
            </div>

            <div className="space-y-1 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span className={aids.books ? 'text-emerald-600' : 'text-slate-400'}>
                  {aids.books ? '☑' : '☐'}
                </span>
                <span>Books / Textbook (KP Textbook Board)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={aids.charts ? 'text-emerald-600' : 'text-slate-400'}>
                  {aids.charts ? '☑' : '☐'}
                </span>
                <span>Charts / Images / Visual Flashcards</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={aids.whiteboard ? 'text-emerald-600' : 'text-slate-400'}>
                  {aids.whiteboard ? '☑' : '☐'}
                </span>
                <span>Whiteboard / Markers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={aids.multimedia ? 'text-emerald-600' : 'text-slate-400'}>
                  {aids.multimedia ? '☑' : '☐'}
                </span>
                <span>Multimedia (if any) / 3D Objects</span>
              </div>
              <div className="flex items-baseline gap-1.5 pt-0.5">
                <span className="text-slate-700">• Others:</span>
                <span className="flex-1 font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-0.5">
                  {aids.others || 'Notebooks, stationery, flashcard cutouts'}
                </span>
              </div>
            </div>
          </div>

          {/* 5. INTRODUCTION / SET INDUCTION */}
          <div className="border border-teal-300 rounded-2xl p-3 bg-white shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-[#00838F] text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1">
                <Lightbulb size={12} className="text-amber-300" />
                <span>5. INTRODUCTION / SET INDUCTION</span>
              </span>
              <span className="bg-cyan-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock size={10} /> 5-10 min
              </span>
            </div>

            <div className="text-[10.5px] font-bold text-slate-600 space-y-0.5">
              <p>• Ask questions to engage students.</p>
              <p>• Show picture / video / short story.</p>
              <p>• Connect the topic with real life.</p>
            </div>

            <div className="pt-1 text-xs font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-1">
              {intro}
            </div>
          </div>
        </div>

        {/* 6. PRESENTATION / TEACHING STEPS TABLE */}
        <div className="space-y-1.5">
          <div className="text-center">
            <span className="inline-block bg-[#D81B60] text-white text-[11px] font-black uppercase tracking-wider px-4 py-0.5 rounded-full shadow-xs">
              6. PRESENTATION / TEACHING STEPS
            </span>
          </div>
          <div className="border border-rose-300 rounded-2xl p-2.5 bg-white shadow-2xs overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-rose-400 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-1 px-2 text-center w-12">STEP</th>
                  <th className="py-1 px-2 text-left">TEACHER ACTIVITY</th>
                  <th className="py-1 px-2 text-left">STUDENT ACTIVITY</th>
                  <th className="py-1 px-2 text-center w-16">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {steps.map((step, idx) => (
                  <tr key={step.stepNumber ?? step.step ?? idx} className="hover:bg-rose-50/30">
                    <td className="py-2 px-2 text-center">
                      <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs inline-flex items-center justify-center shadow-xs">
                        {step.stepNumber ?? step.step ?? idx + 1}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-medium text-slate-800 border-b border-dotted border-slate-200">
                      {step.teacherActivity}
                    </td>
                    <td className="py-2 px-2 font-medium text-slate-700 border-b border-dotted border-slate-200">
                      {step.studentActivity}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-sky-600 border-b border-dotted border-slate-200 whitespace-nowrap">
                      {step.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. PRACTICE / ACTIVITY */}
        <div className="border border-blue-300 rounded-2xl p-3 bg-white shadow-2xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="bg-[#1565C0] text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1">
              <Users size={12} />
              <span>7. PRACTICE / ACTIVITY</span>
            </span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <span>• Group work / Pair work</span>
              <span>• Worksheet / Exercise</span>
              <span>• Hands-on activity</span>
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-1">
            {practice}
          </div>
        </div>

        {/* 8. ASSESSMENT / EVALUATION */}
        <div className="border border-green-300 rounded-2xl p-3 bg-white shadow-2xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="bg-[#2E7D32] text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1">
              <ClipboardCheck size={12} />
              <span>8. ASSESSMENT / EVALUATION</span>
            </span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <span>• Oral Questions</span>
              <span>• Worksheet / Quiz</span>
              <span>• Observation</span>
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-1">
            {assessment}
          </div>
        </div>

        {/* 9. CONCLUSION / RECAP */}
        <div className="border border-orange-300 rounded-2xl p-3 bg-white shadow-2xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="bg-[#E65100] text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1">
              <Trophy size={12} className="text-amber-200" />
              <span>9. CONCLUSION / RECAP</span>
            </span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <span>• Summarize key points</span>
              <span>• Ask review questions</span>
              <span>• Connect to next lesson</span>
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-1">
            {conclusion}
          </div>
        </div>

        {/* 10. HOMEWORK / ASSIGNMENT */}
        <div className="border border-purple-300 rounded-2xl p-3 bg-white shadow-2xs space-y-1.5">
          <span className="bg-[#512DA8] text-white text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full inline-flex items-center gap-1">
            <BookMarked size={12} />
            <span>10. HOMEWORK / ASSIGNMENT</span>
          </span>
          <div className="text-xs font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-1">
            {homework}
          </div>
        </div>

        {/* 11. REFLECTION (TEACHER NOTES) */}
        <div className="border border-yellow-300 rounded-2xl p-3 bg-white shadow-2xs space-y-1.5">
          <span className="bg-[#FBC02D] text-yellow-950 text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full inline-flex items-center gap-1">
            <StickyNote size={12} />
            <span>11. REFLECTION (TEACHER NOTES)</span>
          </span>
          <div className="text-xs font-semibold text-slate-800 border-b-2 border-dotted border-slate-300 pb-1">
            {reflection}
          </div>
        </div>

        {/* Bottom Floral Meadow Illustration */}
        <div className="pt-2">
          <svg viewBox="0 0 600 35" className="w-full h-8 sm:h-10 overflow-visible" preserveAspectRatio="none">
            {/* Grass and Meadow */}
            <path
              d="M0,35 Q30,22 60,35 Q90,20 120,35 Q150,22 180,35 Q210,20 240,35 Q270,22 300,35 Q330,20 360,35 Q390,22 420,35 Q450,20 480,35 Q510,22 540,35 Q570,20 600,35 L600,35 L0,35 Z"
              fill="#86efac"
            />
            <path
              d="M10,35 L12,20 M25,35 L28,18 M80,35 L78,20 M140,35 L142,16 M200,35 L202,18 M260,35 L258,16 M320,35 L322,18 M380,35 L378,16 M440,35 L442,18 M500,35 L498,16 M560,35 L562,18"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Colorful Blossom Heads */}
            <circle cx="40" cy="18" r="6" fill="#f43f5e" /><circle cx="40" cy="18" r="2.5" fill="#fef08a" />
            <circle cx="100" cy="16" r="5" fill="#3b82f6" /><circle cx="100" cy="16" r="2" fill="#ffffff" />
            <circle cx="160" cy="17" r="6" fill="#ec4899" /><circle cx="160" cy="17" r="2.5" fill="#fef08a" />
            <circle cx="220" cy="15" r="5" fill="#eab308" /><circle cx="220" cy="15" r="2" fill="#78350f" />
            <circle cx="280" cy="18" r="6" fill="#a855f7" /><circle cx="280" cy="18" r="2.5" fill="#ffffff" />
            <circle cx="340" cy="16" r="5" fill="#ef4444" /><circle cx="340" cy="16" r="2" fill="#fef08a" />
            <circle cx="400" cy="17" r="6" fill="#06b6d4" /><circle cx="400" cy="17" r="2.5" fill="#ffffff" />
            <circle cx="460" cy="15" r="5" fill="#ec4899" /><circle cx="460" cy="15" r="2" fill="#fef08a" />
            <circle cx="520" cy="17" r="6" fill="#f59e0b" /><circle cx="520" cy="17" r="2.5" fill="#78350f" />
            <circle cx="575" cy="18" r="5" fill="#3b82f6" /><circle cx="575" cy="18" r="2" fill="#ffffff" />

            {/* Flying Butterflies */}
            <path d="M70,8 Q73,4 77,8 Q73,12 70,8 Z M70,8 Q67,4 63,8 Q67,12 70,8 Z" fill="#ec4899" />
            <path d="M370,7 Q373,3 377,7 Q373,11 370,7 Z M370,7 Q367,3 363,7 Q367,11 370,7 Z" fill="#eab308" />
            <path d="M490,9 Q493,5 497,9 Q493,13 490,9 Z M490,9 Q487,5 483,9 Q487,13 490,9 Z" fill="#3b82f6" />
          </svg>
        </div>
      </div>
    </div>
  );
};
