import { produce } from 'immer';
import { getType } from 'typesafe-actions';

import * as _ from 'lodash';

import {
  ExchangeShopSelections,
  RelicDrawAction,
  RelicDrawBanner,
  RelicDrawGroup,
  RelicDrawProbabilities,
  setExchangeShopSelections,
  setRelicDrawBanners,
  setRelicDrawGroups,
  setRelicDrawProbabilities,
} from '../actions/relicDraws';

export interface RelicDrawState {
  banners: {
    [bannerId: number]: RelicDrawBanner;
  };
  groups: {
    [group: string]: RelicDrawGroup;
  };
  probabilities: {
    // should be [bannerId: number], but string is easier for Lodash to work with
    [bannerId: string]: RelicDrawProbabilities;
  };
  selections: {
    [exchangeShopId: number]: ExchangeShopSelections;
  };
}

const initialState: RelicDrawState = {
  banners: {},
  groups: {},
  probabilities: {},
  selections: {},
};

export function relicDraws(
  state: RelicDrawState = initialState,
  action: RelicDrawAction,
): RelicDrawState {
  return produce(state, (draft: RelicDrawState) => {
    switch (action.type) {
      case getType(setRelicDrawBanners): {
        const newBanners = _.keyBy(action.payload, 'id');
        draft.banners = newBanners;
        draft.probabilities = _.pickBy(
          draft.probabilities,
          (value, key) => newBanners[key] != null,
        );
        // TODO: Also expire old exchange shop selections here?
        return;
      }

      case getType(setRelicDrawGroups):
        draft.groups = _.keyBy(action.payload, 'groupName');
        return;

      case getType(setRelicDrawProbabilities):
        draft.probabilities[action.payload.bannerId] = action.payload.probabilities;
        return;

      case getType(setExchangeShopSelections): {
        const { exchangeShopId, selections } = action.payload;
        draft.selections = draft.selections || {};
        draft.selections[exchangeShopId] = selections;
      }
    }
  });
}