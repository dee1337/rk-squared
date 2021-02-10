import * as Modal from 'react-modal';
/*
import { library } from '@fortawesome/fontawesome-svg-core';
import { faApple } from '@fortawesome/free-brands-svg-icons/faApple';
import { faWindows } from '@fortawesome/free-brands-svg-icons/faWindows';
import { faDiceD20 } from '@fortawesome/pro-light-svg-icons/faDiceD20';
import { faArchive } from '@fortawesome/pro-solid-svg-icons/faArchive';
import { faArrowDown } from '@fortawesome/pro-solid-svg-icons/faArrowDown';
import { faCertificate } from '@fortawesome/pro-solid-svg-icons/faCertificate';
import { faCheck } from '@fortawesome/pro-solid-svg-icons/faCheck';
import { faChevronDown } from '@fortawesome/pro-solid-svg-icons/faChevronDown';
import { faCoffeeTogo } from '@fortawesome/pro-solid-svg-icons/faCoffeeTogo';
import { faCog } from '@fortawesome/pro-solid-svg-icons/faCog';
import { faEllipsisH } from '@fortawesome/pro-solid-svg-icons/faEllipsisH';
import { faExclamationTriangle } from '@fortawesome/pro-solid-svg-icons/faExclamationTriangle';
import { faExternalLink } from '@fortawesome/pro-solid-svg-icons/faExternalLink';
import { faLock } from '@fortawesome/pro-solid-svg-icons/faLock';
import { faLockOpen } from '@fortawesome/pro-solid-svg-icons/faLockOpen';
import { faQuestion } from '@fortawesome/pro-solid-svg-icons/faQuestion';
import { faSearch } from '@fortawesome/pro-solid-svg-icons/faSearch';
import { faStar } from '@fortawesome/pro-solid-svg-icons/faStar';
import { faUnlock } from '@fortawesome/pro-solid-svg-icons/faUnlock';
*/

// https://stackoverflow.com/a/37480521/25507
// We could use jQuery Slim, but if we use that, our bundle still pulls in
// jQuery.  (Why?)  Should we use a CDN here instead?
const w = window as any;
w.$ = w.jQuery = require('jquery');
require('popper.js');
require('bootstrap');

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import './app.global.scss';

/*
library.add(
  faApple,
  faArchive,
  faArrowDown,
  faCertificate,
  faCheck,
  faChevronDown,
  faCoffeeTogo,
  faCog,
  faDiceD20,
  faEllipsisH,
  faExclamationTriangle,
  faExternalLink,
  faLock,
  faLockOpen,
  faQuestion,
  faSearch,
  faStar,
  faUnlock,
  faWindows,
);
*/
export function initializeGlobalStyles(rootNode: HTMLElement) {
  Modal.setAppElement(rootNode);
}
