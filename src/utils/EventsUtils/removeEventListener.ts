export const removeEventListener = (events: any[], name: string, reqId: any) => {
  if (!events[reqId]) return;

  delete events[reqId][name];

  if (!Object.keys(events[reqId]).length) delete events[reqId];
};
