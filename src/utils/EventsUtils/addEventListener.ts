export const addEventListener = (event: any, eventName: any, callback: () => void) => {
  if (!event) event = Object.create(null);

  event[eventName] = callback;
};
