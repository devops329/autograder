import { Fragment, useEffect, useState } from 'react';
import { StatsPresenter, StatsView } from '../../presenter/StatsPresenter';
import { Table } from 'react-bootstrap';
import './Stats.css';
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
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [netIds, setNetIds] = useState<string[] | undefined>([]);

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

  const getNetIdsForDeliverablePhase = async (phase: number) => {
    const netIds = await presenter.getNetIdsForDeliverablePhase(phase);
    setNetIds(netIds); // Assume `data` is an array of netids
    setExpandedRow(phase);
  };

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
            <Fragment key={index}>
              <tr
                onClick={() => {
                  expandedRow ? setExpandedRow(null) : getNetIdsForDeliverablePhase(item.phase);
                }}>
                <td>{item.phase}</td>
                <td>{item.submissionCount}</td>
                <td>{item.studentCount}</td>
              </tr>
              {expandedRow === item.phase && netIds && (
                <tr onClick={() => setExpandedRow(null)}>
                  <td colSpan={3}>
                    <strong>Net IDs:</strong>
                    <ul className="netids">
                      {netIds.map((netid, i) => (
                        <li key={i}>{netid}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </Table>
    </>
  );
}
