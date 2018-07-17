import * as React from 'react';

import { RecordMateriaDetail } from '../../actions/recordMateria';
import { RecordMateriaTableGroup } from './RecordMateriaTableGroup';

import tables from './StatBuffsDefinitions';

interface Props {
  recordMateria: { [id: number]: RecordMateriaDetail };
}

export class StatBuffs extends React.Component<Props> {
  render() {
    const { recordMateria } = this.props;
    return <RecordMateriaTableGroup id="statBuff" recordMateria={recordMateria} tables={tables}/>;
  }
}