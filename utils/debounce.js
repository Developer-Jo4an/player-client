export default function debounce(cb, duration) {
  let timeout;
  let _clearTimeout = clearTimeout;
  let _setTimeout = setTimeout;

  if (!duration) {
    _clearTimeout = cancelAnimationFrame;
    _setTimeout = requestAnimationFrame;
  }

  return function debounced(...args) {
    _clearTimeout(timeout);
    timeout = _setTimeout(() => cb.apply(this, args), duration);
  };
}
