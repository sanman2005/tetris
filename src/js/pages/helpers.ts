import { pagesPath } from './';

export const getUserProjectsPath = (userId: string) =>
  `${pagesPath.project}/?user=${userId}`;
