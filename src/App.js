import styles from './App.module.css';
import CsvImporter from './CsvImporter';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Container className={styles.centerContainer}>
      <CsvImporter />
    </Container>
  );
}

export default App;