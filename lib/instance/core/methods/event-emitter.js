module.exports = {
  $on(ev, listener) {
    this._emitter.on(ev, listener.bind(this));
  },
  $onAny(listener) {
    this._emitter.onAny(ev, listener.bind(this));
  },
  $once(ev, listener) {
    this._emitter.once(ev, listener.bind(this));
  },
  $emit(...args) {
    this._emitter.emit(...args);
  }
};
