import { useState } from 'react';
import { companyList } from '../../Data/data'; // Ensure this path is correct
import Select, { components } from 'react-select';
import Amazon from '../../Companies/Amazon/Amazon'; 
import Microsoft from '../../Companies/Microsoft/Microsoft'; 
import Netflix from '../../Companies/Netflix/Netflix';
import JPMorganChase from '../../Companies/JP Morgan Chase/JPMorganChase';
import Oracle from '../../Companies/Oracle/Oracle';
import PayPal from '../../Companies/PayPal/PayPal';
import Rippling from '../../Companies/Rippling/Rippling';
import AMD from '../../Companies/AMD/AMD';
import GitHub from '../../Companies/GitHub/GitHub';
import Atlassian from '../../Companies/Atlassian/Atlassian'
import Qualcomm from '../../Companies/Qualcomm/Qualcomm';
import SumoLogic from '../../Companies/SumoLogic/SumoLogic';
import MorganStanley from '../../Companies/Morgan Stanley/MorganStanley';
import MakeMyTrip from '../../Companies/Make My Trip/MakeMyTrip';
import Siemens from '../../Companies/Siemens/Siemens'
import AmericanExpress from '../../Companies/American Express/AmericanExpress'

// Define the type for the option
interface CompanyOption {
    label: string; // Displayed name
    value: string; // Internal value
    icon: string;  // Icon URL
}

// Custom option component for Select
const CustomOption = (props: any) => {
    const { data } = props;
    return (
        <components.Option {...props}>
            <div className="flex items-center">
                <img src={data.icon} alt={data.label} className="w-5 mr-2" />
                <span>{data.label}</span>
            </div>
        </components.Option>
    );
};

const SelectedCompany = () => {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    // Handle the change in selected company
    const handleCompanyChange = (selectedOption: CompanyOption | null) => {
        setSelectedCompany(selectedOption ? selectedOption.value : null);
    };

    const companyOptions: CompanyOption[] = companyList.map(option => ({
        label: option.value,
        value: option.value,
        icon: option.icon // Include the icon URL
    }));

    return (
        <div className="p-4">
            <label className="block mb-2">
                Select Company:
                <Select
                    options={companyOptions}
                    onChange={handleCompanyChange}
                    isClearable
                    placeholder="Select a company..."
                    components={{ Option: CustomOption }} // Use the custom option
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
            {selectedCompany === "AMD" && <AMD selectedCompany={selectedCompany} />}
            {selectedCompany === "GitHub" && <GitHub selectedCompany={selectedCompany} />}
            {selectedCompany === "Atlassian" && <Atlassian selectedCompany={selectedCompany} />}
            {selectedCompany === "Qualcomm" && <Qualcomm selectedCompany={selectedCompany} />}
            {selectedCompany === "Sumo Logic" && <SumoLogic selectedCompany={selectedCompany} />}
            {selectedCompany === "Morgan Stanley" && <MorganStanley selectedCompany={selectedCompany} />}
            {selectedCompany === "Make My Trip" && <MakeMyTrip selectedCompany={selectedCompany} />}
            {selectedCompany === "Siemens" && <Siemens selectedCompany={selectedCompany} />}
            {selectedCompany === "American Express" && <AmericanExpress selectedCompany={selectedCompany} />}
        </div>
    );
};

export default SelectedCompany;
