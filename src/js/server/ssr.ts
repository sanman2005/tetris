import { apiHasActiveCalls } from './api';

export default async (url: string) => new Promise((onSuccess) => {
  const interval = setInterval(
    () => {
      if (!apiHasActiveCalls()) {
        clearInterval(interval);
        onSuccess();
      }
    },
    10);
});
