import React, { useState } from 'react';
import { Dropdown } from '../Dropdown';
import { companyList } from '../../Data/data'; // Ensure this path is correct
import Amazon from '../../Companies/Amazon/Amazon'; // Import the Amazon component
import Microsoft from '../../Companies/Microsoft/Microsoft'; // Import the Microsoft component
import SelectCompanyStyle from './SelectCompanyStyle.module.css';
import Netflix from '../../Companies/Netflix/Netflix';
import JPMorganChase from '../../Companies/JP Morgan Chase/JPMorganChase';
import Oracle from '../../Companies/Oracle/Oracle';
import PayPal from '../../Companies/PayPal/PayPal';

const SelectedCompany = () => {
    const [selectedCompany, setSelectedCompany] = useState<string>("");

    // Handle the change in selected company
    const handleCompanyChange = (event: React.SyntheticEvent<HTMLSelectElement>) => {
        setSelectedCompany(event.currentTarget.value);
    };

    return (
        <div className={SelectCompanyStyle.container}>
            <label>
                Select Company:
                <Dropdown
                    options={companyList.map(option => ({
                        label: option.value,
                        value: option.value
                    }))}
                    onChange={handleCompanyChange}
                />
            </label>

            {/* Render the appropriate component based on the selected company */}
            {selectedCompany === "Amazon" && <Amazon selectedCompany={selectedCompany} />}
            {selectedCompany === "Microsoft" && <Microsoft selectedCompany={selectedCompany} />}
            {selectedCompany === "Netflix" && <Netflix selectedCompany={selectedCompany} />}
            {selectedCompany === "JP Morgan Chase" && <JPMorganChase selectedCompany={selectedCompany} />}
            {selectedCompany === "Oracle" && <Oracle selectedCompany={selectedCompany} />}
            {selectedCompany === "PayPal" && <PayPal selectedCompany={selectedCompany} />}
        </div>
    );
};

export default SelectedCompany;
