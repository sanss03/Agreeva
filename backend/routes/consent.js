const express = require('express');
const router = express.Router();

// Local map for consent sessions
const consentStore = new Map();

router.post('/session', (req, res) => {
  const { user_name, document_summary } = req.body;
  
  if (!user_name) {
    return res.status(400).json({ error: "Missing user_name" });
  }

  const sessionId = Math.random().toString(36).substring(2);
  const now = new Date().toISOString();

  const sessionData = {
    sessionId,
    userName: user_name,
    documentSummary: document_summary || '',
    status: 'pending',
    consentChecks: {
      readUnderstood: false,
      financialCommitment: false,
      risksAcknowledged: false
    },
    voiceConfirmed: false,
    quizPassed: false,
    auditLog: [{
      action: 'session_started',
      timestamp: now,
      metadata: { user_name }
    }],
    createdAt: now,
    confirmedAt: null
  };

  consentStore.set(sessionId, sessionData);

  res.json({ session_id: sessionId, created_at: now });
});

router.post('/session/:id/confirm', (req, res) => {
  const { id } = req.params;
  const session = consentStore.get(id);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const { consent_checks, voice_confirmed, quiz_passed } = req.body;
  
  if (!consent_checks || 
      !consent_checks.readUnderstood || 
      !consent_checks.financialCommitment || 
      !consent_checks.risksAcknowledged) {
    return res.status(400).json({ error: "All consent boxes must be checked" });
  }

  const now = new Date().toISOString();

  session.consentChecks = consent_checks;
  session.voiceConfirmed = !!voice_confirmed;
  session.quizPassed = !!quiz_passed;
  session.status = 'confirmed';
  session.confirmedAt = now;

  session.auditLog.push({
    action: 'consent_confirmed',
    timestamp: now,
    metadata: {
      voice_confirmed: session.voiceConfirmed,
      quiz_passed: session.quizPassed,
      consent_checks
    }
  });

  consentStore.set(id, session);

  res.json({
    confirmed: true,
    session_id: id,
    consent_id: "SS-" + id.toUpperCase(),
    timestamp: now
  });
});

router.post('/session/:id/reject', (req, res) => {
  const { id } = req.params;
  const session = consentStore.get(id);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const now = new Date().toISOString();

  session.status = 'rejected';
  session.auditLog.push({
    action: 'consent_rejected',
    timestamp: now,
    metadata: {}
  });

  consentStore.set(id, session);

  res.json({ rejected: true, session_id: id });
});

router.get('/session/:id/audit', (req, res) => {
  const { id } = req.params;
  const session = consentStore.get(id);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  res.json(session);
});

router.get('/sessions', (req, res) => {
  const allSessions = [];
  for (const session of consentStore.values()) {
    allSessions.push({
      session_id: session.sessionId,
      user_name: session.userName,
      status: session.status,
      created_at: session.createdAt,
      confirmed_at: session.confirmedAt
    });
  }

  res.json(allSessions);
});

module.exports = router;
