declare module 'caritat' {
  export interface ElectionOptions {
    candidates: string[];
    allowTies?: boolean;
  }

  export class Election {
    constructor(options: ElectionOptions);
    addBallot(ballot: string[]): void;
    schulze(): string[];
  }
}