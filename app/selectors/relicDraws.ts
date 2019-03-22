import { createSelector } from 'reselect';

import * as _ from 'lodash';

import { RelicDrawBanner, RelicDrawGroup } from '../actions/relicDraws';
import { enlir } from '../data/enlir';
import { IState } from '../reducers';
import { RelicDrawState } from '../reducers/relicDraws';
import { getOwnedLegendMateria, getOwnedSoulBreaks } from './characters';

export interface RelicDrawBannerDetails extends RelicDrawBanner {
  totalCount?: number;
  dupeCount?: number;
}

export interface RelicDrawGroupDetails extends RelicDrawGroup {
  bannerCount: number;
  canPull: boolean;
  canSelect: boolean;
  canPullOrSelectCount: number;
}

export type RelicDrawBannerOrGroup = RelicDrawBannerDetails | RelicDrawGroupDetails;

export function isGroup(item: RelicDrawBannerOrGroup): item is RelicDrawGroupDetails {
  return 'groupName' in item;
}

function getDupeCount(
  relicIds: number[],
  ownedSoulBreaks: Set<number> | undefined,
  ownedLegendMateria: Set<number> | undefined,
): number | undefined {
  if (!ownedSoulBreaks || !ownedLegendMateria) {
    return undefined;
  }

  return (
    _.filter(
      relicIds,
      i => enlir.relicSoulBreaks[i] && ownedSoulBreaks.has(enlir.relicSoulBreaks[i].id),
    ).length +
    _.filter(
      relicIds,
      i => enlir.relicLegendMateria[i] && ownedLegendMateria.has(enlir.relicLegendMateria[i].id),
    ).length
  );
}

export interface RelicDrawBannersAndGroups {
  // Indexed by group name - 'undefined' if no group
  [group: string]: RelicDrawBannerOrGroup[];
}

export const getBannersAndGroups = createSelector<
  IState,
  RelicDrawState,
  Set<number> | undefined,
  Set<number> | undefined,
  RelicDrawBannersAndGroups
>(
  (state: IState) => state.relicDraws,
  getOwnedSoulBreaks,
  getOwnedLegendMateria,
  ({ banners, groups, probabilities }, ownedSoulBreaks, ownedLegendMateria) => {
    const result: { [group: string]: RelicDrawBannerOrGroup[] } = {};

    for (const group of [..._.keys(groups), undefined]) {
      const groupName = '' + group;

      const bannerDetails: RelicDrawBannerDetails[] = _.filter(banners, i => i.group === group).map(
        i => {
          if (i.bannerRelics && i.bannerRelics.length !== 0) {
            return {
              ...i,
              totalCount: i.bannerRelics.length,
              dupeCount: getDupeCount(i.bannerRelics, ownedSoulBreaks, ownedLegendMateria),
            };
          } else if (probabilities[i.id]) {
            const allRelics = _.keys(probabilities[i.id].byRelic).map(j => +j);
            return {
              ...i,
              totalCount: allRelics.length,
              dupeCount: getDupeCount(allRelics, ownedSoulBreaks, ownedLegendMateria),
            };
          } else {
            return i;
          }
        },
      );

      result[groupName] = bannerDetails;

      // If this is the root (undefined) group, then extend with all child groups.
      if (!group) {
        result[groupName].push(
          ..._.values(groups).map(g => {
            const groupBanners = _.filter(banners, i => i.group === g.groupName);
            return {
              ...g,
              bannerCount: groupBanners.length,
              canPull: _.some(groupBanners, i => i.canPull),
              canSelect: _.some(groupBanners, i => i.canSelect),
              canPullOrSelectCount: _.sumBy(groupBanners, i => +(i.canPull || i.canSelect)),
            };
          }),
        );
      }

      result[groupName] = _.sortBy(result[groupName], i => -i.sortOrder);
    }

    return result;
  },
);
