const _md = require('markdown-it')();

export default function md(txt) {
  return _md.render(txt);
}
