import React from 'react';
import DropdownStyle from './DropdownStyle.module.css';

interface IOption {
    label: string;
    value: string;
}

interface IDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: IOption[];
    value?: string;
}

export const Dropdown: React.FC<IDropdownProps> = (props) => {
    const { label, options, value, onChange } = props;

    return (
        <div className={DropdownStyle.container}>
            <label>{label}</label>
            <select value={value} onChange={onChange}>
                <option value="">Select {label}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
