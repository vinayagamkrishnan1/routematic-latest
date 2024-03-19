export default function print(title, message) {
  if (__DEV__) {
    if (message) console.warn(title + " : " + message);
    else console.warn(title);
  }
}
