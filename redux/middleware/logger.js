const logger = () => (next) => (action) => {
  console.log(`%cRedux Log: %c${action.type}`, "color: red; font-weight: bold;", "color: blue", action);
  next(action);
}
export default logger;
