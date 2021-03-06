import React, { PropTypes } from 'react';
import symbols from '../../inventory/sbol';

import '../../styles/Picker.css';
import '../../styles/SymbolPicker.css';

export const SymbolPicker = ({current, onSelect}) => {
  return (
    <div className="Picker SymbolPicker">
      <div className="Picker-content">
        {symbols.map(symbolObj => {
          const symbol = symbolObj.id;
          return (<a className={'Picker-item' + (current === symbol ? ' active' : '')}
                     alt={symbolObj.metadata.name}
                     title={symbolObj.metadata.name}
                     key={symbol}
                     onClick={onSelect.bind(this, symbol)}
                     style={{backgroundImage: `url(${symbolObj.metadata.imageThin})`}}/>);
        })}
        <a className={'Picker-item' + (!current ? ' active' : '')}
           style={{backgroundImage: `url(/images/sbolSymbols/thin/no_symbol.svg)`}}
           onClick={onSelect.bind(this, null)}/>
      </div>
    </div>
  );
};

SymbolPicker.propTypes = {
  current: PropTypes.string,
  onSelect: PropTypes.func,
};

export default SymbolPicker;
