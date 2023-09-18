import * as colorVars from '@colors';

export const pieces: Piece[] = [
  {
    color: colorVars.greenAccent,
    maxRotations: 1,
    shape: [
      ['', '', '', ''],
      ['■', '■', '■', '■'],
      ['', '', '', ''],
      ['', '', '', '']
    ]
  },
  {
    color: colorVars.yellowAccent,
    maxRotations: 3,
    shape: [
      ['■', '', ''],
      ['■', '■', '■'],
      ['', '', '']
    ]
  },
  {
    color: colorVars.redAccent,
    maxRotations: 3,
    shape: [
      ['', '', '■'],
      ['■', '■', '■'],
      ['', '', '']
    ]
  },
  {
    color: '#EE1FF2',
    maxRotations: 0,
    shape: [
      ['■', '■'],
      ['■', '■']
    ]
  },
  {
    color: '#FD640F',
    maxRotations: 1,
    shape: [
      ['', '■', '■'],
      ['■', '■', ''],
      ['', '', '']
    ]
  },
  {
    color: '#3D50FF',
    maxRotations: 3,
    shape: [
      ['', '■', ''],
      ['■', '■', '■'],
      ['', '', '']
    ]
  },
  {
    color: '#8840FF',
    maxRotations: 1,
    shape: [
      ['■', '■', ''],
      ['', '■', '■'],
      ['', '', '']
    ]
  }
];

export type Piece = {
  color: string;
  maxRotations: number;
  shape: string[][];
};

export default pieces;
