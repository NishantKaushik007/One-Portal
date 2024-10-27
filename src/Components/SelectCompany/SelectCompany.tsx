import { useState } from 'react';
import { companyList } from '../../Data/data'; // Ensure this path is correct
import Amazon from '../../Companies/Amazon/Amazon'; 
import Microsoft from '../../Companies/Microsoft/Microsoft'; 
import Netflix from '../../Companies/Netflix/Netflix';
import JPMorganChase from '../../Companies/JP Morgan Chase/JPMorganChase';
import Oracle from '../../Companies/Oracle/Oracle';
import PayPal from '../../Companies/PayPal/PayPal';
import Rippling from '../../Companies/Rippling/Rippling';
import Select from 'react-select';
import SelectCompanyStyle from './SelectCompanyStyle.module.css';

const SelectedCompany = () => {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    // Handle the change in selected company
    const handleCompanyChange = (selectedOption: { value: string; label: string } | null) => {
        setSelectedCompany(selectedOption ? selectedOption.value : null);
    };

    const companyOptions = companyList.map(option => ({
        label: option.value,
        value: option.value
    }));

    return (
        <div className={SelectCompanyStyle.container}>
            <label>
                Select Company:
                <Select
                    options={companyOptions}
                    onChange={handleCompanyChange}
                    isClearable // Allows the selection to be cleared
                    placeholder="Select a company..." // Placeholder text
                />
            </label>

            {/* Render the appropriate component based on the selected company */}
            {selectedCompany === "Amazon" && <Amazon selectedCompany={selectedCompany} />}
            {selectedCompany === "Microsoft" && <Microsoft selectedCompany={selectedCompany} />}
            {selectedCompany === "Netflix" && <Netflix selectedCompany={selectedCompany} />}
            {selectedCompany === "JP Morgan Chase" && <JPMorganChase selectedCompany={selectedCompany} />}
            {selectedCompany === "Oracle" && <Oracle selectedCompany={selectedCompany} />}
            {selectedCompany === "PayPal" && <PayPal selectedCompany={selectedCompany} />}
            {selectedCompany === "Rippling" && <Rippling selectedCompany={selectedCompany} />}
        </div>
    );
};

export default SelectedCompany;
