import { config } from './config';
import { Request, Response, NextFunction } from 'express';

type Level = 'info' | 'warn' | 'error';

export class Logger {
  httpLogger = (req: Request, res: Response, next: NextFunction): void => {
    let send = res.send;
    res.send = (resBody: any): any => {
      const logData = {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        reqBody: JSON.stringify(req.body),
        resBody: JSON.stringify(resBody),
      };
      const level = this.statusToLogLevel(res.statusCode);
      this.log(level, { type: 'http' }, logData);
      res.send = send;
      return res.send(resBody);
    };
    next();
  };

  log(level: Level, labels: { [key: string]: string }, logData: Object) {
    const stream = { component: config.logging.source, level: level, ...labels };
    const values = [this.nowString(), this.sanitize(logData)];
    const logEvent = { streams: [{ stream: stream, values: [values] }] };

    this.sendLogToGrafana(logEvent);
  }

  statusToLogLevel(statusCode: number) {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
  }

  nowString() {
    return (Math.floor(Date.now()) * 1000000).toString();
  }

  sanitize(logData: Object) {
    const logString = JSON.stringify(logData);
    return logString.replace(/\\"password\\":\s*\\"[^"]*\\"/g, '\\"password\\": \\"*****\\"');
  }

  sendLogToGrafana(event: Object) {
    const body = JSON.stringify(event);
    fetch(`${config.logging.url}`, {
      method: 'post',
      body: body,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.logging.userId}:${config.logging.apiKey}`,
      },
    }).then((res) => {
      if (!res.ok) console.error('Failed to send log to Grafana');
    });
  }
}

export default new Logger();
