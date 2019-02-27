import * as _ from 'lodash';

// TODO: Try removing duplicating in unions and arrays - see https://stackoverflow.com/a/45486495/25507

export type EnlirElement =
  | 'Fire'
  | 'Ice'
  | 'Lightning'
  | 'Earth'
  | 'Wind'
  | 'Water'
  | 'Holy'
  | 'Dark'
  | 'Poison'
  | 'NE';
export const allEnlirElements: EnlirElement[] = [
  'Fire',
  'Ice',
  'Lightning',
  'Earth',
  'Wind',
  'Water',
  'Holy',
  'Dark',
  'Poison',
  'NE',
];
export const isEnlirElement = (s: string): s is EnlirElement =>
  allEnlirElements.indexOf(s as EnlirElement) !== -1;

export type EnlirFormula = 'Physical' | 'Magical' | 'Hybrid' | '?';

export type EnlirSchool =
  | '?'
  | 'Bard'
  | 'Black Magic'
  | 'Celerity'
  | 'Combat'
  | 'Dancer'
  | 'Darkness'
  | 'Dragoon'
  | 'Heavy'
  | 'Knight'
  | 'Machinist'
  | 'Monk'
  | 'Ninja'
  | 'Samurai'
  | 'Sharpshooter'
  | 'Special'
  | 'Spellblade'
  | 'Summoning'
  | 'Support'
  | 'Thief'
  | 'White Magic'
  | 'Witch';
export const allEnlirSchools: EnlirSchool[] = [
  '?',
  'Bard',
  'Black Magic',
  'Celerity',
  'Combat',
  'Dancer',
  'Darkness',
  'Dragoon',
  'Heavy',
  'Knight',
  'Machinist',
  'Monk',
  'Ninja',
  'Samurai',
  'Sharpshooter',
  'Special',
  'Spellblade',
  'Summoning',
  'Support',
  'Thief',
  'White Magic',
  'Witch',
];
export const isEnlirSchool = (s: string): s is EnlirSchool =>
  allEnlirSchools.indexOf(s as EnlirSchool) !== -1;

export type EnlirSkillType = 'BLK' | 'NAT' | 'NIN' | 'PHY' | 'SUM' | 'WHT' | '?';

export type EnlirSoulBreakTier =
  | 'Default'
  | 'SB'
  | 'BSB'
  | 'OSB'
  | 'USB'
  | 'CSB'
  | 'Glint'
  | 'AOSB'
  | 'AASB'
  | 'Glint+'
  | 'RW'
  | 'Shared';

// FIXME: Interfaces for remaining Enlir types

export interface EnlirOtherSkill {
  sourceType: string;
  source: string;
  name: string;
  type: EnlirSkillType | null;
  target: string;
  formula: EnlirFormula | null;
  multiplier: number | null;
  element: EnlirElement[] | null;
  time: number;
  effects: string;
  counter: boolean;
  autoTarget: string;
  sb: number;
  school: string;
  id: number;
  gl: boolean;
}

export interface EnlirRecordMateria {
  realm: string;
  character: string;
  name: string;
  effect: string;
  unlockCriteria: string;
  nameJp: string;
  id: number;
  gl: boolean;
}

export interface EnlirSoulBreak {
  realm: string;
  character: string;
  name: string;
  type: EnlirSkillType | null;
  target: string;
  formula: EnlirFormula | null;
  multiplier: number | null;
  element: EnlirElement[] | null;
  time: number | null;
  effects: string;
  counter: boolean;
  autoTarget: string;
  points: number;
  tier: EnlirSoulBreakTier;
  master: string | null;
  relic: string;
  nameJp: string;
  id: number;
  gl: boolean;
}

export interface EnlirStatus {
  id: number;
  name: string;
  effects: string;
  defaultDuration: number | null;
  mndModifier: number | null;
  mndModifierIsOpposed: boolean;
  exclusiveStatus: string[] | null;
  codedName: string;
  notes: string | null;
}

export type EnlirSkill = EnlirOtherSkill | EnlirSoulBreak;

const rawData = {
  abilities: require('./enlir/abilities.json'),
  characters: require('./enlir/characters.json'),
  magicite: require('./enlir/magicite.json'),
  otherSkills: require('./enlir/otherSkills.json') as EnlirOtherSkill[],
  recordMateria: require('./enlir/recordMateria.json') as EnlirRecordMateria[],
  relics: require('./enlir/relics.json'),
  soulBreaks: require('./enlir/soulBreaks.json') as EnlirSoulBreak[],
  status: require('./enlir/status.json') as EnlirStatus[],
};

// FIXME: Properly update rawData outside of app

export const enlir = {
  abilities: _.keyBy(rawData.abilities, 'id'),
  characters: _.keyBy(rawData.characters, 'id'),
  charactersByName: _.keyBy(rawData.characters, 'name'),
  magicites: _.keyBy(rawData.magicite, 'id'),
  otherSkillsByName: _.keyBy(rawData.otherSkills, 'name'),
  relics: _.keyBy(rawData.relics, 'id'),
  recordMateria: _.keyBy(rawData.recordMateria, 'id'),
  soulBreaks: _.keyBy(rawData.soulBreaks, 'id'),
  statusByName: _.keyBy(rawData.status, 'name'),
};

/**
 * HACK: Patch Enlir data to make it easier for our text processing.
 */
function patchEnlir() {
  const pluto = enlir.statusByName['Pluto Knight Triblade Follow-Up'];
  if (
    pluto &&
    pluto.effects ===
      'Casts Pluto Knight Triblade and grants Minor Buff Fire, Minor Buff Lightning and Minor Buff Ice after exploiting elemental weakness'
  ) {
    pluto.effects =
      'Casts Pluto Knight Triblade and grants Minor Buff Fire/Lightning/Ice after exploiting elemental weakness';
  }
}
patchEnlir();

/**
 * Handle statuses for which the FFRK Community spreadsheet is inconsistent.
 *
 * NOTE: These are unconfirmed.  (If they were confirmed, we'd just update
 * the spreadsheet.)  TODO: Try to clean up alternate status names.
 */
const enlirStatusAltName: { [status: string]: EnlirStatus } = {
  IC1: enlir.statusByName['Instant Cast 1'],
  'Critical 100%': enlir.statusByName['100% Critical'],
};

/**
 * Retrieves an EnlirStatus by name, including support for generic numbers and
 * elements.
 */
export function getEnlirStatusByName(status: string): EnlirStatus | undefined {
  if (enlir.statusByName[status]) {
    return enlir.statusByName[status];
  }

  if (enlirStatusAltName[status]) {
    return enlirStatusAltName[status];
  }

  status = status.replace(/\d+/, 'X');
  if (enlir.statusByName[status]) {
    return enlir.statusByName[status];
  }

  status = status.replace(/-X/, '+X');
  if (enlir.statusByName[status]) {
    return enlir.statusByName[status];
  }

  for (const i of allEnlirElements) {
    status = status.replace(i, '[Element]');
  }
  if (enlir.statusByName[status]) {
    return enlir.statusByName[status];
  }

  return undefined;
}
