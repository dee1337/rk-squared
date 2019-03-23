import axios from 'axios';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { addWorldDungeons, loadDungeons } from '../actions/dungeons';
import { showDanger } from '../actions/messages';
import { setProgress } from '../actions/progress';
import { getLang } from '../actions/session';
import * as apiUrls from '../api/apiUrls';
import * as schemas from '../api/schemas';
import { convertWorldDungeons } from '../proxy/dungeons';
import { IState } from '../reducers';
import { logger } from '../utils/logger';
import { sessionConfig } from './util';

export const progressKey = 'dungeons';

export function* doLoadDungeons(action: ReturnType<typeof loadDungeons>) {
  const session = yield select((state: IState) => state.session);
  // FIXME: Throw an error if any of session is missing
  const lang = getLang(session);

  yield put(setProgress(progressKey, { current: 0, max: action.payload.worldIds.length }));

  for (let i = 0; i < action.payload.worldIds.length; i++) {
    const worldId = action.payload.worldIds[i];
    yield put(setProgress(progressKey, { current: i, max: action.payload.worldIds.length }));
    logger.info(`Getting dungeons for world ${worldId}...`);

    const result = yield call(() =>
      axios
        .get(apiUrls.dungeons(lang, worldId), sessionConfig(session))
        .then(response => {
          // FIXME: Validate data
          return addWorldDungeons(worldId, convertWorldDungeons(response.data as schemas.Dungeons));
        })
        .catch(e => {
          logger.error(e);
          return showDanger(e.message);
        }),
    );
    if (result != null) {
      yield put(result);
    }
  }

  yield put(setProgress(progressKey, undefined));
}

export function* watchLoadDungeons() {
  yield takeEvery(getType(loadDungeons), doLoadDungeons);
}
