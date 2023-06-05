import { useState } from 'react';
import TableComponent from './Table';
import Form from 'react-bootstrap/Form';
import { Alert } from 'react-bootstrap';
import { parseFileToObjects, findColleaguesWithCommonProjects } from './Utils';

export default function CsvImporter() {
    const [workedTogether, setWorkedTogether] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const handleFileRead = (e) => {
        const content = e.target.result;
        const employees = parseFileToObjects(content, handleError);
        if (!content) {
            handleError("No correct data found in csv file!");
            return;
        }
        employees.length > 0 && setWorkedTogether(findColleaguesWithCommonProjects(employees, handleError));
    }

    const handleError = (errorMsg) => {
        setErrorMessage(errorMsg);
        setWorkedTogether([]);
    }

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        if (file.type === "text/csv") {
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