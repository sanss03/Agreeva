const store = new Map();

function getHistory(sessionId) {
  return store.get(sessionId) || [];
}

function addMessage(sessionId, role, content) {
  const history = getHistory(sessionId);
  history.push({ role, content });
  store.set(sessionId, history);
}

function clearHistory(sessionId) {
  store.delete(sessionId);
}

function createSession() {
  const sessionId = Math.random().toString(36).substring(2);
  store.set(sessionId, []);
  return sessionId;
}

function getAllSessions() {
  return Array.from(store.keys());
}

module.exports = {
  getHistory,
  addMessage,
  clearHistory,
  createSession,
  getAllSessions
};
