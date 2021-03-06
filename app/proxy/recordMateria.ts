/**
 * @file
 * Support for tracking record materia
 */

import { Store } from 'redux';

import * as schemas from '../api/schemas';
import * as charactersSchemas from '../api/schemas/characters';
import * as recordMateriaSchemas from '../api/schemas/recordMateria';
import { Handler, HandlerRequest } from './common';

import { IState } from '../reducers';

import {
  obtainRecordMateria,
  Order,
  RecordMateria,
  setRecordMateria,
  setRecordMateriaInventory,
  Step,
  updateRecordMateriaInventory,
} from '../actions/recordMateria';
import { SeriesId } from '../data/series';

import * as _ from 'lodash';
import { logger } from '../utils/logger';

interface MateriaIdsByCharacter {
  [characterId: number]: number[];
}

function sortRecordMateriaByCharacter(
  rawRecordMateria: recordMateriaSchemas.RecordMateria[],
): MateriaIdsByCharacter {
  const result: { [characterId: number]: number[] } = [];
  for (const i of rawRecordMateria) {
    result[i.buddy_id] = result[i.buddy_id] || [];
    result[i.buddy_id][i.step - 1] = i.id;
  }
  return result;
}

function determineOrder(
  data: recordMateriaSchemas.ReleasedRecordMateriaList,
  byCharacter: MateriaIdsByCharacter,
  result: { [id: number]: RecordMateria },
) {
  const standardOrder: Order[] = ['1', '2', '3'];
  const abOrder: Order[] = ['1a', '1b', '2', '3'];

  for (const { id, buddy_id } of data.record_materias) {
    const thisOrder = byCharacter[buddy_id].length === 4 ? abOrder : standardOrder;
    result[id].order = thisOrder[result[id].step - 1];
    result[id].prereqs = byCharacter[buddy_id].slice(0, result[id].step - 1);
  }
}

function determineObtained(
  data: schemas.ReleasedRecordMateriaList,
  byCharacter: MateriaIdsByCharacter,
  result: { [id: number]: RecordMateria },
) {
  Object.keys(data.achieved_record_materia_map).forEach(i => {
    const id = +i;
    result[id].obtained = true;

    // HACK: Each character's first RM may not be listed in
    // achieved_record_materia_map.  If any RM is obtained, then we can
    // assume that the previous RMs are obtained.  (This still may not
    // handle the case of a character who's obtained RM 1 but not 2 or 3;
    // we need to separately check level caps for that.)
    for (const j of byCharacter[result[id].characterId]) {
      if (j === id) {
        break;
      }
      result[j].obtained = true;
    }
  });
}

export function convertRecordMateriaList(
  data: schemas.ReleasedRecordMateriaList,
): { [id: number]: RecordMateria } {
  const result: { [id: number]: RecordMateria } = {};

  for (const i of data.record_materias) {
    result[i.id] = {
      name: i.name.trim(), // Hack: Names like Yang's "Feat of Fabul " have a space on the end.
      id: i.id,
      description: i.description,
      condition: i.cond_description,
      characterId: i.buddy_id,
      characterName: i.buddy_name,
      seriesId: i.buddy_series_id as SeriesId,
      step: i.step as Step,

      // Placeholders until fully processed
      obtained: false,
      order: '1',
    };
  }

  const byCharacter = sortRecordMateriaByCharacter(data.record_materias);

  determineOrder(data, byCharacter, result);
  determineObtained(data, byCharacter, result);

  return result;
}

function handleWinBattle(data: schemas.WinBattle, store: Store<IState>) {
  const obtainedIds = _.map(
    _.filter(data.result.prize_master, i => i.type_name === 'RECORD_MATERIA'),
    i => +i.item_id,
  );
  if (obtainedIds.length) {
    store.dispatch(obtainRecordMateria(obtainedIds));
  }
}

function processRecordMateriaInventory(
  store: Store<IState>,
  data: schemas.PartyList | schemas.PartyListOther,
) {
  store.dispatch(
    setRecordMateriaInventory(
      _.map(data.record_materias, i => i.id),
      _.map(_.filter(data.record_materias, i => i.is_favorite), i => i.id),
      _.map(data.record_materias_warehouse, i => i.record_materia_id),
    ),
  );
}

// noinspection JSUnusedGlobalSymbols
const recordMateriaHandler: Handler = {
  get_released_record_materia_list(data: schemas.ReleasedRecordMateriaList, store: Store<IState>) {
    const newRecordMateria = convertRecordMateriaList(data);
    store.dispatch(setRecordMateria(newRecordMateria));
  },

  'party/list'(data: schemas.PartyList, store: Store<IState>, request: HandlerRequest) {
    if (schemas.isRecordDungeonPartyList(request.url)) {
      return;
    }
    processRecordMateriaInventory(store, data);
  },

  'party/list_other'(data: schemas.PartyListOther, store: Store<IState>, request: HandlerRequest) {
    // As of February 2019, party/list_other isn't used for record dungeons,
    // but we'll be paranoid and check anyway.
    if (schemas.isRecordDungeonPartyList(request.url)) {
      return;
    }
    processRecordMateriaInventory(store, data);
  },

  set_favorite_record_materia(
    data: recordMateriaSchemas.SetFavoriteRecordMateria,
    store: Store<IState>,
    request: HandlerRequest,
  ) {
    if (typeof request.body !== 'object' || !request.body.id_to_flag) {
      logger.warn(`Unknown POST request for set_favorite_record_materia: ${request.body}`);
      return;
    }
    const post = request.body as recordMateriaSchemas.SetFavoriteRecordMateriaPost;
    _.forEach(post.id_to_flag, (value, id) => {
      store.dispatch(updateRecordMateriaInventory(+id, { favorite: !!value }));
    });
  },

  win_battle: handleWinBattle,
  battle_win: handleWinBattle,
  'battle/win': handleWinBattle,

  'warehouse/store_record_materias'(
    data: schemas.WarehouseStoreRecordMaterias,
    store: Store<IState>,
    request: HandlerRequest,
  ) {
    if (typeof request.body !== 'object' || !request.body.ids) {
      logger.warn(`Unknown POST request for warehouse/store_record_materias: ${request.body}`);
      return;
    }
    const post = request.body as schemas.WarehouseStoreRecordMateriasPost;
    _.forEach(post.ids, id => {
      store.dispatch(updateRecordMateriaInventory(id, { inventory: false }));
    });
  },

  'warehouse/bring_record_materias'(
    data: schemas.WarehouseBringRecordMaterias,
    store: Store<IState>,
    request: HandlerRequest,
  ) {
    if (typeof request.body !== 'object' || !request.body.ids) {
      logger.warn(`Unknown POST request for warehouse/bring_record_materias: ${request.body}`);
      return;
    }
    const post = request.body as schemas.WarehouseBringRecordMateriasPost;
    _.forEach(post.ids, id => {
      store.dispatch(updateRecordMateriaInventory(id, { inventory: true }));
    });
  },

  'buddy/evolve'(
    data: charactersSchemas.BuddyEvolve,
    store: Store<IState>,
    request: HandlerRequest,
  ) {
    if (typeof request.body !== 'object' || request.body.exec == null) {
      logger.warn(`Unknown POST request for buddy/evolve: ${request.body}`);
      return;
    }
    const post = request.body as charactersSchemas.BuddyEvolvePost;

    if (!post.exec) {
      return;
    }

    const execData = data as charactersSchemas.BuddyEvolveExec;
    if (execData.record_materia) {
      store.dispatch(obtainRecordMateria([execData.record_materia.id]));
    }
  },

  'grow_egg/use'(
    data: charactersSchemas.GrowEggUse,
    store: Store<IState>,
    request: HandlerRequest,
  ) {
    if (typeof request.body !== 'object' || request.body.exec == null) {
      logger.warn(`Unknown POST request for grow_egg/use: ${request.body}`);
      return;
    }
    const post = request.body as charactersSchemas.GrowEggUsePost;

    if (!post.exec) {
      return;
    }

    if (data.record_materia) {
      store.dispatch(obtainRecordMateria([data.record_materia.id]));
    }
  },
};

export default recordMateriaHandler;
