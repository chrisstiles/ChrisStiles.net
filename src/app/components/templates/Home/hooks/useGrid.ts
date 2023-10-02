import { useContext } from 'react';
import { HomeTemplateContext } from '../Home';

export default function useGrid() {
  return useContext(HomeTemplateContext).grid;
}
