import React from 'react';

import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

function ConversationSelect({ conversationMode, setConversationMode, conversationStart, setConversationStart, setConversationStartIndex, messages }) {
    const options = [
        { value: '1000', text: 'start from the very beginning' },
        { value: '3', text: 'include last 3 questions' },
        { value: '2', text: 'include last two questions' },
        { value: '1', text: 'include the last question' },
        { value: '0', text: 'start from next question' }
    ]
    return (

        <Dropdown as={ButtonGroup}>
            <ToggleButton type="checkbox" variant="outline-primary" onClick={() => {
                if (conversationMode === 'on') {
                    setConversationMode('off')
                    setConversationStartIndex(getStartIndex(messages, 'off', conversationStart))
                } else if (conversationMode === 'off') {
                    setConversationMode('on')
                    setConversationStartIndex(getStartIndex(messages, 'on', conversationStart))
                }
            }} checked={conversationMode === 'on'}>Context: {conversationMode}</ToggleButton>

            <Dropdown.Toggle split variant="outline-primary" id="dropdown-split-basic" />

            <Dropdown.Menu>
                <Dropdown.Header>Choose where the conversation begins: </Dropdown.Header>
                {options.map((option) => {
                    return (
                        <Dropdown.Item href="#" onClick={() => {
                            setConversationMode('on');
                            setConversationStart(option.value);
                            setConversationStartIndex(getStartIndex(messages, 'on', option.value))
                        }} key={option.value}>{option.text} {conversationStart === option.value && conversationMode === 'on' && '✔'}</Dropdown.Item>
                    )
                })}
            </Dropdown.Menu>
        </Dropdown>

    )
}

const getStartIndex = (messages, mode, startFrom) => {
    if (mode === 'off') {
        return 10000
    } else {
        let i = messages.length
        let count_user = 0
        while (i >= 0 && count_user < parseInt(startFrom)) {
            i -= 1
            if (i >= 0 && messages[i].role === 'user') {
                count_user += 1
            }
        }
        return Math.max(i, 0)
    }
}

export default ConversationSelect;