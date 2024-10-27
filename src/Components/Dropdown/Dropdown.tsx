import React from 'react';
import DropdownStyle from './DropdownStyle.module.css';
import Select from 'react-select';

interface IOption {
    label: string;
    value: string;
}

interface IDropdownProps {
    label?: string;
    options: IOption[];
    value?: IOption | null; // Adjusted to match the value type of react-select
    onChange?: (newValue: IOption | null) => void; // Adjusted for react-select's onChange signature
}

export const Dropdown: React.FC<IDropdownProps> = (props) => {
    const { label, options, value, onChange } = props;

    return (
        <div className={DropdownStyle.container}>
            {label && <label>{label}</label>}
            <Select
                value={value}
                onChange={onChange}
                options={options}
                placeholder={`Select ${label}`}
                isClearable // Optional: allows clearing the selection
            />
        </div>
    );
};
