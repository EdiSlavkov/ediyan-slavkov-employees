import moment from 'moment';
import Papa from 'papaparse';

const parseFileToObjects = (content, errorHandler) => {
    const { data } = Papa.parse(content, {
        header: true,
        skipEmptyLines: 'greedy',
    });

    const hasInvalidData = data.some(employee => {
        if (!employee.EmpID ||
            !employee.ProjectID ||
            !moment(new Date(employee.DateFrom)).isValid() ||
            (!moment(new Date(employee.DateTo)).isValid() &&
                !employee.DateTo?.toLowerCase().includes('null'))) {
            errorHandler('Invalid data found in CSV file!');
            return true;
        } else if (moment(new Date(employee.DateFrom)) > moment(new Date(employee.DateTo)) &&
            !employee.DateTo?.toLowerCase().includes('null')) {
            errorHandler('End date in CSV file is less than the start date!');
            return true;
        }
        return false;
    });

    if (hasInvalidData) {
        return [];
    }

    convertDateToStandardFormat(data);
    data.sort((e1, e2) => e1.EmpID - e2.EmpID);
    return data;
};

const convertDateToStandardFormat = (employees) => {
    employees.forEach((employee) => {
        if (employee.DateTo.toLowerCase().includes('null')) {
            employee.DateFrom = moment(new Date(employee.DateFrom));
            employee.DateTo = moment(new Date());
        } else {
            employee.DateFrom = moment(new Date(employee.DateFrom));
            employee.DateTo = moment(new Date(employee.DateTo));
        }
    });
};

const calculateMutualWorkedDays = (employee, colleague) => {
    const { startDate, endDate } = getCommonWorkPeriod(employee, colleague);
    const includeEndDay = 1;
    const totalDays = endDate.diff(startDate, 'days') + includeEndDay;
    return totalDays;
};

const getCommonWorkPeriod = (employee, colleague) => {
    const startDate = moment.max(moment(employee.DateFrom), moment(colleague.DateFrom));
    const endDate = moment.min(moment(employee.DateTo), moment(colleague.DateTo));
    return { startDate, endDate };
};

const findColleaguesWithCommonProjects = (allEmployees, errorHandler) => {
    const projectIds = getProjectIds(allEmployees);
    const colleagues = [];
    projectIds.forEach(projectID => {
        const workedOnCommonProject = findColleaguesByProject(allEmployees, projectID);
        colleagues.push(...workedOnCommonProject);
    })
    if (colleagues.length < 1) {
        errorHandler("No one worked on the same project!");
    } else {
        return findWhoWorkedMost(colleagues);
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
    let uniques = [];
    const uniqueEmployees = colleagues.map(obj => obj.employees);
    uniqueEmployees.forEach(employees => {
        if (!uniques.some(pair => pair.includes(employees[0]) && pair.includes(employees[1]))) {
            uniques.push(employees);
        }
    })
    let mostWorkedDays = 0;
    let mostWorkedColleagues = [];

    uniques.forEach(pairs => {
        let totalDays = 0;
        let workers;
        for (let i = 0; i < colleagues.length; i++) {
            const pair = colleagues[i];
            if (pair.employees[0] === pairs[0] && pair.employees[1] === pairs[1]) {
                totalDays += pair.workedDays;
                workers = pair.employees;
            }
        }
        if (totalDays > mostWorkedDays) {
            mostWorkedDays = totalDays;
            mostWorkedColleagues = workers;
        }
    })
    return getCommonProjects(mostWorkedColleagues, colleagues);
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

const getProjectIds = (employers) => Array.from(new Set(employers.map(employee => employee.ProjectID)));

export {
    findColleaguesWithCommonProjects,
    findColleaguesByProject,
    findWhoWorkedMost,
    getCommonProjects,
    getProjectIds,
    parseFileToObjects,
    calculateMutualWorkedDays
};