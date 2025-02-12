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
              <th>Students Submitted</th>
              <th>Students Not Submitted</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(stats.entries()).map(([phase, data]) => (
              <tr key={phase}>
                <td>{phase}</td>
                <td>
                  <Button
                    onClick={() => {
                      props.setModalTitle(`Phase ${phase}`);
                      props.setModalMessage(`On Time: ${data.studentsOnTime.length}, Late: ${data.studentsLate.length}`);
                    }}>
                    {data.studentsSubmitted.length}
                  </Button>
                  <div>
                    {data.studentsOnTime.length > 0 && (
                      <Button
                        onClick={() => {
                          props.setModalTitle(`Phase ${phase}`);
                          props.setModalMessage(`On Time: ${data.studentsOnTime.join(', ')}`);
                        }}>
                        Show On Time
                      </Button>
                    )}
                    {data.studentsLate.length > 0 && (
                      <Button
                        onClick={() => {
                          props.setModalTitle(`Phase ${phase}`);
                          props.setModalMessage(`Late: ${data.studentsLate.join(', ')}`);
                        }}>
                        Show Late
                      </Button>
                    )}
                  </div>
                </td>
                <td>
                  <Button
                    onClick={() => {
                      props.setModalTitle(`Phase ${phase}`);
                      props.setModalMessage(`Not Submitted: ${data.studentsNotSubmitted.join(', ')}`);
                    }}>
                    {data.studentsNotSubmitted.length}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
