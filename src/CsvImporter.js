import moment from 'moment/moment';
import { useState } from 'react';
import TableComponent from './Table';
import Form from 'react-bootstrap/Form';
import { Alert } from 'react-bootstrap';

export default function CsvImporter() {
    const [workedTogether, setWorkedTogether] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const findColleaguesWithCommonProjects = (allEmployees) => {
        const projectIds = getProjectIds(allEmployees);
        const colleagues = [];
        projectIds.forEach(projectID => {
            const workedOnCommonProject = findColleaguesByProject(allEmployees, projectID);
            colleagues.push(...workedOnCommonProject);
        })
        if (colleagues.length < 1) {
            handleError("No one worked on the same project!");
        } else {
            findWhoWorkedMost(colleagues);
        }
    }

    const findColleaguesByProject = (employees, projectID) => {
        const projectEmployees = employees.filter(employee => employee.ProjectID === projectID);
        const colleagues = [];

        for (let i = 0; i < projectEmployees.length; i++) {
            const employeeA = projectEmployees[i];

            for (let j = i + 1; j < projectEmployees.length; j++) {
                const employeeB = projectEmployees[j];
                if (employeeA.DateFrom <= employeeB.DateTo && employeeB.DateFrom <= employeeA.DateTo) {
                    const mutualWorkedDays = calculateMutualWorkedDays(employeeA, employeeB);
                    const { startDate, endDate } = getCommonWorkPeriod(employeeA, employeeB);
                    colleagues.push({
                        employees: [employeeA.EmpID, employeeB.EmpID],
                        workedDays: mutualWorkedDays,
                        projectID: projectID,
                        period: `${moment(startDate).format("YYYY-MM-DD")} - ${moment(endDate).format("YYYY-MM-DD")}`
                    })
                }
            }
        }
        return colleagues;
    };

    const findWhoWorkedMost = (colleagues) => {
        let mostWorkedDays = 0;
        let mostWorkedColleagues = [];

        for (let i = 0; i < colleagues.length; i++) {
            const pair = colleagues[i];
            if (pair.workedDays > mostWorkedDays) {
                mostWorkedDays = pair.workedDays;
                mostWorkedColleagues = pair.employees;
            }
        }
        setWorkedTogether(getCommonProjects(mostWorkedColleagues, colleagues));
    }

    const getCommonProjects = (pair, colleagues) => {
        const [employee1, employee2] = pair;
        const filtered = colleagues.filter(pair => {
            const [worker1, worker2] = pair.employees;
            if (employee1 === worker1 &&
                employee2 === worker2) {
                return pair;
            } else {
                return false;
            }
        })
        return filtered;
    }

    const calculateMutualWorkedDays = (employee, colleague) => {
        const { startDate, endDate } = getCommonWorkPeriod(employee, colleague);
        const includeEndDay = 1;
        const totalDays = endDate.diff(startDate, "days") + includeEndDay;
        return totalDays;
    }

    const getCommonWorkPeriod = (employee, colleague) => {
        const startDate = moment.max(moment(employee.DateFrom), moment(colleague.DateFrom));
        const endDate = moment.min(moment(employee.DateTo), moment(colleague.DateTo));
        return { startDate, endDate };
    }

    const convertDateToStandardFormat = (employees) => {
        employees.forEach((employee) => {
            if (employee.DateTo.toLowerCase().includes("null")) {
                employee.DateFrom = moment(new Date(employee.DateFrom));
                employee.DateTo = moment(new Date());
            } else {
                employee.DateFrom = moment(new Date(employee.DateFrom));
                employee.DateTo = moment(new Date(employee.DateTo));
            }
        })
    }

    const parseFileToObjects = (content) => {
        const Papa = require('papaparse');
        const { data } = Papa.parse(content, {
            header: true,
            skipEmptyLines: 'greedy',
        });
        const hasInvalidData = data.some(employee => {
            if (!employee.EmpID ||
                !employee.ProjectID ||
                !moment(new Date(employee.DateFrom)).isValid() ||
                (!moment(new Date(employee.DateTo)).isValid()
                    && !employee.DateTo.toLowerCase().includes("null"))) {
                handleError("Invalid data found in csv file!");
                return true;
            } else if (moment(new Date(employee.DateFrom)) > moment(new Date(employee.DateTo)) &&
                !employee.DateTo.toLowerCase().includes("null")) {
                handleError("Found in csv file end date to be less then start date!");
                return true;
            }
            return false;
        });

        if (hasInvalidData) {
            return [];
        }
        convertDateToStandardFormat(data);
        return data;
    };

    const getProjectIds = (employers) => Array.from(new Set(employers.map(employee => employee.ProjectID)));

    const handleFileRead = (e) => {
        const content = e.target.result;
        const employees = parseFileToObjects(content);
        if (!content) {
            handleError("No correct data found in csv file!");
            return;
        }
        employees.length > 0 && findColleaguesWithCommonProjects(employees);
    }

    const handleError = (errorMsg) => {
        setErrorMessage(errorMsg);
        setWorkedTogether([]);
    }

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "text/csv") {
            errorMessage && setErrorMessage("");
            const reader = new FileReader();
            reader.onload = handleFileRead;
            reader.readAsText(file);
        } else {
            setErrorMessage("Selected file must be with a .csv extension!");
        }
    }
    return (
        <>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Import CSV file:</Form.Label>
                <Form.Control type="file" accept='.csv' onChange={handleUpload} />
            </Form.Group>
            {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}
            {workedTogether.length > 0 && <TableComponent workedTogether={workedTogether} />}
        </>
    )
}