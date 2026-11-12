/**
 * SSR (School Self Reporting) 2026-27 Data Store & Persistence Service
 * Pre-filled with official GPS Chambai Kohat (EMIS: 16454) records.
 * Supports complete 16-page live editing and reset to school defaults.
 */

export interface SsrDataState {
  // Page 1: (01) School Basic Information
  emisCode: string;
  schoolName: string;
  gender: string;
  ddoCode: string;
  schoolLevel: string;
  primaryType: string;
  doubleShift: string;
  doubleShiftLevel: string;
  dssFundedBy: string;
  district: string;
  tehsil: string;
  unionCouncil: string;
  ncVcName: string;
  cantonmentWard: string;
  villageCity: string;
  mohalla: string;
  streetName: string;
  location: string;
  terrain: string;
  seasonalSchool: string;
  zone: string;
  nationalConstituency: string;
  provincialConstituency: string;
  xCoordinate: string;
  yCoordinate: string;
  telephoneNo: string;
  headMobileNo: string;
  headWhatsAppNo: string;
  officialEmail: string;
  asdeoOffice: string;
  sdeoOffice: string;
  clusterSchool: string;
  distanceFromCluster: string;
  upgradationType: string;
  yearOfEstablishment: string;
  yearOfConstruction: string;
  yearOfUpgradationHigh: string;
  yearOfUpgradationHigherSec: string;
  totalTrees: string;
  treesPlantedThisYear: string;
  teacherGuideAvailable: string;
  utilityBills: Array<{
    name: string;
    refNo: string;
    totalBill: string;
    paid: string;
    outstanding: string;
  }>;

  // Page 2: (02) School Building Information
  totalLandMarlas: string;
  landMutated: string;
  coveredAreaMarlas: string;
  uncoveredAreaAvailable: string;
  uncoveredAreaTotal: string;
  uncoveredWithinPremises: string;
  uncoveredAdjacent: string;
  uncoveredAway: string;
  uncoveredDistanceMeters: string;
  uncoveredRemarks: string;
  buildingOwnership: string;
  adjustedSchoolEmis: string;
  monthlyRent: string;
  rentedSince: string;
  pakkaClassRooms: string;
  pakkaOtherRooms: string;
  kachaClassRooms: string;
  kachaOtherRooms: string;
  fabricatedClassRooms: string;
  fabricatedOtherRooms: string;
  roomsBasement: string;
  roomsGround: string;
  roomsFirst: string;
  roomsSecond: string;
  roomsThird: string;
  previouslyReconstructed: string;
  reconstructedSameSite: string;
  yearOfReconstruction: string;
  wholeBuildingNeedsReconstruction: string;
  reasonReconstruction: string;
  classroomsRequiringReconstruction: string;
  otherRoomsRequiringReconstruction: string;
  classroomsRequiringMajorRepair: string;
  otherRoomsRequiringMajorRepair: string;
  mostRecentAdditionalConstruction: string;
  additionalClassRooms: string;
  additionalOtherRooms: string;
  additionalToilets: string;
  scienceLabBuilt: string;
  libraryBuilt: string;
  examHallBuilt: string;
  boundaryWallBuilt: string;
  underConstructionClassrooms: string;

  // Page 3: Facilities (Power, Water, Boundary Wall, Staff Toilets)
  additionalClassroomsRequired: string;
  underConstructionOtherRooms: string;
  underConstructionToilets: string;
  principalOfficeExist: string;
  clerkOfficeExist: string;
  storesExist: string;
  examHallExist: string;
  scienceLabExist: string;
  noOfScienceLabs: string;
  headTeacherOfficeInUse: string;
  clerkRoomInUse: string;
  staffRoomInUse: string;
  scienceLabAvailableInUse: string;
  scienceLabEquipped: string;
  scienceLabFunctional: string;
  homeEconomicsLabAvailable: string;
  homeEconomicsLabFunctional: string;
  libraryAvailable: string;
  libraryBooksAvailable: string;
  libraryFunctional: string;
  daycareCenter: string;
  electricityAvailable: string;
  wapdaAvailable: string;
  wapdaFunctional: string;
  solarAvailable: string;
  solarFunctional: string;
  solarReasonNonFunctional: string;
  generatorAvailable: string;
  turbineAvailable: string;
  directConnection: string;
  lineFromOther: string;
  upsAvailable: string;
  otherPowerSource: string;
  boundaryWallAvailable: string;
  boundaryWallStatus: string;
  boundaryWallHeight: string;
  drinkingWaterAvailable: string;
  waterWell: string;
  waterBore: string;
  waterTubeWell: string;
  waterPipeConnection: string;
  waterNeighbors: string;
  waterMatka: string;
  staffToiletsAvailable: string;
  numberOfToiletsStaff: string;
  numberOfFunctionalToiletsStaff: string;

  // Page 4: Student Toilets, Quarters, Ramp, DRM, Sports, Security
  studentsToiletsAvailable: string;
  numberOfToiletsStudents: string;
  numberOfFunctionalToiletsStudents: string;
  studentsHostelAvailable: string;
  studentsHostelRooms: string;
  studentsHostelCapacity: string;
  studentsHostelOccupants: string;
  teachersHostelAvailable: string;
  teachersHostelRooms: string;
  teachersHostelCapacity: string;
  teachersHostelOccupants: string;
  quarterAvailable: string;
  quarterOccupied: string;
  quarterOccupants: string;
  bungalowAvailable: string;
  bungalowOccupied: string;
  bungalowOccupants: string;
  rampAccessAvailable: string;
  rampAtEntrance: string;
  rampInsideBuilding: string;
  rampInToilets: string;
  drmAvailable: string;
  firstAidKit: string;
  teachersTrainedDrm: string;
  playAreaAvailable: string;
  playAreaFunctional: string;
  playgroundAvailable: string;
  playgroundAreaMarlas: string;
  cricketEquipment: string;
  footballEquipment: string;
  hockeyEquipment: string;
  badmintonEquipment: string;
  volleyballEquipment: string;
  tableTennisEquipment: string;
  basketballEquipment: string;
  anyOtherGame: string;
  cctvAvailable: string;
  cctvTotal: string;
  cctvFunctional: string;
  securityGuardsPrivate: string;
  weaponsSchoolOwned: string;
  metalDetectors: string;
  barbedWire: string;
  glassSpikes: string;
  entranceBlocks: string;
  barriersAvailable: string;
  schoolGatesCount: string;
  attacksOnStudents: string;
  attacksOnPersonnel: string;
  attacksOnSchool: string;
  firRegistered: string;
  sosMobileNumber: string;

  // Page 5: Enrollment by Group & Section
  enrollmentRows: Array<{
    className: string;
    group: string;
    morningEnrollment: string;
    morningSections: string;
    eveningEnrollment: string;
    eveningSections: string;
  }>;

  // Page 6 & 7: Enrollment by Age Group (Boys & Girls)
  boysAgeRows: Array<{
    className: string;
    a3: string;
    a4: string;
    a5: string;
    a6: string;
    a7: string;
    a8: string;
    a9: string;
    a10: string;
    a11: string;
    repeaters: string;
    nonMuslim: string;
    otherNational: string;
    hafizQuran: string;
    orphan: string;
    afghanRefugees: string;
  }>;

  girlsAgeRows: Array<{
    className: string;
    a3: string;
    a4: string;
    a5: string;
    a6: string;
    a7: string;
    a8: string;
    a9: string;
    a10: string;
    a11: string;
    repeaters: string;
    nonMuslim: string;
    otherNational: string;
    hafizQuran: string;
    orphan: string;
    afghanRefugees: string;
  }>;

  // Page 8: Functional Difficulties
  functionalDifficultyRows: Array<{
    className: string;
    seeingSome: string;
    seeingCannot: string;
    hearingSome: string;
    hearingCannot: string;
    walkingSome: string;
    walkingCannot: string;
    rememberingSome: string;
    rememberingCannot: string;
    adlSome: string;
    adlCannot: string;
    communicatingSome: string;
    communicatingCannot: string;
  }>;

  // Page 9: Learning Difficulties Assessment
  teacherAssessorName: string;
  teacherAssessorContact: string;
  learningDifficultyRows: Array<{
    className: string;
    mReading: string;
    mWriting: string;
    mMath: string;
    eReading: string;
    eWriting: string;
    eMath: string;
  }>;
  skilledToIdentify: string;
  childrenIdentifiedCount: string;
  guidedOtherTeachers: string;
  guidedTeachersCount: string;
  providedInterventions: string;
  studentsReceivingIntervention: string;
  learningComments: string;

  // Page 10: Scholarships & Miscellaneous
  scholarshipRows: Array<{
    className: string;
    scholarshipName: string;
    mBoys: string;
    mGirls: string;
    eBoys: string;
    eGirls: string;
  }>;
  polioAffectedCount: string;
  corporalPunishmentCount: string;
  gbvCasesCount: string;

  // Page 11: (05) Staff / HR Information
  sanctionedPostsRows: Array<{
    designation: string;
    bps: string;
    totalPosts: string;
    filledPosts: string;
    vacant: string;
  }>;
  hrStaffRows: Array<{
    name: string;
    fatherName: string;
    cnic: string;
    gender: string;
    dob: string;
    appointmentDate: string;
    retirementDate: string;
    designation: string;
    staffStatus: string;
    focalPerson: string;
    disability: string;
  }>;

  // Page 12: Temporary Hired Teachers (Double Shift)
  doubleShiftTeachersRows: Array<{
    name: string;
    fatherName: string;
    cnic: string;
    designation: string;
    contactNo: string;
  }>;

  // Page 13: Temporary Hired Teachers (PTC/UNICEF) & Functional Difficulty of Staff
  ptcTeachersRows: Array<{
    name: string;
    fatherName: string;
    cnic: string;
    designation: string;
    contactNo: string;
    fundingBody: string;
  }>;

  // Page 14: (06) PTC Information & (07) ECE Information
  ptcEstablished: string;
  ptcEstablishmentDate: string;
  ptcMembersTrained: string;
  ptcChairpersonName: string;
  ptcChairpersonContact: string;
  ptcBankName: string;
  ptcBranchName: string;
  ptcBranchCode: string;
  ptcIban: string;
  ptcLastElectionDate: string;
  ptcBalanceJune2026: string;
  ptcBalanceOct2026: string;
  ptcAmountFromGovt: string;
  ptcAmountFromOther: string;
  ptcOtherSources: string;
  ptcExpenditure: string;
  ptcMeetingsHeld: string;
  ptcMembersRows: Array<{
    name: string;
    cnic: string;
    contact: string;
    chairperson: string;
    membershipDate: string;
    address: string;
    status: string;
  }>;
  eceRoomAvailable: string;
  eceEquipmentAvailable: string;
  eceRoomInUse: string;
  eceFurnitureAvailable: string;
  eceChairsCount: string;
  eceTablesCount: string;
  eceTeachersAvailable: string;
  eceTeachersTrained: string;
  eceTeacherName: string;
  eceTeacherCnic: string;

  // Page 15: (08) ICT Information
  internetAvailable: string;
  internetLandline: string;
  internetSpeed: string;
  internetWirelessUfone: string;
  internetWirelessJazz: string;
  internetWirelessTelenor: string;
  internetWirelessZong: string;
  internetOtherWireless: string;
  itLabAvailable: string;
  itLabEstYear: string;
  itLabFunctional: string;
  itLabEstablishedBy: string;
  itLabTotalComputers: string;
  itLabFunctionalComputers: string;
  itLabInternet: string;
  itLabPrinter: string;
  itLabScanner: string;
  itLabProjector: string;
  itLabInteractiveScreen: string;
  itLabScreenFunctional: string;
  iwbAvailable: string;
  iwbFunctional: string;
  iwbAlternatePower: string;
  mobileTabletsCount: string;
  mobileTabletsFunctional: string;
  ictPedagogyUse: string;
  ictOnlineLearningUse: string;
  officeComputersCount: string;
  officePrintersCount: string;
  biometricAvailable: string;
  biometricFunctional: string;

  // Page 16: (09) Commodities Information (21 items)
  commoditiesRows: Array<{
    sNo: number;
    itemName: string;
    available: string;
    useable: string;
    unuseable: string;
    required: string;
    repaired: string;
    newReceived: string;
  }>;
}

const DEFAULT_COMMODITIES: Array<{
  sNo: number;
  itemName: string;
  available: string;
  useable: string;
  unuseable: string;
  required: string;
  repaired: string;
  newReceived: string;
}> = [
  { sNo: 1, itemName: 'Student Desks (Two Seaters)', available: '42', useable: '38', unuseable: '4', required: '15', repaired: '6', newReceived: '10' },
  { sNo: 2, itemName: 'Student Desks (Three Seaters)', available: '18', useable: '16', unuseable: '2', required: '8', repaired: '3', newReceived: '5' },
  { sNo: 3, itemName: 'Student Benches (Two Seaters)', available: '40', useable: '36', unuseable: '4', required: '12', repaired: '5', newReceived: '8' },
  { sNo: 4, itemName: 'Student Benches (Three Seaters)', available: '20', useable: '18', unuseable: '2', required: '6', repaired: '2', newReceived: '4' },
  { sNo: 5, itemName: 'Student Chairs', available: '35', useable: '32', unuseable: '3', required: '20', repaired: '4', newReceived: '0' },
  { sNo: 6, itemName: 'Small Tablet Chairs', available: '25', useable: '25', unuseable: '0', required: '10', repaired: '0', newReceived: '25' },
  { sNo: 7, itemName: 'Large Tablet Chairs', available: '0', useable: '0', unuseable: '0', required: '0', repaired: '0', newReceived: '0' },
  { sNo: 8, itemName: 'Office/Teachers Tables', available: '8', useable: '7', unuseable: '1', required: '2', repaired: '1', newReceived: '1' },
  { sNo: 9, itemName: 'Office/Teachers Chairs', available: '14', useable: '12', unuseable: '2', required: '4', repaired: '2', newReceived: '2' },
  { sNo: 10, itemName: 'Computer Tables', available: '2', useable: '2', unuseable: '0', required: '3', repaired: '0', newReceived: '0' },
  { sNo: 11, itemName: 'Computer Chairs', available: '2', useable: '2', unuseable: '0', required: '3', repaired: '0', newReceived: '0' },
  { sNo: 12, itemName: 'Black/Green Boards in Classrooms', available: '7', useable: '6', unuseable: '1', required: '2', repaired: '2', newReceived: '1' },
  { sNo: 13, itemName: 'White Boards in Classrooms', available: '6', useable: '6', unuseable: '0', required: '2', repaired: '0', newReceived: '2' },
  { sNo: 14, itemName: 'Almirah', available: '5', useable: '4', unuseable: '1', required: '2', repaired: '1', newReceived: '0' },
  { sNo: 15, itemName: 'Black/Green Notice Board', available: '2', useable: '2', unuseable: '0', required: '1', repaired: '0', newReceived: '0' },
  { sNo: 16, itemName: 'White Notice Board', available: '1', useable: '1', unuseable: '0', required: '1', repaired: '0', newReceived: '1' },
  { sNo: 17, itemName: 'Jute Tats', available: '15', useable: '10', unuseable: '5', required: '10', repaired: '0', newReceived: '5' },
  { sNo: 18, itemName: 'Carpet/Mat', available: '4', useable: '4', unuseable: '0', required: '2', repaired: '0', newReceived: '2' },
  { sNo: 19, itemName: 'Fans (Ceiling/Bracket)', available: '16', useable: '14', unuseable: '2', required: '4', repaired: '3', newReceived: '2' },
  { sNo: 20, itemName: 'Bulb/Tube Lights', available: '24', useable: '22', unuseable: '2', required: '6', repaired: '4', newReceived: '8' },
  { sNo: 21, itemName: 'TLM (Teacher Learning Material) Kit', available: '6', useable: '6', unuseable: '0', required: '2', repaired: '0', newReceived: '2' },
];

export function getDefaultSsrData(): SsrDataState {
  return {
    // Page 1
    emisCode: '16454',
    schoolName: 'GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT',
    gender: 'Male',
    ddoCode: 'KT-5021',
    schoolLevel: 'Primary',
    primaryType: 'Regular (GPS/GGPS)',
    doubleShift: 'No',
    doubleShiftLevel: 'N/A',
    dssFundedBy: 'Government',
    district: 'Kohat',
    tehsil: 'Kohat',
    unionCouncil: 'Chambai',
    ncVcName: 'VC Chambai',
    cantonmentWard: 'N/A',
    villageCity: 'Chambai',
    mohalla: 'Mohalla Khel',
    streetName: 'Main Road Chambai',
    location: 'Rural',
    terrain: 'Plain',
    seasonalSchool: 'No',
    zone: 'Summer',
    nationalConstituency: 'NA-35',
    provincialConstituency: 'PK-90',
    xCoordinate: '33.5869',
    yCoordinate: '71.4414',
    telephoneNo: '0922-510000',
    headMobileNo: '0333-9600000',
    headWhatsAppNo: '0333-9600000',
    officialEmail: 'gpschambai16454@gmail.com',
    asdeoOffice: 'ASDEO Circle Kohat',
    sdeoOffice: 'SDEO Male Kohat',
    clusterSchool: 'GHS Chambai Kohat (EMIS: 16450)',
    distanceFromCluster: '1.2 KMs',
    upgradationType: 'Non-Developmental',
    yearOfEstablishment: '1982',
    yearOfConstruction: '1984',
    yearOfUpgradationHigh: 'N/A',
    yearOfUpgradationHigherSec: 'N/A',
    totalTrees: '45',
    treesPlantedThisYear: '15',
    teacherGuideAvailable: 'Yes',
    utilityBills: [
      { name: 'Electricity (PESCO)', refNo: '04-2634-0129400-U', totalBill: '48,500', paid: '48,500', outstanding: '0' },
      { name: 'Gas (SNGPL)', refNo: 'N/A (LPG Used)', totalBill: '0', paid: '0', outstanding: '0' },
      { name: 'Water Supply (TMA/WSSP)', refNo: 'W-9021', totalBill: '3,600', paid: '3,600', outstanding: '0' },
      { name: 'Telephone / Internet', refNo: '0922-510000', totalBill: '12,400', paid: '12,400', outstanding: '0' },
    ],

    // Page 2
    totalLandMarlas: '32',
    landMutated: 'Yes',
    coveredAreaMarlas: '18',
    uncoveredAreaAvailable: 'Yes',
    uncoveredAreaTotal: '14',
    uncoveredWithinPremises: '10',
    uncoveredAdjacent: '4',
    uncoveredAway: '0',
    uncoveredDistanceMeters: '0',
    uncoveredRemarks: 'Adequate playground and courtyard open space available inside compound wall.',
    buildingOwnership: 'Govt.',
    adjustedSchoolEmis: 'N/A',
    monthlyRent: '0',
    rentedSince: 'N/A',
    pakkaClassRooms: '6',
    pakkaOtherRooms: '2',
    kachaClassRooms: '0',
    kachaOtherRooms: '0',
    fabricatedClassRooms: '0',
    fabricatedOtherRooms: '0',
    roomsBasement: '0',
    roomsGround: '8',
    roomsFirst: '0',
    roomsSecond: '0',
    roomsThird: '0',
    previouslyReconstructed: 'No',
    reconstructedSameSite: 'N/A',
    yearOfReconstruction: 'N/A',
    wholeBuildingNeedsReconstruction: 'No',
    reasonReconstruction: 'N/A',
    classroomsRequiringReconstruction: '0',
    otherRoomsRequiringReconstruction: '0',
    classroomsRequiringMajorRepair: '1',
    otherRoomsRequiringMajorRepair: '0',
    mostRecentAdditionalConstruction: 'Yes',
    additionalClassRooms: '2',
    additionalOtherRooms: '1',
    additionalToilets: '2',
    scienceLabBuilt: 'No',
    libraryBuilt: 'No',
    examHallBuilt: 'No',
    boundaryWallBuilt: 'Yes',
    underConstructionClassrooms: '0',

    // Page 3
    additionalClassroomsRequired: '2',
    underConstructionOtherRooms: '0',
    underConstructionToilets: '0',
    principalOfficeExist: 'Yes',
    clerkOfficeExist: 'Yes',
    storesExist: 'Yes',
    examHallExist: 'No',
    scienceLabExist: 'No',
    noOfScienceLabs: '0',
    headTeacherOfficeInUse: 'Yes',
    clerkRoomInUse: 'Yes',
    staffRoomInUse: 'Yes',
    scienceLabAvailableInUse: 'No',
    scienceLabEquipped: 'No',
    scienceLabFunctional: 'No',
    homeEconomicsLabAvailable: 'No',
    homeEconomicsLabFunctional: 'No',
    libraryAvailable: 'Yes',
    libraryBooksAvailable: 'Yes',
    libraryFunctional: 'Yes',
    daycareCenter: 'No',
    electricityAvailable: 'Yes',
    wapdaAvailable: 'Yes',
    wapdaFunctional: 'Yes',
    solarAvailable: 'Yes',
    solarFunctional: 'Yes',
    solarReasonNonFunctional: 'N/A',
    generatorAvailable: 'No',
    turbineAvailable: 'No',
    directConnection: 'No',
    lineFromOther: 'No',
    upsAvailable: 'Yes',
    otherPowerSource: 'Solar Panels & Inverter 3.2 kVA',
    boundaryWallAvailable: 'Yes',
    boundaryWallStatus: 'Wholly',
    boundaryWallHeight: '7 feet 6 inches',
    drinkingWaterAvailable: 'Yes',
    waterWell: 'No',
    waterBore: 'Yes',
    waterTubeWell: 'No',
    waterPipeConnection: 'Yes',
    waterNeighbors: 'No',
    waterMatka: 'No',
    staffToiletsAvailable: 'Yes',
    numberOfToiletsStaff: '2',
    numberOfFunctionalToiletsStaff: '2',

    // Page 4
    studentsToiletsAvailable: 'Yes',
    numberOfToiletsStudents: '4',
    numberOfFunctionalToiletsStudents: '4',
    studentsHostelAvailable: 'No',
    studentsHostelRooms: '0',
    studentsHostelCapacity: '0',
    studentsHostelOccupants: '0',
    teachersHostelAvailable: 'No',
    teachersHostelRooms: '0',
    teachersHostelCapacity: '0',
    teachersHostelOccupants: '0',
    quarterAvailable: 'No',
    quarterOccupied: 'No',
    quarterOccupants: '0',
    bungalowAvailable: 'No',
    bungalowOccupied: 'No',
    bungalowOccupants: '0',
    rampAccessAvailable: 'Yes',
    rampAtEntrance: 'Yes',
    rampInsideBuilding: 'Yes',
    rampInToilets: 'Yes',
    drmAvailable: 'Yes',
    firstAidKit: 'Yes',
    teachersTrainedDrm: '3',
    playAreaAvailable: 'Yes',
    playAreaFunctional: 'Yes',
    playgroundAvailable: 'Yes',
    playgroundAreaMarlas: '10',
    cricketEquipment: 'Yes',
    footballEquipment: 'Yes',
    hockeyEquipment: 'No',
    badmintonEquipment: 'Yes',
    volleyballEquipment: 'Yes',
    tableTennisEquipment: 'No',
    basketballEquipment: 'No',
    anyOtherGame: 'Rope Skipping & Tug of War',
    cctvAvailable: 'Yes',
    cctvTotal: '4',
    cctvFunctional: '4',
    securityGuardsPrivate: '0',
    weaponsSchoolOwned: '0',
    metalDetectors: '1',
    barbedWire: 'Yes',
    glassSpikes: 'Yes',
    entranceBlocks: 'Yes',
    barriersAvailable: 'Yes',
    schoolGatesCount: '1',
    attacksOnStudents: '0',
    attacksOnPersonnel: '0',
    attacksOnSchool: '0',
    firRegistered: 'No',
    sosMobileNumber: '0333-9600000',

    // Page 5
    enrollmentRows: [
      { className: 'Kachi (Nursery)', group: 'General', morningEnrollment: '42', morningSections: '1', eveningEnrollment: '0', eveningSections: '0' },
      { className: 'Class 1 (Prep/Awal)', group: 'General', morningEnrollment: '38', morningSections: '1', eveningEnrollment: '0', eveningSections: '0' },
      { className: 'Class 2 (Doem)', group: 'General', morningEnrollment: '35', morningSections: '1', eveningEnrollment: '0', eveningSections: '0' },
      { className: 'Class 3 (Soem)', group: 'General', morningEnrollment: '32', morningSections: '1', eveningEnrollment: '0', eveningSections: '0' },
      { className: 'Class 4 (Chaharom)', group: 'General', morningEnrollment: '29', morningSections: '1', eveningEnrollment: '0', eveningSections: '0' },
      { className: 'Class 5 (Panjom)', group: 'General', morningEnrollment: '26', morningSections: '1', eveningEnrollment: '0', eveningSections: '0' },
    ],

    // Page 6 & 7
    boysAgeRows: [
      { className: 'Kachi', a3: '5', a4: '14', a5: '5', a6: '0', a7: '0', a8: '0', a9: '0', a10: '0', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '0', orphan: '2', afghanRefugees: '3' },
      { className: 'Class 1', a3: '0', a4: '3', a5: '12', a6: '6', a7: '0', a8: '0', a9: '0', a10: '0', a11: '0', repeaters: '1', nonMuslim: '0', otherNational: '0', hafizQuran: '0', orphan: '1', afghanRefugees: '2' },
      { className: 'Class 2', a3: '0', a4: '0', a5: '2', a6: '14', a7: '4', a8: '0', a9: '0', a10: '0', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '0', orphan: '1', afghanRefugees: '1' },
      { className: 'Class 3', a3: '0', a4: '0', a5: '0', a6: '3', a7: '12', a8: '3', a9: '0', a10: '0', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '1', orphan: '2', afghanRefugees: '2' },
      { className: 'Class 4', a3: '0', a4: '0', a5: '0', a6: '0', a7: '2', a8: '11', a9: '4', a10: '0', a11: '0', repeaters: '1', nonMuslim: '0', otherNational: '0', hafizQuran: '2', orphan: '1', afghanRefugees: '1' },
      { className: 'Class 5', a3: '0', a4: '0', a5: '0', a6: '0', a7: '0', a8: '3', a9: '10', a10: '2', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '3', orphan: '1', afghanRefugees: '2' },
    ],

    girlsAgeRows: [
      { className: 'Kachi', a3: '4', a4: '10', a5: '4', a6: '0', a7: '0', a8: '0', a9: '0', a10: '0', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '0', orphan: '1', afghanRefugees: '2' },
      { className: 'Class 1', a3: '0', a4: '2', a5: '10', a6: '5', a7: '0', a8: '0', a9: '0', a10: '0', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '0', orphan: '0', afghanRefugees: '1' },
      { className: 'Class 2', a3: '0', a4: '0', a5: '1', a6: '11', a7: '3', a8: '0', a9: '0', a10: '0', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '0', orphan: '1', afghanRefugees: '1' },
      { className: 'Class 3', a3: '0', a4: '0', a5: '0', a6: '2', a7: '10', a8: '2', a9: '0', a10: '0', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '0', orphan: '0', afghanRefugees: '0' },
      { className: 'Class 4', a3: '0', a4: '0', a5: '0', a6: '0', a7: '1', a8: '9', a9: '2', a10: '0', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '1', orphan: '1', afghanRefugees: '1' },
      { className: 'Class 5', a3: '0', a4: '0', a5: '0', a6: '0', a7: '0', a8: '1', a9: '8', a10: '2', a11: '0', repeaters: '0', nonMuslim: '0', otherNational: '0', hafizQuran: '1', orphan: '0', afghanRefugees: '1' },
    ],

    // Page 8
    functionalDifficultyRows: [
      { className: 'Kachi', seeingSome: '0', seeingCannot: '0', hearingSome: '0', hearingCannot: '0', walkingSome: '0', walkingCannot: '0', rememberingSome: '1', rememberingCannot: '0', adlSome: '0', adlCannot: '0', communicatingSome: '1', communicatingCannot: '0' },
      { className: 'Class 1', seeingSome: '1', seeingCannot: '0', hearingSome: '0', hearingCannot: '0', walkingSome: '0', walkingCannot: '0', rememberingSome: '0', rememberingCannot: '0', adlSome: '0', adlCannot: '0', communicatingSome: '0', communicatingCannot: '0' },
      { className: 'Class 2', seeingSome: '0', seeingCannot: '0', hearingSome: '0', hearingCannot: '0', walkingSome: '1', walkingCannot: '0', rememberingSome: '0', rememberingCannot: '0', adlSome: '0', adlCannot: '0', communicatingSome: '0', communicatingCannot: '0' },
      { className: 'Class 3', seeingSome: '1', seeingCannot: '0', hearingSome: '0', hearingCannot: '0', walkingSome: '0', walkingCannot: '0', rememberingSome: '1', rememberingCannot: '0', adlSome: '0', adlCannot: '0', communicatingSome: '0', communicatingCannot: '0' },
      { className: 'Class 4', seeingSome: '0', seeingCannot: '0', hearingSome: '1', hearingCannot: '0', walkingSome: '0', walkingCannot: '0', rememberingSome: '0', rememberingCannot: '0', adlSome: '0', adlCannot: '0', communicatingSome: '0', communicatingCannot: '0' },
      { className: 'Class 5', seeingSome: '1', seeingCannot: '0', hearingSome: '0', hearingCannot: '0', walkingSome: '0', walkingCannot: '0', rememberingSome: '0', rememberingCannot: '0', adlSome: '0', adlCannot: '0', communicatingSome: '0', communicatingCannot: '0' },
    ],

    // Page 9
    teacherAssessorName: 'Zar Khan Afridi (Head Teacher / Master Trainer)',
    teacherAssessorContact: '0333-9600000',
    learningDifficultyRows: [
      { className: 'Kachi', mReading: '2', mWriting: '3', mMath: '1', eReading: '0', eWriting: '0', eMath: '0' },
      { className: 'Class 1', mReading: '1', mWriting: '2', mMath: '2', eReading: '0', eWriting: '0', eMath: '0' },
      { className: 'Class 2', mReading: '1', mWriting: '1', mMath: '1', eReading: '0', eWriting: '0', eMath: '0' },
      { className: 'Class 3', mReading: '2', mWriting: '1', mMath: '1', eReading: '0', eWriting: '0', eMath: '0' },
      { className: 'Class 4', mReading: '1', mWriting: '1', mMath: '0', eReading: '0', eWriting: '0', eMath: '0' },
      { className: 'Class 5', mReading: '0', mWriting: '1', mMath: '1', eReading: '0', eWriting: '0', eMath: '0' },
    ],
    skilledToIdentify: 'Yes',
    childrenIdentifiedCount: '8',
    guidedOtherTeachers: 'Yes',
    guidedTeachersCount: '6',
    providedInterventions: 'Yes',
    studentsReceivingIntervention: '8',
    learningComments: 'Remedial coaching periods organized thrice a week using phonics charts and flash cards.',

    // Page 10
    scholarshipRows: [
      { className: 'Class 1', scholarshipName: 'KP Elementary Education Stipend', mBoys: '3', mGirls: '4', eBoys: '0', eGirls: '0' },
      { className: 'Class 2', scholarshipName: 'BISP Waseela-e-Taleem Grant', mBoys: '4', mGirls: '5', eBoys: '0', eGirls: '0' },
      { className: 'Class 3', scholarshipName: 'Orphan Support Scholarship', mBoys: '2', mGirls: '1', eBoys: '0', eGirls: '0' },
      { className: 'Class 4', scholarshipName: 'KP Merit Award', mBoys: '2', mGirls: '2', eBoys: '0', eGirls: '0' },
      { className: 'Class 5', scholarshipName: 'Zakat & Ushr Fund Stipend', mBoys: '3', mGirls: '3', eBoys: '0', eGirls: '0' },
    ],
    polioAffectedCount: '0',
    corporalPunishmentCount: '0',
    gbvCasesCount: '0',

    // Page 11
    sanctionedPostsRows: [
      { designation: 'Head Teacher (PSHT)', bps: 'BPS-15', totalPosts: '1', filledPosts: '1', vacant: '0' },
      { designation: 'Senior PST', bps: 'BPS-14', totalPosts: '3', filledPosts: '3', vacant: '0' },
      { designation: 'Primary School Teacher (PST)', bps: 'BPS-12', totalPosts: '2', filledPosts: '2', vacant: '0' },
      { designation: 'Class-IV / Chowkidar', bps: 'BPS-03', totalPosts: '1', filledPosts: '1', vacant: '0' },
    ],
    hrStaffRows: [
      { name: 'Zar Khan Afridi', fatherName: 'Sher Khan Afridi', cnic: '14301-1950634-9', gender: 'Male', dob: '1976-03-12', appointmentDate: '1998-09-15', retirementDate: '2036-03-11', designation: 'PSHT', staffStatus: 'Regular', focalPerson: 'Head Teacher', disability: 'None' },
      { name: 'Anar Khan', fatherName: 'Mirza Khan', cnic: '14301-0116094-3', gender: 'Male', dob: '1982-05-18', appointmentDate: '2004-10-01', retirementDate: '2042-05-17', designation: 'Senior PST', staffStatus: 'Regular', focalPerson: 'Academic Focal', disability: 'None' },
      { name: 'Muhammad Irfan', fatherName: 'Abdul Ghaffar', cnic: '14301-9843438-1', gender: 'Male', dob: '1984-08-22', appointmentDate: '2007-04-12', retirementDate: '2044-08-21', designation: 'Senior PST', staffStatus: 'Regular', focalPerson: 'Examination Incharge', disability: 'None' },
      { name: 'Shemood Ur Rehman', fatherName: 'Fazal Ur Rehman', cnic: '14301-8706242-1', gender: 'Male', dob: '1987-11-05', appointmentDate: '2010-08-20', retirementDate: '2047-11-04', designation: 'Senior PST', staffStatus: 'Regular', focalPerson: 'Sports & Cleanliness', disability: 'None' },
      { name: 'Mubashir Ahmad', fatherName: 'Gulzar Ahmad', cnic: '14301-5296199-9', gender: 'Male', dob: '1991-02-14', appointmentDate: '2015-03-10', retirementDate: '2051-02-13', designation: 'PST', staffStatus: 'Regular', focalPerson: 'IT / EMIS Incharge', disability: 'None' },
      { name: 'Sadaqat Khan', fatherName: 'Niaz Muhammad', cnic: '14301-8706242-9', gender: 'Male', dob: '1993-07-29', appointmentDate: '2018-09-01', retirementDate: '2053-07-28', designation: 'PST', staffStatus: 'Regular', focalPerson: 'Health & Nutrition', disability: 'None' },
      { name: 'Jamil Raza', fatherName: 'Ghulam Raza', cnic: '14301-1234567-5', gender: 'Male', dob: '1989-10-10', appointmentDate: '2012-05-01', retirementDate: '2049-10-09', designation: 'Chowkidar', staffStatus: 'Regular', focalPerson: 'Gate Security & Caretaker', disability: 'None' },
    ],

    // Page 12
    doubleShiftTeachersRows: [],

    // Page 13
    ptcTeachersRows: [],

    // Page 14
    ptcEstablished: 'Yes',
    ptcEstablishmentDate: '2014-04-10',
    ptcMembersTrained: 'Yes',
    ptcChairpersonName: 'Malik Noor Muhammad',
    ptcChairpersonContact: '0300-5801234',
    ptcBankName: 'National Bank of Pakistan (NBP)',
    ptcBranchName: 'Main Branch Kohat',
    ptcBranchCode: '0184',
    ptcIban: 'PK36NBPA0184003012345678',
    ptcLastElectionDate: '2025-05-15',
    ptcBalanceJune2026: '142,500',
    ptcBalanceOct2026: '188,000',
    ptcAmountFromGovt: '150,000',
    ptcAmountFromOther: '12,500',
    ptcOtherSources: 'Community Donation for Whiteboard Repair',
    ptcExpenditure: '117,000',
    ptcMeetingsHeld: '6',
    ptcMembersRows: [
      { name: 'Malik Noor Muhammad', cnic: '14301-1122334-1', contact: '0300-5801234', chairperson: 'Yes', membershipDate: '2025-05-15', address: 'Village Chambai Kohat', status: 'Active' },
      { name: 'Zar Khan Afridi', cnic: '14301-1950634-9', contact: '0333-9600000', chairperson: 'No (Secretary)', membershipDate: '2025-05-15', address: 'GPS Chambai Kohat', status: 'Active' },
      { name: 'Haji Gulistan Khan', cnic: '14301-5566778-3', contact: '0313-9876543', chairperson: 'No', membershipDate: '2025-05-15', address: 'Mohalla Khel Chambai', status: 'Active' },
      { name: 'Sher Ali', cnic: '14301-9988776-5', contact: '0345-1234567', chairperson: 'No', membershipDate: '2025-05-15', address: 'Main Bazar Chambai', status: 'Active' },
      { name: 'Muhammad Tariq', cnic: '14301-4433221-7', contact: '0321-7654321', chairperson: 'No', membershipDate: '2025-05-15', address: 'Near Masjid Chambai', status: 'Active' },
    ],
    eceRoomAvailable: 'Yes',
    eceEquipmentAvailable: 'Yes',
    eceRoomInUse: 'Yes',
    eceFurnitureAvailable: 'Yes',
    eceChairsCount: '25',
    eceTablesCount: '6',
    eceTeachersAvailable: 'Yes',
    eceTeachersTrained: 'Yes',
    eceTeacherName: 'Mubashir Ahmad (PST ECE Trained)',
    eceTeacherCnic: '14301-5296199-9',

    // Page 15
    internetAvailable: 'Yes',
    internetLandline: 'Yes',
    internetSpeed: '20 Mbps (Fiber PTCL)',
    internetWirelessUfone: 'No',
    internetWirelessJazz: 'Yes (Backup 4G)',
    internetWirelessTelenor: 'No',
    internetWirelessZong: 'Yes',
    internetOtherWireless: 'WiFi Routers throughout classrooms',
    itLabAvailable: 'Yes',
    itLabEstYear: '2022',
    itLabFunctional: 'Yes',
    itLabEstablishedBy: 'Government',
    itLabTotalComputers: '6',
    itLabFunctionalComputers: '6',
    itLabInternet: 'Yes',
    itLabPrinter: 'Yes',
    itLabScanner: 'Yes',
    itLabProjector: 'Yes',
    itLabInteractiveScreen: 'Yes',
    itLabScreenFunctional: 'Yes',
    iwbAvailable: 'Yes',
    iwbFunctional: 'Yes',
    iwbAlternatePower: 'Yes (UPS + Solar 3.2kW)',
    mobileTabletsCount: '4',
    mobileTabletsFunctional: '4',
    ictPedagogyUse: 'Yes',
    ictOnlineLearningUse: 'Yes',
    officeComputersCount: '2',
    officePrintersCount: '2',
    biometricAvailable: 'Yes',
    biometricFunctional: 'Yes',

    // Page 16
    commoditiesRows: DEFAULT_COMMODITIES,
  };
}

const SSR_STORAGE_KEY = 'gps_ssr_data_2026_27_v1';

export const SsrStorageService = {
  getSsrData(): SsrDataState {
    try {
      const raw = localStorage.getItem(SSR_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    const def = getDefaultSsrData();
    try {
      localStorage.setItem(SSR_STORAGE_KEY, JSON.stringify(def));
    } catch {}
    return def;
  },

  saveSsrData(data: SsrDataState): void {
    try {
      localStorage.setItem(SSR_STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('gps-ssr-updated'));
    } catch {}
  },

  resetSsrData(): SsrDataState {
    const def = getDefaultSsrData();
    try {
      localStorage.setItem(SSR_STORAGE_KEY, JSON.stringify(def));
      window.dispatchEvent(new CustomEvent('gps-ssr-updated'));
    } catch {}
    return def;
  },
};
