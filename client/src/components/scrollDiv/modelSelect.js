import React from 'react';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';


function ModelSelect({ model, setModel }) {
    const modelNames = { 'gpt-3.5-turbo': 'V3.5', 'gpt-4': 'V4' }

    return (
        <DropdownButton
            variant="outline-secondary"
            title={modelNames[model]}
            id="input-group-dropdown-1"
        >
            <Dropdown.Header>Select Model:</Dropdown.Header>
            {Object.keys(modelNames).map((k) => {
                return (
                    <Dropdown.Item href='#' data-model-short={modelNames[k]} data-model={k} onClick={() => { setModel(k) }} key={k}> {k} {k === model && "✔"}</Dropdown.Item>
                )
            })}
        </DropdownButton >
    )
}

export default ModelSelect;