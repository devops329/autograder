import { useEffect, useState } from 'react';
import { StatsPresenter, StatsView } from '../../presenter/StatsPresenter';
import { Button, Table } from 'react-bootstrap';
import './Stats.css';
import { DeliverableStat } from '../../model/domain/DeliverableStat';
interface Props {
  setModalMessage: (message: string | null) => void;
  setModalTitle: (title: string | null) => void;
}

export function Stats(props: Props) {
  const [stats, setStats] = useState<Map<number, DeliverableStat> | null>(null);

  const listener: StatsView = {
    setStats: setStats,
    setError: props.setModalMessage,
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
              <th>Submitted On Time</th>
              <th>Submitted Late</th>
              <th>No Submission</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(stats.entries()).map(([phase, data]) => (
              <tr key={phase}>
                <td>{phase}</td>
                {(['studentsOnTime', 'studentsLate', 'studentsNotSubmitted'] as (keyof DeliverableStat)[]).map((key, index) => (
                  <td key={index}>
                    <Button
                      style={{ width: '3rem' }}
                      onClick={() => {
                        props.setModalTitle(`Phase ${phase}`);
                        props.setModalMessage(data[key].sort().join(', '));
                      }}>
                      {data[key].length}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
