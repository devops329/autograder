import { useEffect, useState } from 'react';
import { StatsPresenter, StatsView } from '../../presenter/StatsPresenter';
import { Table } from 'react-bootstrap';
interface Props {
  setErrorMessage: (errorMessage: string | null) => void;
}

interface Stat {
  phase: number;
  submissionCount: number;
  studentCount: number;
}

export function Stats(props: Props) {
  const [stats, setStats] = useState<Stat[]>([]);
  const listener: StatsView = {
    setStats: setStats,
    setError: props.setErrorMessage,
  };
  const presenter = new StatsPresenter(listener);
  useEffect(() => {
    const getStats = async () => {
      await presenter.getStats();
    };
    getStats();
  }, []);

  return (
    <>
      <h1>Deliverable Stats</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Phase</th>
            <th>Submission Count</th>
            <th>Student Count</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((item, index) => (
            <tr key={index}>
              <td>{item.phase}</td>
              <td>{item.submissionCount}</td>
              <td>{item.studentCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
