import { useEffect, useState } from 'react';
import { StatsPresenter, StatsView } from '../../presenter/StatsPresenter';
import { Table } from 'react-bootstrap';
import './Stats.css';
import { DeliverableStat } from '../../model/domain/DeliverableStat';
interface Props {
  setErrorMessage: (errorMessage: string | null) => void;
}

export function Stats(props: Props) {
  const [stats, setStats] = useState<Map<number, DeliverableStat> | null>(null);

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
      {stats === null ? (
        <h3>No Stats Available</h3>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Students Submitted</th>
              <th>Students Not Submitted</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(stats.entries()).map(([phase, data]) => (
              <tr key={phase}>
                <td>{phase}</td>
                <td>
                  <button onClick={() => props.setErrorMessage(`On Time: ${data.studentsOnTime.length}, Late: ${data.studentsLate.length}`)}>
                    {data.studentsSubmitted.length}
                  </button>
                  <div>
                    {data.studentsOnTime.length > 0 && (
                      <button onClick={() => props.setErrorMessage(`On Time: ${data.studentsOnTime.join(', ')}`)}>Show On Time</button>
                    )}
                    {data.studentsLate.length > 0 && (
                      <button onClick={() => props.setErrorMessage(`Late: ${data.studentsLate.join(', ')}`)}>Show Late</button>
                    )}
                  </div>
                </td>
                <td>
                  <button onClick={() => props.setErrorMessage(`Not Submitted: ${data.studentsNotSubmitted.join(', ')}`)}>
                    {data.studentsNotSubmitted.length}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
