/**
 * SSR (School Self Reporting) 2026-27 Multi-Format Export Service
 * Formats: Print Preview, Print All 16 Pages, Real PDF, DOCX (Word), XLSX (Excel), JPG (Canvas Image)
 * Saves into GPS Chambai/SSR/PDF Reports and GPS Chambai/SSR/SSR Documents
 */

import { SsrDataState } from './ssrStorageService';
import {
  executeIframePrint,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
} from './printAndFileService';
import { StorageFolderService } from './storageFolderService';

export const SsrExportService = {
  /**
   * Generates official 16-page formatted HTML matching the uploaded PDF across all 16 pages
   */
  generateSsrHtml(data: SsrDataState): string {
    const headerHtml = `
      <div class="header-bar">
        <div style="font-size: 10px; font-weight: 900; color: #065f46;">Khyber Pakhtunkhwa ESED</div>
        <div class="header-title-center">
          <h1>SCHOOL SELF REPORTING (SSR) 2026-27</h1>
          <h2>${data.schoolName}</h2>
        </div>
        <div style="text-align: right; font-size: 10px; font-weight: 900; color: #065f46;">EMIS: ${data.emisCode}</div>
      </div>
    `;

    const footerHtml = (pageNum: number) => `
      <div class="footer-bar">
        <span>School Self Reporting (SSR) 2026-2027</span>
        <span>${data.schoolName} (EMIS: ${data.emisCode})</span>
        <span>Page ${pageNum} of 16</span>
      </div>
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SCHOOL SELF REPORTING (SSR) 2026-27 — GPS CHAMBAI KOHAT (EMIS: 16454)</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.4;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
      padding: 16px 20px;
      border: 1px solid #cbd5e1;
      margin-bottom: 18px;
      background: #ffffff;
      position: relative;
    }
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #065f46;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .header-title-center {
      text-align: center;
      flex: 1;
    }
    .header-title-center h1 {
      margin: 0;
      font-size: 15px;
      font-weight: 900;
      color: #064e3b;
      letter-spacing: 0.4px;
    }
    .header-title-center h2 {
      margin: 2px 0 0 0;
      font-size: 11.5px;
      font-weight: 800;
      color: #1e293b;
    }
    .section-banner {
      background: #065f46;
      color: #ffffff;
      padding: 5px 10px;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.5px;
      margin: 8px 0;
      text-transform: uppercase;
      border-radius: 2px;
      text-align: center;
    }
    .form-row {
      display: flex;
      margin-bottom: 4px;
      font-size: 10.5px;
      border-bottom: 1px dotted #e2e8f0;
      padding-bottom: 2px;
    }
    .form-label {
      font-weight: 700;
      color: #1e293b;
      min-width: 240px;
    }
    .form-value {
      flex: 1;
      color: #047857;
      font-weight: 800;
      border-bottom: 1px solid #94a3b8;
      padding-left: 6px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 9.5px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #64748b;
      padding: 4px 5px;
      text-align: left;
    }
    table.data-table th {
      background: #f1f5f9;
      font-weight: 800;
      color: #0f172a;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #94a3b8;
      padding-top: 6px;
      margin-top: 14px;
      font-size: 9px;
      color: #64748b;
      font-weight: 700;
    }
    @media print {
      body { background: transparent; }
      .page-break { border: none; margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: SCHOOL BASIC INFORMATION -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 1 — (01) SCHOOL BASIC INFORMATION</div>
    <div class="form-row"><span class="form-label">1. EMIS Code:</span><span class="form-value">${data.emisCode}</span></div>
    <div class="form-row"><span class="form-label">2. School Name:</span><span class="form-value">${data.schoolName}</span></div>
    <div class="form-row"><span class="form-label">3. School Gender (M/F):</span><span class="form-value">${data.gender}</span></div>
    <div class="form-row"><span class="form-label">4. DDO Code:</span><span class="form-value">${data.ddoCode}</span></div>
    <div class="form-row"><span class="form-label">5. School Level:</span><span class="form-value">${data.schoolLevel}</span></div>
    <div class="form-row"><span class="form-label">6. Type for Primary Schools:</span><span class="form-value">${data.primaryType}</span></div>
    <div class="form-row"><span class="form-label">7. Double Shift (Yes/No):</span><span class="form-value">${data.doubleShift} (Level: ${data.doubleShiftLevel} | Funded by: ${data.dssFundedBy})</span></div>
    <div class="form-row"><span class="form-label">10. District / 11. Tehsil:</span><span class="form-value">${data.district} / ${data.tehsil}</span></div>
    <div class="form-row"><span class="form-label">12. Union Council / 13. NC-VC:</span><span class="form-value">${data.unionCouncil} / ${data.ncVcName}</span></div>
    <div class="form-row"><span class="form-label">15. Village / 16. Mohalla / 17. Street:</span><span class="form-value">${data.villageCity} | ${data.mohalla} | ${data.streetName}</span></div>
    <div class="form-row"><span class="form-label">18. Location / 19. Terrain / 21. Zone:</span><span class="form-value">${data.location} | ${data.terrain} | ${data.zone}</span></div>
    <div class="form-row"><span class="form-label">22. NA / 23. PK Constituency:</span><span class="form-value">${data.nationalConstituency} / ${data.provincialConstituency}</span></div>
    <div class="form-row"><span class="form-label">24. GPS Coordinates (X, Y):</span><span class="form-value">X: ${data.xCoordinate} | Y: ${data.yCoordinate}</span></div>
    <div class="form-row"><span class="form-label">25. Head Teacher Mobile / WhatsApp / Tel:</span><span class="form-value">Head Mobile: ${data.headMobileNo} | WhatsApp: ${data.headWhatsAppNo} | Tel: ${data.telephoneNo}</span></div>
    <div class="form-row"><span class="form-label">26. School Official Email:</span><span class="form-value">${data.officialEmail}</span></div>
    <div class="form-row"><span class="form-label">27. Circle (ASDEO) / 28. SDEO Office:</span><span class="form-value">${data.asdeoOffice} / ${data.sdeoOffice}</span></div>
    <div class="form-row"><span class="form-label">29. Cluster School / 30. Distance:</span><span class="form-value">${data.clusterSchool} (${data.distanceFromCluster})</span></div>
    <div class="form-row"><span class="form-label">32. Year of Est. / 33. Construction:</span><span class="form-value">${data.yearOfEstablishment} / ${data.yearOfConstruction}</span></div>
    <div class="form-row"><span class="form-label">36. Tree Plantation / 37. Teacher Guide:</span><span class="form-value">Total Trees: ${data.totalTrees} | Planted: ${data.treesPlantedThisYear} | Guide: ${data.teacherGuideAvailable}</span></div>
    <table class="data-table">
      <thead><tr><th>Utility Name</th><th>Ref #</th><th>Total Bill</th><th>Paid</th><th>Outstanding</th></tr></thead>
      <tbody>
        ${data.utilityBills.map((u) => `<tr><td><strong>${u.name}</strong></td><td>${u.refNo}</td><td>${u.totalBill}</td><td>${u.paid}</td><td>${u.outstanding}</td></tr>`).join('')}
      </tbody>
    </table>
    ${footerHtml(1)}
  </div>

  <!-- PAGE 2: SCHOOL BUILDING INFORMATION -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 2 — (02) SCHOOL BUILDING INFORMATION</div>
    <div class="form-row"><span class="form-label">39. Total Land (Marlas) / Mutated:</span><span class="form-value">${data.totalLandMarlas} Marlas | Mutated: ${data.landMutated}</span></div>
    <div class="form-row"><span class="form-label">Covered / Uncovered Area:</span><span class="form-value">Covered: ${data.coveredAreaMarlas} Marlas | Uncovered: ${data.uncoveredAreaTotal} Marlas (${data.uncoveredRemarks})</span></div>
    <div class="form-row"><span class="form-label">40. Ownership of Building:</span><span class="form-value">${data.buildingOwnership}</span></div>
    <div class="form-row"><span class="form-label">41. Pakka Classrooms / Other Rooms:</span><span class="form-value">Classrooms: ${data.pakkaClassRooms} | Other Rooms: ${data.pakkaOtherRooms}</span></div>
    <div class="form-row"><span class="form-label">Kacha / Fabricated Rooms:</span><span class="form-value">Kacha: ${data.kachaClassRooms}/${data.kachaOtherRooms} | Fabricated: ${data.fabricatedClassRooms}/${data.fabricatedOtherRooms}</span></div>
    <div class="form-row"><span class="form-label">42. Rooms on Floors:</span><span class="form-value">Ground: ${data.roomsGround} | Basement: ${data.roomsBasement} | 1st Floor: ${data.roomsFirst}</span></div>
    <div class="form-row"><span class="form-label">43. Building Condition &amp; Repairs:</span><span class="form-value">Needs Reconstruction: ${data.wholeBuildingNeedsReconstruction} | Major Repair Classrooms: ${data.classroomsRequiringMajorRepair}</span></div>
    <div class="form-row"><span class="form-label">44. Recent Additional Construction:</span><span class="form-value">${data.mostRecentAdditionalConstruction} (Classrooms: ${data.additionalClassRooms}, Toilets: ${data.additionalToilets}, Boundary Wall: ${data.boundaryWallBuilt})</span></div>
    ${footerHtml(2)}
  </div>

  <!-- PAGE 3: FACILITIES -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 3 — (03) SCHOOL FACILITIES (OFFICES, ELECTRICITY, WATER, STAFF TOILETS)</div>
    <div class="form-row"><span class="form-label">45. Additional Classrooms Required:</span><span class="form-value">${data.additionalClassroomsRequired}</span></div>
    <div class="form-row"><span class="form-label">46. Offices &amp; Rooms In Use:</span><span class="form-value">Head Teacher Office: ${data.headTeacherOfficeInUse} | Staff Room: ${data.staffRoomInUse} | Clerk Room: ${data.clerkRoomInUse} | Library: ${data.libraryAvailable}</span></div>
    <div class="form-row"><span class="form-label">47. Electricity &amp; Solar Power:</span><span class="form-value">Electricity: ${data.electricityAvailable} | WAPDA: ${data.wapdaFunctional} | Solar: ${data.solarFunctional} | UPS: ${data.upsAvailable} (${data.otherPowerSource})</span></div>
    <div class="form-row"><span class="form-label">48. Boundary Wall Status:</span><span class="form-value">Available: ${data.boundaryWallAvailable} | Status: ${data.boundaryWallStatus} | Height: ${data.boundaryWallHeight}</span></div>
    <div class="form-row"><span class="form-label">49. Drinking Water Facility:</span><span class="form-value">Available: ${data.drinkingWaterAvailable} | Bore: ${data.waterBore} | Pipe Connection: ${data.waterPipeConnection}</span></div>
    <div class="form-row"><span class="form-label">50. Staff Toilets:</span><span class="form-value">Available: ${data.staffToiletsAvailable} | Total: ${data.numberOfToiletsStaff} | Functional: ${data.numberOfFunctionalToiletsStaff}</span></div>
    ${footerHtml(3)}
  </div>

  <!-- PAGE 4: STUDENT TOILETS, DRM, SPORTS & SECURITY -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 4 — STUDENT TOILETS, RAMP, DRM, SPORTS &amp; SECURITY</div>
    <div class="form-row"><span class="form-label">51. Student Toilets:</span><span class="form-value">Available: ${data.studentsToiletsAvailable} | Total: ${data.numberOfToiletsStudents} | Functional: ${data.numberOfFunctionalToiletsStudents}</span></div>
    <div class="form-row"><span class="form-label">52. Ramp Access (Inclusive Ed):</span><span class="form-value">Available: ${data.rampAccessAvailable} | Entrance: ${data.rampAtEntrance} | Building: ${data.rampInsideBuilding} | Toilets: ${data.rampInToilets}</span></div>
    <div class="form-row"><span class="form-label">53. Disaster Risk Management (DRM):</span><span class="form-value">DRM Plan: ${data.drmAvailable} | First Aid Kit: ${data.firstAidKit} | Trained Teachers: ${data.teachersTrainedDrm}</span></div>
    <div class="form-row"><span class="form-label">54. Playground &amp; Sports Equipment:</span><span class="form-value">Playground: ${data.playgroundAvailable} (${data.playgroundAreaMarlas} Marlas) | Cricket: ${data.cricketEquipment} | Football: ${data.footballEquipment} | Badminton: ${data.badmintonEquipment}</span></div>
    <div class="form-row"><span class="form-label">55. Security &amp; CCTV Cameras:</span><span class="form-value">CCTV: ${data.cctvAvailable} (${data.cctvFunctional}/${data.cctvTotal} Functional) | Barbed Wire: ${data.barbedWire} | SOS Mobile: ${data.sosMobileNumber}</span></div>
    ${footerHtml(4)}
  </div>

  <!-- PAGE 5: ENROLLMENT BY GROUP & SECTION -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 5 — (04) ENROLLMENT BY GROUP &amp; SECTION</div>
    <table class="data-table">
      <thead><tr><th>Class</th><th>Group</th><th>Morning Enrollment</th><th>Morning Sections</th><th>Evening Enrollment</th><th>Evening Sections</th></tr></thead>
      <tbody>
        ${data.enrollmentRows.map((r) => `<tr><td><strong>${r.className}</strong></td><td>${r.group}</td><td><strong>${r.morningEnrollment}</strong></td><td>${r.morningSections}</td><td>${r.eveningEnrollment}</td><td>${r.eveningSections}</td></tr>`).join('')}
      </tbody>
    </table>
    ${footerHtml(5)}
  </div>

  <!-- PAGE 6: AGE GROUPS (BOYS) -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 6 — ENROLLMENT BY AGE GROUP (BOYS)</div>
    <table class="data-table">
      <thead><tr><th>Class</th><th>3Y</th><th>4Y</th><th>5Y</th><th>6Y</th><th>7Y</th><th>8Y</th><th>9Y</th><th>10Y</th><th>11Y</th><th>Repeaters</th><th>Hafiz</th><th>Orphan</th><th>Afghan</th></tr></thead>
      <tbody>
        ${data.boysAgeRows.map((r) => `<tr><td><strong>${r.className}</strong></td><td>${r.a3}</td><td>${r.a4}</td><td>${r.a5}</td><td>${r.a6}</td><td>${r.a7}</td><td>${r.a8}</td><td>${r.a9}</td><td>${r.a10}</td><td>${r.a11}</td><td>${r.repeaters}</td><td>${r.hafizQuran}</td><td>${r.orphan}</td><td>${r.afghanRefugees}</td></tr>`).join('')}
      </tbody>
    </table>
    ${footerHtml(6)}
  </div>

  <!-- PAGE 7: AGE GROUPS (GIRLS) -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 7 — ENROLLMENT BY AGE GROUP (GIRLS)</div>
    <table class="data-table">
      <thead><tr><th>Class</th><th>3Y</th><th>4Y</th><th>5Y</th><th>6Y</th><th>7Y</th><th>8Y</th><th>9Y</th><th>10Y</th><th>11Y</th><th>Repeaters</th><th>Hafiz</th><th>Orphan</th><th>Afghan</th></tr></thead>
      <tbody>
        ${data.girlsAgeRows.map((r) => `<tr><td><strong>${r.className}</strong></td><td>${r.a3}</td><td>${r.a4}</td><td>${r.a5}</td><td>${r.a6}</td><td>${r.a7}</td><td>${r.a8}</td><td>${r.a9}</td><td>${r.a10}</td><td>${r.a11}</td><td>${r.repeaters}</td><td>${r.hafizQuran}</td><td>${r.orphan}</td><td>${r.afghanRefugees}</td></tr>`).join('')}
      </tbody>
    </table>
    ${footerHtml(7)}
  </div>

  <!-- PAGE 8: FUNCTIONAL DIFFICULTIES -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 8 — CHILDREN WITH FUNCTIONAL DIFFICULTIES</div>
    <table class="data-table">
      <thead><tr><th>Class</th><th>Seeing (Some/Cannot)</th><th>Hearing (Some/Cannot)</th><th>Walking (Some/Cannot)</th><th>Remembering (Some/Cannot)</th><th>Self-Care (Some/Cannot)</th><th>Comm. (Some/Cannot)</th></tr></thead>
      <tbody>
        ${data.functionalDifficultyRows.map((r) => `<tr><td><strong>${r.className}</strong></td><td>${r.seeingSome} / ${r.seeingCannot}</td><td>${r.hearingSome} / ${r.hearingCannot}</td><td>${r.walkingSome} / ${r.walkingCannot}</td><td>${r.rememberingSome} / ${r.rememberingCannot}</td><td>${r.adlSome} / ${r.adlCannot}</td><td>${r.communicatingSome} / ${r.communicatingCannot}</td></tr>`).join('')}
      </tbody>
    </table>
    ${footerHtml(8)}
  </div>

  <!-- PAGE 9: LEARNING ASSESSMENT -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 9 — LEARNING DIFFICULTIES ASSESSMENT</div>
    <div class="form-row"><span class="form-label">Teacher Assessor Name &amp; Contact:</span><span class="form-value">${data.teacherAssessorName} (${data.teacherAssessorContact})</span></div>
    <div class="form-row"><span class="form-label">Skilled / Identified / Interventions:</span><span class="form-value">Skilled: ${data.skilledToIdentify} | Identified: ${data.childrenIdentifiedCount} | Receiving Intervention: ${data.studentsReceivingIntervention}</span></div>
    <div class="form-row"><span class="form-label">Remedial Comments:</span><span class="form-value">${data.learningComments}</span></div>
    <table class="data-table">
      <thead><tr><th>Class</th><th>Morning Reading</th><th>Morning Writing</th><th>Morning Math</th><th>Evening Reading</th><th>Evening Writing</th><th>Evening Math</th></tr></thead>
      <tbody>
        ${data.learningDifficultyRows.map((r) => `<tr><td><strong>${r.className}</strong></td><td>${r.mReading}</td><td>${r.mWriting}</td><td>${r.mMath}</td><td>${r.eReading}</td><td>${r.eWriting}</td><td>${r.eMath}</td></tr>`).join('')}
      </tbody>
    </table>
    ${footerHtml(9)}
  </div>

  <!-- PAGE 10: SCHOLARSHIPS -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 10 — SCHOLARSHIPS &amp; STUDENT WELFARE</div>
    <table class="data-table">
      <thead><tr><th>Class</th><th>Scholarship Name</th><th>Morning Boys</th><th>Morning Girls</th><th>Evening Boys</th><th>Evening Girls</th></tr></thead>
      <tbody>
        ${data.scholarshipRows.map((r) => `<tr><td><strong>${r.className}</strong></td><td>${r.scholarshipName}</td><td>${r.mBoys}</td><td>${r.mGirls}</td><td>${r.eBoys}</td><td>${r.eGirls}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="form-row"><span class="form-label">Polio / Corporal Punishment / GBV Cases:</span><span class="form-value">Polio: ${data.polioAffectedCount} | Corporal: ${data.corporalPunishmentCount} | GBV: ${data.gbvCasesCount}</span></div>
    ${footerHtml(10)}
  </div>

  <!-- PAGE 11: HR & STAFF INFORMATION -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 11 — (05) STAFF / HR INFORMATION</div>
    <table class="data-table">
      <thead><tr><th>Designation</th><th>BPS</th><th>Total Posts</th><th>Filled Posts</th><th>Vacant</th></tr></thead>
      <tbody>
        ${data.sanctionedPostsRows.map((sp) => `<tr><td><strong>${sp.designation}</strong></td><td>${sp.bps}</td><td>${sp.totalPosts}</td><td>${sp.filledPosts}</td><td>${sp.vacant}</td></tr>`).join('')}
      </tbody>
    </table>
    <table class="data-table">
      <thead><tr><th>Employee Name</th><th>Father Name</th><th>CNIC #</th><th>DOB</th><th>Appt. Date</th><th>Designation</th><th>Status</th><th>Role / Focal</th></tr></thead>
      <tbody>
        ${data.hrStaffRows.map((hr) => `<tr><td><strong>${hr.name}</strong></td><td>${hr.fatherName}</td><td>${hr.cnic}</td><td>${hr.dob}</td><td>${hr.appointmentDate}</td><td><strong>${hr.designation}</strong></td><td>${hr.staffStatus}</td><td>${hr.focalPerson}</td></tr>`).join('')}
      </tbody>
    </table>
    ${footerHtml(11)}
  </div>

  <!-- PAGE 12: DOUBLE SHIFT TEACHERS -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 12 — TEMPORARY HIRED TEACHERS (DOUBLE SHIFT)</div>
    <table class="data-table">
      <thead><tr><th>Name</th><th>Father Name</th><th>CNIC #</th><th>Designation</th><th>Contact No</th></tr></thead>
      <tbody>
        ${
          data.doubleShiftTeachersRows.length > 0
            ? data.doubleShiftTeachersRows
                .map(
                  (t) =>
                    `<tr><td><strong>${t.name}</strong></td><td>${t.fatherName}</td><td>${t.cnic}</td><td>${t.designation}</td><td>${t.contactNo}</td></tr>`
                )
                .join('')
            : '<tr><td colspan="5" style="text-align:center;">No Double Shift Hired Teachers (Single Shift Regular School)</td></tr>'
        }
      </tbody>
    </table>
    ${footerHtml(12)}
  </div>

  <!-- PAGE 13: PTC / UNICEF STAFF -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 13 — TEMPORARY HIRED TEACHERS (PTC / UNICEF)</div>
    <table class="data-table">
      <thead><tr><th>Name</th><th>Father Name</th><th>CNIC #</th><th>Designation</th><th>Contact No</th><th>Funding Body</th></tr></thead>
      <tbody>
        ${
          data.ptcTeachersRows.length > 0
            ? data.ptcTeachersRows
                .map(
                  (t) =>
                    `<tr><td><strong>${t.name}</strong></td><td>${t.fatherName}</td><td>${t.cnic}</td><td>${t.designation}</td><td>${t.contactNo}</td><td>${t.fundingBody}</td></tr>`
                )
                .join('')
            : '<tr><td colspan="6" style="text-align:center;">No Temporary PTC / UNICEF Hired Teachers</td></tr>'
        }
      </tbody>
    </table>
    ${footerHtml(13)}
  </div>

  <!-- PAGE 14: PTC & ECE INFORMATION -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 14 — (06) PTC INFORMATION &amp; (07) ECE INFORMATION</div>
    <div class="form-row"><span class="form-label">PTC Established / Date / Trained:</span><span class="form-value">${data.ptcEstablished} | Est: ${data.ptcEstablishmentDate} | Trained: ${data.ptcMembersTrained}</span></div>
    <div class="form-row"><span class="form-label">PTC Chairperson Name &amp; Contact:</span><span class="form-value">${data.ptcChairpersonName} (${data.ptcChairpersonContact})</span></div>
    <div class="form-row"><span class="form-label">Bank Name / Branch / IBAN:</span><span class="form-value">${data.ptcBankName} — ${data.ptcBranchName} (${data.ptcBranchCode}) | IBAN: ${data.ptcIban}</span></div>
    <div class="form-row"><span class="form-label">PTC Balances &amp; Grants:</span><span class="form-value">June 2026: Rs.${data.ptcBalanceJune2026} | Oct 2026: Rs.${data.ptcBalanceOct2026} | Govt Grant: Rs.${data.ptcAmountFromGovt} | Expenditure: Rs.${data.ptcExpenditure}</span></div>
    <table class="data-table">
      <thead><tr><th>Member Name</th><th>CNIC</th><th>Contact</th><th>Role</th><th>Membership Date</th><th>Address</th><th>Status</th></tr></thead>
      <tbody>
        ${data.ptcMembersRows.map((m) => `<tr><td><strong>${m.name}</strong></td><td>${m.cnic}</td><td>${m.contact}</td><td>${m.chairperson}</td><td>${m.membershipDate}</td><td>${m.address}</td><td>${m.status}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="form-row"><span class="form-label">ECE Room &amp; Trained Teacher:</span><span class="form-value">ECE Room: ${data.eceRoomAvailable} | Chairs/Tables: ${data.eceChairsCount}/${data.eceTablesCount} | Teacher: ${data.eceTeacherName} (${data.eceTeacherCnic})</span></div>
    ${footerHtml(14)}
  </div>

  <!-- PAGE 15: ICT & LABS -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 15 — (08) ICT &amp; COMPUTER LAB INFORMATION</div>
    <div class="form-row"><span class="form-label">Internet &amp; Speed:</span><span class="form-value">Available: ${data.internetAvailable} | Landline: ${data.internetLandline} | Speed: ${data.internetSpeed}</span></div>
    <div class="form-row"><span class="form-label">Wireless Backup Networks:</span><span class="form-value">Jazz: ${data.internetWirelessJazz} | Zong: ${data.internetWirelessZong} | Notes: ${data.internetOtherWireless}</span></div>
    <div class="form-row"><span class="form-label">IT Lab Details:</span><span class="form-value">Available: ${data.itLabAvailable} (Est: ${data.itLabEstYear}) | Computers: ${data.itLabFunctionalComputers}/${data.itLabTotalComputers} | Printer: ${data.itLabPrinter} | Projector: ${data.itLabProjector}</span></div>
    <div class="form-row"><span class="form-label">Interactive Whiteboard &amp; Tablets:</span><span class="form-value">IWB: ${data.iwbFunctional} (${data.iwbAlternatePower}) | Tablets: ${data.mobileTabletsFunctional}/${data.mobileTabletsCount} | Biometric: ${data.biometricFunctional}</span></div>
    ${footerHtml(15)}
  </div>

  <!-- PAGE 16: COMMODITIES INFORMATION -->
  <div class="page-break">
    ${headerHtml}
    <div class="section-banner">PAGE 16 — (09) ASSETS / COMMODITIES INFORMATION (21 ITEMS REGISTER)</div>
    <table class="data-table">
      <thead><tr><th>S#</th><th>Item Name</th><th>Available</th><th>Useable</th><th>Un-useable</th><th>Required</th><th>Repaired</th><th>New Received</th></tr></thead>
      <tbody>
        ${data.commoditiesRows.map((c) => `<tr><td style="text-align:center;">${c.sNo}</td><td><strong>${c.itemName}</strong></td><td><strong>${c.available}</strong></td><td>${c.useable}</td><td>${c.unuseable}</td><td>${c.required}</td><td>${c.repaired}</td><td>${c.newReceived}</td></tr>`).join('')}
      </tbody>
    </table>
    <div style="margin-top: 24px; display: flex; justify-content: space-between; padding: 0 20px;">
      <div style="text-align: center; border-top: 1px solid #000; width: 180px; padding-top: 4px; font-weight: 800;">Prepared by (EMIS Incharge)</div>
      <div style="text-align: center; border-top: 1px solid #000; width: 180px; padding-top: 4px; font-weight: 800;">Verified by (PTC Chairman)</div>
      <div style="text-align: center; border-top: 1px solid #000; width: 220px; padding-top: 4px; font-weight: 800;">Head Teacher GPS Chambai Kohat</div>
    </div>
    ${footerHtml(16)}
  </div>

</body>
</html>`;
  },

  /**
   * Print All 16 Pages via Iframe Print
   */
  printSsr(data: SsrDataState): void {
    const html = this.generateSsrHtml(data);
    executeIframePrint(html);
  },

  /**
   * Save as Real PDF into GPS Chambai/SSR/PDF Reports
   */
  async savePdf(data: SsrDataState): Promise<{ success: boolean; fileName: string }> {
    const html = this.generateSsrHtml(data);
    const fileName = `SSR_2026-27_GPS_Chambai_EMIS_${data.emisCode}.pdf`;
    await exportAndSaveRealPdf(
      `SCHOOL SELF REPORTING (SSR) 2026-27 — ${data.schoolName}`,
      html,
      fileName,
      'portrait',
      'SSR/PDF Reports'
    );
    return { success: true, fileName };
  },

  /**
   * Save as DOCX (Microsoft Word Document format) into GPS Chambai/SSR/SSR Documents
   */
  async saveDocx(data: SsrDataState): Promise<{ success: boolean; fileName: string }> {
    const html = this.generateSsrHtml(data);
    const fileName = `SSR_2026-27_GPS_Chambai_EMIS_${data.emisCode}.doc`;
    await exportAndSaveWordDoc(
      `SCHOOL SELF REPORTING (SSR) 2026-27 — ${data.schoolName}`,
      html,
      fileName,
      'SSR/SSR Documents'
    );
    return { success: true, fileName };
  },

  /**
   * Save as XLSX (Microsoft Excel Tabular Workbook format) into GPS Chambai/SSR/SSR Documents
   */
  saveXlsx(data: SsrDataState): { success: boolean; fileName: string } {
    const xlsxXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="HeaderStyle">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#065F46" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="School Basic Info">
  <Table>
   <Column ss:Width="200"/>
   <Column ss:Width="300"/>
   <Row ss:StyleID="HeaderStyle">
    <Cell><Data ss:Type="String">Field Name</Data></Cell>
    <Cell><Data ss:Type="String">School Value</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String">EMIS Code</Data></Cell><Cell><Data ss:Type="String">${data.emisCode}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">School Name</Data></Cell><Cell><Data ss:Type="String">${data.schoolName}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Head Teacher Mobile</Data></Cell><Cell><Data ss:Type="String">${data.headMobileNo}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Head WhatsApp</Data></Cell><Cell><Data ss:Type="String">${data.headWhatsAppNo}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">District / Tehsil</Data></Cell><Cell><Data ss:Type="String">${data.district} / ${data.tehsil}</Data></Cell></Row>
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Enrollment">
  <Table>
   <Row ss:StyleID="HeaderStyle">
    <Cell><Data ss:Type="String">Class</Data></Cell>
    <Cell><Data ss:Type="String">Group</Data></Cell>
    <Cell><Data ss:Type="String">Morning Enrollment</Data></Cell>
    <Cell><Data ss:Type="String">Sections</Data></Cell>
   </Row>
   ${data.enrollmentRows.map((r) => `
   <Row>
    <Cell><Data ss:Type="String">${r.className}</Data></Cell>
    <Cell><Data ss:Type="String">${r.group}</Data></Cell>
    <Cell><Data ss:Type="Number">${r.morningEnrollment}</Data></Cell>
    <Cell><Data ss:Type="Number">${r.morningSections}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Commodities">
  <Table>
   <Row ss:StyleID="HeaderStyle">
    <Cell><Data ss:Type="String">S#</Data></Cell>
    <Cell><Data ss:Type="String">Item Name</Data></Cell>
    <Cell><Data ss:Type="String">Available</Data></Cell>
    <Cell><Data ss:Type="String">Useable</Data></Cell>
    <Cell><Data ss:Type="String">Un-useable</Data></Cell>
    <Cell><Data ss:Type="String">Required</Data></Cell>
   </Row>
   ${data.commoditiesRows.map((c) => `
   <Row>
    <Cell><Data ss:Type="Number">${c.sNo}</Data></Cell>
    <Cell><Data ss:Type="String">${c.itemName}</Data></Cell>
    <Cell><Data ss:Type="Number">${c.available}</Data></Cell>
    <Cell><Data ss:Type="Number">${c.useable}</Data></Cell>
    <Cell><Data ss:Type="Number">${c.unuseable}</Data></Cell>
    <Cell><Data ss:Type="Number">${c.required}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob(['\ufeff', xlsxXml], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    });

    const fileName = `SSR_2026-27_GPS_Chambai_EMIS_${data.emisCode}.xlsx`;
    StorageFolderService.saveFileToFolder({
      folderPath: 'SSR/SSR Documents',
      fileName,
      mimeType: 'application/vnd.ms-excel',
      data: blob,
      sourceModule: 'SSR',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, fileName };
  },

  /**
   * Save as JPG using HTML5 Canvas rendering
   */
  async saveJpg(data: SsrDataState): Promise<{ success: boolean; fileName: string }> {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { success: false, fileName: '' };

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#065F46';
    ctx.fillRect(40, 40, canvas.width - 80, 8);

    ctx.fillStyle = '#064E3B';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCHOOL SELF REPORTING (SSR) 2026-27', canvas.width / 2, 90);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(data.schoolName, canvas.width / 2, 125);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(
      `EMIS Code: ${data.emisCode} • Head Mobile: ${data.headMobileNo} • District: ${data.district}`,
      canvas.width / 2,
      155
    );

    ctx.fillStyle = '#065F46';
    ctx.fillRect(50, 180, canvas.width - 100, 36);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('(01) SCHOOL BASIC INFORMATION & VERIFIED METRICS', canvas.width / 2, 205);

    let y = 250;
    const items = [
      ['School Gender:', data.gender, 'DDO Code:', data.ddoCode],
      ['School Level:', data.schoolLevel, 'Primary Type:', data.primaryType],
      ['Union Council:', data.unionCouncil, 'Village:', data.villageCity],
      ['Head Mobile No:', data.headMobileNo, 'WhatsApp No:', data.headWhatsAppNo],
      ['Coordinates:', `${data.xCoordinate}, ${data.yCoordinate}`, 'Telephone:', data.telephoneNo],
      ['Cluster School:', data.clusterSchool, 'Distance:', data.distanceFromCluster],
      ['Year of Establishment:', data.yearOfEstablishment, 'Construction Year:', data.yearOfConstruction],
      ['Total Trees on Ground:', data.totalTrees, 'Planted This Year:', data.treesPlantedThisYear],
      ['Covered Area:', `${data.coveredAreaMarlas} Marlas`, 'Total Land:', `${data.totalLandMarlas} Marlas`],
      ['Pakka Classrooms:', data.pakkaClassRooms, 'Staff Toilets:', data.numberOfFunctionalToiletsStaff],
    ];

    ctx.textAlign = 'left';
    items.forEach((row, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
      ctx.fillRect(50, y - 20, canvas.width - 100, 32);

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(row[0], 65, y);

      ctx.fillStyle = '#047857';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(row[1], 270, y);

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(row[2], 640, y);

      ctx.fillStyle = '#047857';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(row[3], 840, y);

      y += 34;
    });

    const fileName = `SSR_2026-27_GPS_Chambai_EMIS_${data.emisCode}.jpg`;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    await StorageFolderService.saveFileToFolder({
      folderPath: 'SSR/PDF Reports',
      fileName,
      mimeType: 'image/jpeg',
      data: dataUrl,
      sourceModule: 'SSR',
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return { success: true, fileName };
  },
};
