import Table from 'react-bootstrap/Table';

export default function TableComponent(props) {
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    {props.workedTogether[0].employees.map((e, i) => (
                        <th key={`employee-${i}`}>Employee #{i + 1} ID </th>
                    ))}
                    <th key="project-id">Project ID</th>
                    <th key="period">Period</th>
                    <th key="days-worked">Days worked</th>
                </tr>
            </thead>
            <tbody>
                {props.workedTogether.map((obj, i) => {
                    return (
                        <tr key={`row-${i}`}>
                            {obj.employees.map((employee, i) => <td key={`employeeId-${i}`}>{employee}</td>)}
                            <td key={"projectId"}>{obj.projectID}</td>
                            <td key={"period"}>{obj.period}</td>
                            <td key={"workedDays"}>{obj.workedDays}</td>
                        </tr>
                    )
                })}
                <tr>
                    <th key="totalDays" style={{ textAlign: "center" }} colSpan={5}>Total worked days: {props.workedTogether.reduce((sum, current) => sum += current.workedDays, 0)}</th>
                </tr>
            </tbody>
        </Table>
    );
}
